const axios = require("axios");
const express = require("express");
const router = express.Router();

const getBulkData = require("../helper/getBulkData");

require("dotenv").config();

//publications resource works but some items do not have channels in them or checked off
const plantsQuery = (vendor) => {
  return `mutation{
    bulkOperationRunQuery(
    query: """
    {
        products(first: 1000, query: "vendor:${vendor}"){
        edges{
            node{
                id
                title
                vendor
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

const parseData = async () => {
  const dataContainer = [];
  function processJSONLData() {
    return new Promise((resolve, reject) => {
      const jsonlFilePath = "data.jsonl"; // The path to the downloaded JSONL file
      const readStream = readline.createInterface({
        input: fs.createReadStream(jsonlFilePath),
      });
      readStream.on("line", (line) => {
        try {
          const cleanLine = line.replace(/'/g, "");
          const jsonData = JSON.parse(cleanLine);
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
  let parsedAPCData = await getBulkData(plantsQuery("CPA-TS"));
  let parsedWCAData = await getBulkData(plantsQuery("ACW-TS"));
});

module.exports = router;
