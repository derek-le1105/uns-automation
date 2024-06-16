const axios = require("axios");
const express = require("express");
const router = express.Router();
const readline = require("readline");
const fs = require("fs");

const getBulkData = require("../helper/getBulkData");
const importBulkData = require("../helper/importBulkData");
const { getShopifyPlants } = require("../helper/shopifyGQLStrings");
const { compare } = require("../helper/transhipHelper");

const apcFileName = "apc-ts";

require("dotenv").config();

const productUpdateString = `ProductUpdate(input: $input) { 
  product {
      id 
      status
      title
  } `;

const variantUpdateString = `ProductVariantUpdate(input: $input) { 
  product {
      id
      inventoryPolicy
  } `;

const parseData = async (filename) => {
  const dataContainer = [];
  function processJSONLData() {
    return new Promise((resolve, reject) => {
      const jsonlFilePath = `${filename}.jsonl`; // The path to the downloaded JSONL file
      const readStream = readline.createInterface({
        input: fs.createReadStream(jsonlFilePath),
      });
      readStream.on("line", (line) => {
        try {
          const cleanLine = line.replace(/'/g, "");
          const jsonData = JSON.parse(cleanLine);
          if (!jsonData.id.includes("ProductVariant")) {
            dataContainer.push({
              id: jsonData.id,
              status: jsonData.status,
              title: jsonData.title,
              variants: [],
            });
          } else {
            dataContainer[dataContainer.length - 1].variants.push({
              id: jsonData.id,
              barcode: jsonData.barcode,
              inventoryPolicy: jsonData.inventoryPolicy,
            });
          }
        } catch (error) {
          //TODO: handle error when reading line stops abruptly
          console.error("Error parsing JSON:", error);
        }
      });

      readStream.on("close", () => {
        resolve(dataContainer); // Resolve the Promise when processing is complete
      });
    });
  }

  // Call the async function to start processing JSONL data
  return processJSONLData().then((data) => {
    return data;
  });
};
router.post("/", async (req, res) => {
  let apc_stocklist_codes = req.body;
  try {
    let shopifyAPCPlants = await getBulkData(
      getShopifyPlants("CPA-TS"),
      parseData,
      apcFileName
    );

    let productUpdateList = [],
      productUpdateVariantList = [],
      notOnShopifyList = [];

    let barcodeExistsMap = compareShopifyAPC(
      shopifyAPCPlants,
      apc_stocklist_codes
    );
    //tracks which product variants to make active
    shopifyAPCPlants.forEach((product) => {
      let [productToUpdate, variantToUpdate] = compare(
        product,
        barcodeExistsMap
      );

      if (productToUpdate.status !== product.status) {
        let { variants, ...rest } = productToUpdate;
        productUpdateList.push(rest);
      }

      variantToUpdate.forEach((variant) => {
        if (
          barcodeExistsMap[variant.barcode]["inventoryPolicy"] !==
          variant.inventoryPolicy
        ) {
          let { barcode, ...rest } = variant;
          productUpdateVariantList.push(rest);
        }
      });
    });

    await importBulkData(productUpdateList, "apctest", productUpdateString);
    await importBulkData(
      productUpdateVariantList,
      "apcvarianttest",
      variantUpdateString
    );
    return res.status(200).json("Successfully updated products");
  } catch (error) {
    console.log(error);
    return res.status(404).json(error);
  }
});

const compareShopifyAPC = (shopifyData, apcData) => {
  try {
    const reformatShopifyData = (shopifyData) => {
      let barcodes = {};
      shopifyData.forEach((product) => {
        let { variants, ...rest } = product;
        variants.forEach((variant) => {
          //console.log(variant);
          let { id, barcode, inventoryPolicy } = variant;
          if (barcodes[barcode] === undefined) {
            barcodes[barcode] = {
              id: id,
              inventoryPolicy: inventoryPolicy,
              exists: false,
            };
          }
        });
      });
      return barcodes;
    };
    let newShopifyData = reformatShopifyData(shopifyData);
    let newAPCData = apcData.sort();
    let sortedShopifyKeys = Object.keys(newShopifyData).sort();
    let intersection = sortedShopifyKeys.filter((x) => newAPCData.includes(x));
    intersection.forEach((barcode) => {
      newShopifyData[barcode]["exists"] = true;
    });
    return newShopifyData;
  } catch (error) {
    console.log(error);
  }
};

module.exports = router;
