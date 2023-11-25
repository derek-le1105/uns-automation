//import axios from "axios";
const axios = require("axios");
const express = require("express");
const router = express.Router();
const readline = require("readline");
const fs = require("fs");

require("dotenv").config();

const wait = (n) => new Promise((resolve) => setTimeout(resolve, n));

const parseData = async () => {
  const dataContainer = [];
  function processJSONLData() {
    return new Promise((resolve, reject) => {
      let currCustomer = "";
      let fulfillment_number = 0;
      const jsonlFilePath = "data.jsonl"; // The path to the downloaded JSONL file
      const readStream = readline.createInterface({
        input: fs.createReadStream(jsonlFilePath),
      });
      readStream.on("line", (line) => {
        try {
          const cleanLine = line.replace(/'/g, "");
          const jsonData = JSON.parse(cleanLine);
          if (jsonData.id) {
            let lastname = jsonData.customer.lastName.includes("Store Code")
              ? jsonData.customer.lastName.slice(11)
              : jsonData.customer.lastName;
            currCustomer = `${lastname} - ${jsonData.name.slice(4)}`;
            fulfillment_number += 1;

            dataContainer.push({
              id: fulfillment_number,
              order_name: currCustomer,
              customer: {
                first_name: jsonData.customer.firstName,
                last_name: jsonData.customer.lastName,
              },
              items: [],
              shipping: jsonData.shippingLine.title,
            });
          } else {
            dataContainer[dataContainer.length - 1].items.push({
              title: jsonData.name,
              quantity: jsonData.quantity,
              customer_code: currCustomer.slice(0, currCustomer.indexOf(" - ")),
              sku: jsonData.sku,
              vendor: jsonData.vendor,
              barcode: jsonData.variant.barcode,
              id: dataContainer[dataContainer.length - 1].items.length + 1,
            });
          }
        } catch (error) {
          //TODO: handle error when reading line stops abruptly
          console.error("Error parsing JSON:", error);
          console.log(line, "\n");
        }
      });

      readStream.on("close", () => {
        console.log("Finished processing JSONL data.");
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
    await axios({
      url: process.env.ORDER_RESOURCE_URL,
      method: "post",
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
      data: {
        query: `
        mutation{
          bulkOperationRunQuery(
          query: """
          {
              orders(first: 75, query: "created_at:>'2023-11-10' created_at:<'2023-11-17' tag:'PlantOrder' -tag:'Edit Order'"){
                  edges{
                    node{
                        id
                        name
                        customer{
                          firstName
                          lastName
                        }
                        shippingLine{
                          title
                        }
                      lineItems(first: 150){
                        edges{
                          node{
                            name
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
      }`,
      },
    });

    if (!fs.existsSync("data.jsonl")) {
      do {
        var response2 = await axios({
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
        console.log(
          "waiting " +
            response2.data.data.currentBulkOperation.status +
            response2.data.data.currentBulkOperation.id
        );
        await wait(2000);
      } while (response2.data.data.currentBulkOperation.status != "COMPLETED");

      const url = response2.data.data.currentBulkOperation.url;
      const writer = fs.createWriteStream("data.jsonl");
      await axios.get(url, { responseType: "stream" }).then((response) => {
        //https://stackoverflow.com/questions/55374755/node-js-axios-download-file-stream-and-writefile
        return new Promise((resolve, reject) => {
          response.data.pipe(writer);
          let error = null;
          writer.on("error", (err) => {
            error = err;
            writer.close();
            reject(err);
          });
          writer.on("close", () => {
            if (!error) {
              resolve(true);
            }
            //no need to call the reject here, as it will have been called in the
            //'error' stream;
          });
        });
      });
    }

    var parsedShopifyData = await parseData();

    return res.status(200).json(parsedShopifyData);
  } catch (error) {
    console.log("error at 142: " + error.code);
    return res.status(404).json({ error: "Invalid" });
  }
});

module.exports = router;
