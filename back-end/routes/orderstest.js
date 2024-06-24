const express = require("express");
const router = express.Router();
const axios = require("axios");

const { wholesaleOrdersQuery } = require("../helper/shopifyGQLStrings");

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

    return res.status(200).json(formatted_orders);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
