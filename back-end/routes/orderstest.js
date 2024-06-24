const express = require("express");
const router = express.Router();
const axios = require("axios");

const {
  wholesaleOrdersQuery,
  wholesalePlantsQuery,
} = require("../helper/shopifyGQLStrings");
const { downloadBulkData } = require("../helper/downloadBulkData");
const { parseData } = require("../helper/parseJSONLData");

router.post("/", async (req, res) => {
  try {
    const dates = req.body;
    let response = await axios({
      url: "https://ultumnaturesystems.myshopify.com/admin/api/2024-04/graphql.json",
      method: "post",
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
      data: {
        query: wholesaleOrdersQuery(dates),
      },
    });

    let orders = response.data.data.orders.edges;

    const formatted_orders = [];
    orders.forEach((order) => {
      let { name, customer, cancelledAt } = order.node;
      let lastName = customer.lastName.includes("Store Code")
        ? customer.lastName.slice(11)
        : customer.lastName;
      if (cancelledAt === null) {
        formatted_orders.push({
          order_name: `${lastName} - ${name.slice(4)}`,
          customer: customer,
          shipping: "Fedex",
        });
      }
    });
    console.log("qwerq");

    return res.status(200).json(formatted_orders);
  } catch (error) {
    console.log(error.lineNumber);
  }
});

router.post("/items", async (req, res) => {
  const readLineItems = (line) => {
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
          shipping: "Fedex", //jsonData.shippingLine.title == null ? "" : jsonData.shippingLine.title,
        });
      } else {
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
    }
  };
  let dates = req.body;
  await downloadBulkData(wholesalePlantsQuery(dates), "data");
  let parsedData = await parseData("data", readLineItems);
  return res.status(200).json(parsedData);
});

module.exports = router;
