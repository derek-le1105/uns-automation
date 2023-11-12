const axios = require("axios");
const express = require("express");
const router = express.Router();
const excelJS = require("exceljs");

router.post("/", async (req, res) => {
  try {
    const json = req.body;
    const regex = /\s-\s\d+\s+pack\s*/i;
    const APC_WB = new excelJS.Workbook();
    const WCA_WB = new excelJS.Workbook();
    const MAIN_WB = new excelJS.Workbook();
    const apc_sheet = APC_WB.addWorksheet("Sheet 1");
    const wca_sheet = WCA_WB.addWorksheet("Sheet 1");
    const main_sheet = MAIN_WB.addWorksheet("Sheet 1");

    Object.keys(json).map((order, idx) => {
      apc_sheet.addRow([order, , , json[order][0].fulfillment_number]);
      wca_sheet.addRow([order, , , json[order][0].fulfillment_number]);

      json[order].map((item, key) => {
        let match = regex.exec(item.title);
        if (match) {
          const matchedSubstring = match[0]; // The entire matched substring
          const numberMatch = /\d+/.exec(matchedSubstring); // Match the number within the substring
          if (numberMatch) item.quantity *= parseInt(numberMatch[0], 10);
          item.title = item.title.slice(0, item.title.indexOf(match[0]));
        }
        let curr_item = [
          item.quantity,
          item.title,
          item.barcode,
          item.fulfillment_number,
          item.vendor,
          item.sku,
          order.slice(0, 5), //customer code
        ];
        if (item.vendor == "CPA-TS") apc_sheet.addRow(curr_item);
        else if (item.vendor == "ACW-TS") wca_sheet.addRow(curr_item);
        else main_sheet.addRow(curr_item);
      });
      apc_sheet.addRow([]);
      wca_sheet.addRow([]);
      main_sheet.addRow([]);
    });

    await APC_WB.xlsx.writeFile("./store files/APC_STORE_ORDER.xlsx");
    await WCA_WB.xlsx.writeFile("./store files/WCA_STORE_ORDER.xlsx");
    await MAIN_WB.xlsx.writeFile("./store files/MAIN_STORE_ORDER.xlsx");
    return res.status(200);
  } catch (error) {
    console.log(error);
  }
});

module.exports = router;
