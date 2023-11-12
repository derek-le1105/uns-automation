const axios = require("axios");
const express = require("express");
const router = express.Router();
const excelJS = require("exceljs");

router.post("/", async (req, res) => {
  try {
    const wb = new excelJS.Workbook();
    const sheet = wb.addWorksheet("Sheet 1");
    await wb.xlsx.writeFile("APC_STORE_ORDER.xlsx");
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
