const express = require("express");
const router = express.Router();
const fs = require("fs");

const importBulkData = require("../helper/importBulkData");
const prepareShopifyImport = require("../helper/prepareShopifyImport");
const {
  productUpdateString,
  variantUpdateString,
} = require("../helper/shopifyGQLStrings");

const filterString = "(vendor:CPA-TS OR vendor:CPA) AND -status:Archived)";

require("dotenv").config();

router.post("/", async (req, res) => {
  let apc_stocklist_codes = req.body;
  try {
    let [productUpdateList, productUpdateVariantList] =
      await prepareShopifyImport(apc_stocklist_codes, filterString, "apc");

    if (productUpdateList.length)
      await importBulkData(productUpdateList, "apcimport", productUpdateString);
    if (productUpdateVariantList.length)
      await importBulkData(
        productUpdateVariantList,
        "apcvariantimport",
        variantUpdateString
      );
    return res.status(200).json("Successfully updated products");
  } catch (error) {
    console.log(error);
    return res.status(404).json(error);
  }
});

module.exports = router;
