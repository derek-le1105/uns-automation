//import axios from "axios";
const axios = require("axios");
const express = require("express");
const router = express.Router();
require("dotenv").config();
const options = {
  headers: {
    "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
  },
  params: {
    status: "any",
    created_at_min: "2023-10-07",
    created_at_max: "2023-10-13",
    fields:
      "order_number, line_items, billing_address, customer, tags, admin_graphql_api_id",
    tag: "PlantOrder",
    limit: "250",
  },
};

router.get("/", async (req, res) => {
  try {
    const response = await axios.get(process.env.ORDER_RESOURCE_URL, options);
    return res.status(200).json(response.data);
  } catch (error) {
    console.log(error.code);
    return res.status(404).json({ error: "Invalid" });
  }
});

module.exports = router;
