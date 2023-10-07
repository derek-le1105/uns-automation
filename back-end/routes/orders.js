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
    created_at_min: "2023-09-22",
    created_at_max: "2023-09-29",
    fields: "order_number, line_items, billing_address, customer, tags",
    tag: "PlantOrder",
  },
};

router.get("/", async (req, res) => {
  console.log("here");
  try {
    const response = await axios.get(process.env.ORDER_RESOURCE_URL, options);
    //console.log(response.data);
    return res.status(200).json(response.data);
  } catch (error) {
    console.log(error.code);
    return res.status(404).json({ error: "Invalid" });
  }
});

module.exports = router;
