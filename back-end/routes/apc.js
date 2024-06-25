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

router.post("/products", async (req, res) => {
  let apc_stocklist_codes = req.body;
  try {
    let { productUpdateList } = await prepareShopifyImport(
      apc_stocklist_codes,
      filterString,
      "apc"
    );

    let response = "";

    if (productUpdateList.length !== 0) {
      let polling = await importBulkData(
        productUpdateList,
        "apcimport",
        productUpdateString
      );
      response = polling
        ? "Successfully updated products"
        : "Something went wrong";
    } else response = "No products to update";
    return res.status(200).json(response);
  } catch (error) {
    console.log(error.lineNumber);
    return res.status(404).json(error);
  }
});

router.post("/variants", async (req, res) => {
  let apc_stocklist_codes = req.body;
  try {
    let { productUpdateVariantList } = await prepareShopifyImport(
      apc_stocklist_codes,
      filterString,
      "apc"
    );
    let response = "";

    if (productUpdateVariantList.length !== 0) {
      let polling = await importBulkData(
        productUpdateVariantList,
        "apcvariantimport",
        variantUpdateString
      );
      response = polling
        ? "Successfully updated variants"
        : "Something went wrong";
    } else response = "No variants to update";
    return res.status(200).json(response);
  } catch (error) {
    console.log(error.lineNumber);
    return res.status(404).json(error);
  }
});

module.exports = router;
