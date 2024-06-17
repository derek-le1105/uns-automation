const express = require("express");
const router = express.Router();

const importBulkData = require("../helper/importBulkData");
const prepareShopifyImport = require("../helper/prepareShopifyImport");
const {
  productUpdateString,
  variantUpdateString,
} = require("../helper/shopifyGQLStrings");

require("dotenv").config();

router.post("/", async (req, res) => {
  let wca_stocklist_codes = req.body;
  console.log("wca codes: ", wca_stocklist_codes.length);
  try {
    let [productUpdateList, productUpdateVariantList] =
      await prepareShopifyImport(wca_stocklist_codes, "ACW-TS");
    await importBulkData(productUpdateList, "wcatest", productUpdateString);
    await importBulkData(
      productUpdateVariantList,
      "wcavarianttest",
      variantUpdateString
    );
    return res.status(200).json("Successfully updated products");
  } catch (error) {
    console.log(error);
    return res.status(404).json(error);
  }
});

module.exports = router;
