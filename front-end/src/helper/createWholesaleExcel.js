import * as Excel from "exceljs";
import { saveAs } from "file-saver";

export async function createWholesaleExcel(data) {
  try {
    const regex = /\s-\s\d+\s+pack\s*/i;
    const APC_WB = new Excel.Workbook();
    const WCA_WB = new Excel.Workbook();
    const MAIN_WB = new Excel.Workbook();
    const apc_sheet = APC_WB.addWorksheet("Sheet 1");
    const wca_sheet = WCA_WB.addWorksheet("Sheet 1");
    const main_sheet = MAIN_WB.addWorksheet("Main");
    const fileNames = {
      APC_STORE_ORDER: APC_WB,
      WCA_STORE_ORDER: WCA_WB,
      MAIN_STORE_ORDER: MAIN_WB,
    };

    let rows = [1, 1]; // main, wca, apc

    //styling
    apc_sheet.getColumn("B").font = { bold: true };
    wca_sheet.getColumn("B").font = { bold: true };
    main_sheet.getColumn("B").font = { bold: true };

    Object.keys(data).map((order, idx) => {
      let customer = data[order].order_name;
      apc_sheet.addRow([customer, "", "", parseInt(order) + 1]);
      wca_sheet.addRow([customer, "", "", parseInt(order) + 1]);

      apc_sheet.getCell(`A${rows[0]}`).font = { size: 14, bold: true };
      wca_sheet.getCell(`A${rows[1]}`).font = { size: 14, bold: true };
      data[order].items.map((item, key) => {
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
          customer.slice(0, 5), //customer code
        ];
        if (item.vendor == "CPA-TS") {
          apc_sheet.addRow(curr_item);
          rows[0] += 1;
        } else if (item.vendor == "ACW-TS") {
          wca_sheet.addRow(curr_item);
          rows[1] += 1;
        } else {
          main_sheet.addRow(curr_item);
        }
      });
      apc_sheet.addRow([]);
      wca_sheet.addRow([]);
      rows = rows.map((row) => (row += 2));
    });

    for (const [key, value] of Object.entries(fileNames)) {
      const buffer = await value.xlsx.writeBuffer();
      const fileType =
        "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
      const fileExtension = ".xlsx";

      const blob = new Blob([buffer], { type: fileType });

      saveAs(blob, `${key}` + fileExtension);
    }
  } catch (error) {
    console.log(error);
  }
}
