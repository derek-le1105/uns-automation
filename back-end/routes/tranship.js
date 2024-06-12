const axios = require("axios");
const express = require("express");
const router = express.Router();
const readline = require("readline");
const fs = require("fs");

const getBulkData = require("../helper/getBulkData");

const apcFileName = "apc-ts";
const wcaFileName = "wca-ts";

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
                            barcode
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
  console.log(filename);
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
          if (jsonData.id) {
            dataContainer.push({
              plantTitle: jsonData.title,
              id: jsonData.id,
              status: jsonData.status,
              barcodes: [],
            });
          } else {
            dataContainer[dataContainer.length - 1].barcodes.push(
              jsonData.barcode
            );
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
  try {
    let parsedAPCData = await getBulkData(
      plantsQuery("CPA-TS"),
      parseData,
      apcFileName
    );
    let parsedWCAData = await getBulkData(
      plantsQuery("ACW-TS"),
      parseData,
      wcaFileName
    );
    return res.status(200).json([parsedAPCData, parsedWCAData]);
  } catch (error) {
    console.log(error);
    return res.status(404).json(error);
  }
});

module.exports = router;
