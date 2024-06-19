const express = require("express");
const router = express.Router();

const importBulkData = require("../helper/importBulkData");
const prepareShopifyImport = require("../helper/prepareShopifyImport");
const {
  productUpdateString,
  variantUpdateString,
} = require("../helper/shopifyGQLStrings");

const filterString = "(vendor:ACW-TS OR vendor:ACW) AND -status:Archived)";

require("dotenv").config();

router.post("/", async (req, res) => {
  let wca_stocklist_codes = req.body;
  try {
    let [productUpdateList, productUpdateVariantList] =
      await prepareShopifyImport(wca_stocklist_codes, filterString, "acw");
    if (productUpdateList.length) {
      await importBulkData(
        productUpdateList,
        "wcatest",
        productUpdateString
      ).then((resolve) => console.log(resolve));
    }
    if (productUpdateVariantList.length) {
      await importBulkData(
        productUpdateVariantList,
        "wcavarianttest",
        variantUpdateString
      );
    }
    return res.status(200).json("Successfully updated products");
  } catch (error) {
    console.log(error);
    return res.status(404).json(error);
  }
});

module.exports = router;
