const express = require("express");
const router = express.Router();
const readline = require("readline");
const fs = require("fs");

const { wholesalePlantsQuery } = require("../helper/shopifyGQLStrings");
const downloadBulkData = require("../helper/downloadBulkData");

require("dotenv").config();

const parseData = async () => {
  const dataContainer = [];
  function processJSONLData() {
    return new Promise((resolve, reject) => {
      let currCustomer = "";
      let currCancelled = false;
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
            if (jsonData.cancelledAt !== null) {
              currCancelled = true;
              return;
            } else currCancelled = false;
            let lastname = jsonData.customer.lastName.includes("Store Code")
              ? jsonData.customer.lastName.slice(11)
              : jsonData.customer.lastName;
            currCustomer = `${lastname} - ${jsonData.name.slice(4)}`;
            fulfillment_number += 1;

            dataContainer.push({
              id: fulfillment_number,
              order_name: currCustomer,
              customer: {
                firstName: jsonData.customer.firstName,
                lastLame: jsonData.customer.lastName,
              },
              items: [],
              shipping: "Fedex", //jsonData.shippingLine.title == null ? "" : jsonData.shippingLine.title,
            });
          } else {
            if (currCancelled) {
              return;
            }
            dataContainer[dataContainer.length - 1].items.push({
              title: jsonData.name,
              quantity: jsonData.quantity,
              //fulfillment_number: fulfillment_number,
              customer_code: currCustomer.slice(0, currCustomer.indexOf(" - ")),
              sku: jsonData.sku == null ? "" : jsonData.sku,
              vendor: jsonData.vendor,
              barcode: jsonData.variant == null ? "" : jsonData.variant.barcode,
              //id: dataContainer[dataContainer.length - 1].items.length + 1,
            });
          }
        } catch (error) {
          //TODO: handle error when reading line stops abruptly
          console.error("Error parsing JSON:", error);
          reject(error);
        }
      });

      readStream.on("close", () => {
        resolve(dataContainer); // Resolve the Promise when processing is complete
      });
    });
  }

  // Call the async function to start processing JSONL data
  return processJSONLData()
    .then((data) => {
      return data;
    })
    .catch((error) => {
      return error;
    });
};

router.post("/", async (req, res) => {
  console.log("here");
  let fridays = req.body;
  try {
    await downloadBulkData(wholesalePlantsQuery(fridays), "data").catch(
      (error) => {
        return res.status(404).json(error);
      }
    );
    let parsedData = await parseData();
    console.log(parsedData);
    console.log("success");
    return res.status(200).json(parsedData);
  } catch (error) {
    console.log(error.lineNumber);
    return res.status(404).json("Error");
  }
});

router.get("/", (req, res) => {
  return res.status(200).json("Good!");
});

module.exports = router;
