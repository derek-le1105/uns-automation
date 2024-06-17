const axios = require("axios");
const express = require("express");
const router = express.Router();
const readline = require("readline");
const fs = require("fs");

const getBulkData = require("../helper/getBulkData");

const apcFileName = "CPA-TS";
const wcaFileName = "ACW-TS";

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
