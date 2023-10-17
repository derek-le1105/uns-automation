//import axios from "axios";
const axios = require("axios");
const express = require("express");
const router = express.Router();
require("dotenv").config();
const options = {
  headers: {
    "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
    "Content-Type": "application/json",
  },
  data: `query {
    order(id: "gid://shopify/Order/5252497801407") {
          name,
          lineItems(first:100){
              edges{
                  node{
                      title
                      quantity
                      sku
                      vendor
                      variant{
                          barcode
                      }
                  }
              }
          }
    }
  }`,
};

const wait = (n) => new Promise((resolve) => setTimeout(resolve, n));

router.post("/", async (req, res) => {
  try {
    const response = await axios({
      url: process.env.ORDER_RESOURCE_URL,
      method: "post",
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
      data: {
        query: `query 
        {
          orders(first: 50, query: "created_at:>'2023-10-06' created_at:<'2023-10-13' tag:'PlantOrder' -tag:'Edit Order'"){
            edges{
              node{
                name
                customer{
                  lastName
                }
                lineItems(first: 150){
                  edges{
                    node{
                      title
                      quantity
                      sku
                      vendor
                      variant{
                        barcode
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

    while (true) {
      const response2 = await axios({
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
      if (response2.data.data.currentBulkOperation.status == "COMPLETED") {
        url = response2.data.data.currentBulkOperation.url;
        break;
      }
      await wait(5000);
    }

    const shopify_data = await fetch(url);

    console.log(shopify_data);

    return res.status(200).json(response.data.data);
  } catch (error) {
    console.log("error: " + error.code);
    return res.status(404).json({ error: "Invalid" });
  }
});

module.exports = router;
