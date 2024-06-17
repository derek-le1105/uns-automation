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
  let apc_stocklist_codes = req.body;
  console.log("apc codes: ", apc_stocklist_codes.length);
  try {
    let [productUpdateList, productUpdateVariantList] =
      await prepareShopifyImport(apc_stocklist_codes, "CPA-TS");

    await importBulkData(productUpdateList, "apctest", productUpdateString);
    await importBulkData(
      productUpdateVariantList,
      "apcvarianttest",
      variantUpdateString
    );
    return res.status(200).json("Successfully updated products");
  } catch (error) {
    console.log(error);
    return res.status(404).json(error);
  }
});

module.exports = router;
