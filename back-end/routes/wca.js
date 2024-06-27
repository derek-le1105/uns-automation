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

router.post("/statuses", async (req, res) => {
  try {
    let wca_stocklist_codes = req.body;
    let { productUpdateList, productUpdateVariantList } =
      await prepareShopifyImport(wca_stocklist_codes, filterString, "acw");

    res.status(200).json([productUpdateList, productUpdateVariantList]);
  } catch (error) {
    console.log(error);
    res.status(404).json("Invalid");
  }
});

router.post("/products", async (req, res) => {
  let wca_stocklist_codes = req.body;
  try {
    let { productUpdateList } = await prepareShopifyImport(
      wca_stocklist_codes,
      filterString,
      "acw"
    );

    let response = "";
    if (productUpdateList.length !== 0) {
      let polling = await importBulkData(
        productUpdateList,
        "wcatest",
        productUpdateString
      );
      response = polling
        ? "Successfully updated products"
        : "Something went wrong";
    } else response = "No products to update";

    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(404).json(error);
  }
});
router.post("/variants", async (req, res) => {
  let wca_stocklist_codes = req.body;
  try {
    let { productUpdateVariantList } = await prepareShopifyImport(
      wca_stocklist_codes,
      filterString,
      "acw"
    );

    let response = "";
    if (productUpdateVariantList.length !== 0) {
      let polling = await importBulkData(
        productUpdateVariantList,
        "wcatest",
        variantUpdateString
      );
      response = polling
        ? "Successfully updated variants"
        : "Something went wrong";
    } else response = "No variants to update";

    return res.status(200).json(response);
  } catch (error) {
    console.log(error);
    return res.status(404).json(error);
  }
});

module.exports = router;
