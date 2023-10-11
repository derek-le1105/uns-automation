//import axios from "axios";
const axios = require("axios");
const express = require("express");
const router = express.Router();
require("dotenv").config();
const options = {
  headers: {
    "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
  },
  params: {},
};

router.get("/", async (req, res) => {
  try {
    options.params = { fields: "id, title, variants", ids: req.query.ids };
    const response = await axios.get(process.env.ITEM_RESOURCE_URL, options);
    var item_mapping = {};

    for (let i = 0; i < response.data.products.length; ++i) {
      item_mapping[response.data.products[i].id] = {
        id: response.data.products[i].id,
        title: response.data.products[i].title,
        barcode: response.data.products[i].variants[0].barcode,
      };
    }

    return res.status(200).json(item_mapping);
  } catch (error) {
    console.log(error);
    return res.status(404).json({ error: "Invalid" });
  }
});

module.exports = router;
