const axios = require("axios");
const express = require("express");
const router = express.Router();
const readline = require("readline");
const fs = require("fs");

const getBulkData = require("../helper/getBulkData");
const importBulkData = require("../helper/importBulkData");

const apcFileName = "apc-ts";

require("dotenv").config();

//publications resource works but some items do not have channels in them or checked off
const plantsQuery = (vendor) => {
  return `mutation{
    bulkOperationRunQuery(
    query: """
    {
        products(first: 2000, query: "vendor:${vendor}"){
            edges{
              node{
                id
                title
                status
                variants(first: 10) {
                    edges{
                        node{
                          id
                          barcode
                          inventoryPolicy
                        }
                    }
                }
              }
            }
          }
    }
    """)
    {
        bulkOperation {
            id
            status
        }
        userErrors{
            field
            message
        }
    }
}`;
};

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
        
        retrieve wca and apc file from frontend via file objects
        - for apc, we only need to read columns B, E, H, K, N for codes
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
  let apc_stocklist_codes = req.body;
  try {
    let shopifyAPCPlants = await getBulkData(
      plantsQuery("CPA-TS"),
      parseData,
      apcFileName
    );

    let productUpdateList = [],
      productUpdateVariantList = [],
      notOnShopifyList = [];

    //tracks which product variants to make active
    shopifyAPCPlants.forEach((product, idx) => {
      let { id, title, status, variants } = product;

      //if there is only one variant or product has no variant
      if (variants.length <= 1) {
        let barcode = variants[0].barcode;
        if (!apc_stocklist_codes.includes(barcode)) {
          if (status === "ACTIVE")
            productUpdateList.push({ ...product, status: "DRAFT" });
        } else {
          if (status === "DRAFT")
            productUpdateList.push({ ...product, status: "ACTIVE" });
        }
      } else {
        let oversellList = [],
          denyCount = 0;
        variants.forEach((variant) => {
          //if shopify barcode exists in apc list, make active if not already
          let { variantId, barcode, inventoryPolicy } = variant;
          if (!apc_stocklist_codes.includes(barcode)) {
            if (inventoryPolicy !== "DENY")
              oversellList.push({ ...variant, inventoryPolicy: "DENY" });
            denyCount += 1;
          } else {
            if (inventoryPolicy !== "CONTINUE")
              oversellList.push({ ...variant, inventoryPolicy: "CONTINUE" });
          }
        });
        //if number of denied oversell items is less than amount of variants, make product ACTIVE
        if (denyCount < variants.length) {
          //
          if (status !== "ACTIVE") {
            productUpdateList.push({ ...product, status: "ACTIVE" });
            oversellList.forEach((product) => {
              productUpdateVariantList.push(product);
            });
          }
        } else {
          if (status !== "DRAFT")
            productUpdateList.push({ ...product, status: "DRAFT" });
        }
      }
    });
    //check to see which barcodes from apc stocklist ARENT in shopify list
    /*apc_stocklist_codes.forEach((barcode) => {
      if (!findInArrayOfObjects(barcode, shopifyAPCPlants)) {
        codesNotInShopify.push(barcode);
      } else found_count.push(barcode);
    });*/

    /*let temp = 0;
    shopifyAPCPlants.forEach((product) => {
      temp += product.barcodes.length;
    });
    console.log(`shopify product count: ${shopifyAPCPlants.length}`); //amount of products not including variants
    console.log(`shopify variant count: ${temp}`);
    console.log(
      `barcodes found between apc & shopify: ${bulkOperationStrings.length}`
    );
    console.log(`barcodes not found: ${bad_count}`);
    console.log(`stock list count: ${apc_stocklist_codes.length}`);
    console.log(`codes not found: ${codesNotInShopify.length}`);
    console.log(`barcodes found: ${found_count.length}`);*/
    await importBulkData(productUpdateList, "apctest");
    return res.status(200).json("Successfully updated products");
    //return res.status(200).json(shopifyAPCPlants);
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

module.exports = router;
