const axios = require("axios");
const express = require("express");
const router = express.Router();
const readline = require("readline");
const fs = require("fs");

const getBulkData = require("../helper/getBulkData");
const importBulkData = require("../helper/importBulkData");
const { getShopifyPlants } = require("../helper/shopifyGQLStrings");

const wcaFileName = "wca-ts";

require("dotenv").config();

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
  /*  get all products from shopify backend
        - filter by vendor and retrieve all variants barcodes
        
        retrieve wca and wca file from frontend via file objects
        - for wca, we only need to read columns B, E, H, K, N for codes
            - if the code exists in the above listed columns, plant is available to order from
        - for wca, codes are given in column A but need to be prefixed with corresponding letter
            - L for loose in column D
            - E for bundle in column F
            - P for pot in column H
            - TR for terracotta ring in column J
            - TB for terracotta ball in column L 
            - D for driftwood in column N
            - if column C reads 'Not Available' or each cell is empty, product is not available from WCA
            - else, cell should read 'Available' and is good to order from

        - 
    */
  let wca_stocklist_codes = req.body;
  //console.log(wca_stocklist_codes);
  try {
    let shopifyWCAPlants = await getBulkData(
      getShopifyPlants("ACW-TS"),
      parseData,
      wcaFileName
    );

    let productUpdateList = [],
      productUpdateVariantList = [],
      notOnShopifyList = [];

    shopifyWCAPlants.forEach((product) => {
      let cont = false,
        deny = false;
      product.variants.forEach((variant) => {
        if (variant.inventoryPolicy === "CONTINUE") cont = true;
        else deny = true;
      });
      //if (cont && deny) console.log(product);
    });

    let barcodeExistsMap = compareShopifyWCA(
      shopifyWCAPlants,
      wca_stocklist_codes
    );
    //tracks which product variants to make active
    shopifyWCAPlants.forEach((product) => {
      let { id, title, status, variants } = product;
      if (variants.length <= 1) {
        let barcode = variants[0].barcode;
        if (barcodeExistsMap[barcode]["existsInWCA"]) {
          if (status === "DRAFT")
            productUpdateList.push({ ...product, status: "ACTIVE" });
        } else {
          if (status === "ACTIVE")
            productUpdateList.push({ ...product, status: "DRAFT" });
        }
      } else {
        let oversellList = [],
          inventoryPolicySet = new Set();
        variants.forEach((variant) => {
          //if shopify barcode exists in wca list, make active if not already
          let { variantId, barcode, inventoryPolicy } = variant;
          if (barcodeExistsMap[barcode]["existsInWCA"]) {
            if (inventoryPolicy === "DENY") {
              oversellList.push({ ...variant, inventoryPolicy: "CONTINUE" });
            }
            inventoryPolicySet.add("CONTINUE");
          } else {
            if (inventoryPolicy === "CONTINUE") {
              oversellList.push({ ...variant, inventoryPolicy: "DENY" });
            }
            inventoryPolicySet.add("DENY");
          }
        });

        if (inventoryPolicySet.size > 1) {
          if (status !== "ACTIVE")
            productUpdateList.push({ ...product, status: "ACTIVE" });
        } else {
          if (inventoryPolicySet.has("DENY")) {
            if (status !== "DRAFT")
              productUpdateList.push({ ...product, status: "DRAFT" });
          }
        }
        oversellList.forEach((product) => {
          if (product !== null) productUpdateVariantList.push(product);
        });
      }
    });

    //console.log(productUpdateVariantList);

    await importBulkData(productUpdateList, "wcatest");
    return res.status(200).json("Successfully updated products");
  } catch (error) {
    console.log(error);
    return res.status(404).json(error);
  }
});

const findInArrayOfObjects = (barcode, arr) => {
  for (let i = 0; i < arr.length; i++) {
    if (arr[i].barcodes.includes(barcode)) return true;
  }
  return false;
};

const compareShopifyWCA = (shopifyData, wcaData) => {
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
              existsInWCA: false,
            };
          }
        });
      });
      return barcodes;
    };
    let newShopifyData = reformatShopifyData(shopifyData);
    let newWCAData = wcaData.sort();
    let sortedShopifyKeys = Object.keys(newShopifyData).sort();
    let intersection = sortedShopifyKeys.filter((x) => newWCAData.includes(x));
    intersection.forEach((barcode) => {
      newShopifyData[barcode]["existsInWCA"] = true;
    });
    return newShopifyData;
  } catch (error) {
    console.log(error);
  }
};

module.exports = router;
