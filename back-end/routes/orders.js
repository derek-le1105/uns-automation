//import axios from "axios";
const axios = require("axios");
const express = require("express");
const router = express.Router();
const readline = require("readline");
const fs = require("fs");
require("dotenv").config();

const wait = (n) => new Promise((resolve) => setTimeout(resolve, n));

const parseData = async (url) => {
  async function processJSONLData() {
    const newData = {};
    let currCustomer = "";
    const jsonlFilePath = "data.jsonl"; // The path to the downloaded JSONL file

    try {
      // Download the JSONL data
      const response = await axios.get(url, { responseType: "stream" });
      response.data.pipe(fs.createWriteStream("data.jsonl"));

      // Create a Promise to handle the asynchronous processing
      await new Promise((resolve, reject) => {
        const readStream = readline.createInterface({
          input: fs.createReadStream(jsonlFilePath),
        });
        readStream.on("line", (line) => {
          try {
            console.log(line);
            const cleanLine = line.replace(/'/g, "");
            const jsonData = JSON.parse(cleanLine);
            if (jsonData.id) {
              currCustomer = jsonData.customer.lastName;
              newData[currCustomer] = [];
            } else {
              let item_extension =
                jsonData.variant.title == "Default Title"
                  ? ""
                  : ` ${jsonData.variant.title}`;
              newData[currCustomer].push({
                title: `${jsonData.title + item_extension}`,
                quantity: jsonData.quantity,
                sku: jsonData.sku,
                vendor: jsonData.vendor,
                barcode: jsonData.variant.barcode,
              });
            }
            //console.log(line);
          } catch (error) {
            console.error("Error parsing JSON:", error);
            console.log(line, "\n");
            reject(error);
          }
        });

        readStream.on("close", () => {
          console.log("Finished processing JSONL data.");
          resolve(newData); // Resolve the Promise when processing is complete
        });
      });
    } catch (error) {
      console.error("Error downloading JSONL file:", error);
      return newData; // Return an empty object in case of an error
    }
  }

  // Call the async function to start processing JSONL data
  processJSONLData().then(
    (data) => {
      console.log("Processed data:", data);
      return data;
    },
    (error) => {
      console.log("error: ", error);
    }
  );
};

router.post("/", async (req, res) => {
  try {
    await axios({
      url: process.env.ORDER_RESOURCE_URL,
      method: "post",
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
      data: {
        query: `query 
        {
          orders(first: 50, query: "created_at:>'2023-10-20' created_at:<'2023-10-27' tag:'PlantOrder' -tag:'Edit Order'"){
            edges{
              node{
                id
                name
                customer{
                  lastName
                }
                lineItems(first: 150){
                  edges{
                    node{
                      quantity
                      sku
                      vendor
                      variant{
                        barcode
                        title
                      }
                    }
                  }
                }
              }
            }
          }
        }`,
      },
    });

    var url = "";
    var response2;

    do {
      response2 = await axios({
        url: process.env.ORDER_RESOURCE_URL,
        method: "post",
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
        data: {
          query: `query {
              currentBulkOperation {
                id
                status
                errorCode
                createdAt
                completedAt
                objectCount
                fileSize
                url
                partialDataUrl
              }
            }`,
        },
      });
      console.log("waiting " + response2.data.data.currentBulkOperation.status);
      await wait(5000);
    } while (response2.data.data.currentBulkOperation.status != "COMPLETED");
    console.log("done");

    url = response2.data.data.currentBulkOperation.url;

    var parsedShopifyData = await parseData(url);
    console.log(parsedShopifyData);

    return res.status(200).json(parsedShopifyData);
  } catch (error) {
    console.log("error: " + error.code);
    return res.status(404).json({ error: "Invalid" });
  }
});

module.exports = router;
