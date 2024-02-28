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
    const main_sticker_sheet = MAIN_WB.addWorksheet("Main Sticker");
    const main_sheet = MAIN_WB.addWorksheet("Main");
    const store_order_sheet = MAIN_WB.addWorksheet("Store Order");
    const fileNames = {
      APC_STORE_ORDER: APC_WB,
      WCA_STORE_ORDER: WCA_WB,
      MAIN_STORE_ORDER: MAIN_WB,
    };

    let rows = [1, 1]; // wca, apc
    const main_data = [[], [], []]; // fill and then sort by vendor
    // CPA, AWC | ETC | BBA

    //styling
    apc_sheet.getColumn("B").font = { bold: true };
    wca_sheet.getColumn("B").font = { bold: true };
    main_sheet.getColumn("B").font = { bold: true };

    Object.values(data).map((order, idx) => {
      let customer = order.order_name;
      apc_sheet.addRow([customer, "", "", order.id]);
      wca_sheet.addRow([customer, "", "", order.id]);
      apc_sheet.addRow();
      wca_sheet.addRow();
      store_order_sheet.addRow([
        order.id,
        customer,
        `1 1 1 ${order.shipping}`,
        "-",
        customer.slice(0, customer.indexOf(" - ")),
      ]);

      apc_sheet.getCell(`A${rows[0]}`).font = { size: 11, bold: true };
      wca_sheet.getCell(`A${rows[1]}`).font = { size: 11, bold: true };
      order.items.map((item, key) => {
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
          order.id,
          item.vendor,
          item.sku,
          customer.slice(0, 5), //customer code
        ];
        if (item.vendor === "CPA-TS") {
          if (
            item.title.toLowerCase().includes("cup") ||
            item.title.toLowerCase().includes("tissue culture")
          ) {
            wca_sheet.addRow(curr_item.slice(0, 5));
            rows[1] += 1;
          } else {
            apc_sheet.addRow(curr_item.slice(0, 5));
            rows[0] += 1;
          }
        } else if (item.vendor === "ACW-TS") {
          if (item.title.toLowerCase().includes("mother")) {
            apc_sheet.addRow(curr_item.slice(0, 5));
            rows[0] += 1;
          } else {
            wca_sheet.addRow(curr_item.slice(0, 5));
            rows[1] += 1;
          }
        } else {
          //main_sticker_sheet.addRow(curr_item);
          //main_sheet.addRow(curr_item);
          //main_data.push(curr_item);
          if (item.vendor.includes("CPA") || item.vendor.includes("WCA"))
            main_data[0].push(curr_item);
          else if (item.vendor.includes("BBA")) main_data[2].push(curr_item);
          else main_data[1].push(curr_item);
        }
      });
      apc_sheet.addRow([]);
      wca_sheet.addRow([]);
      rows = rows.map((row) => (row += 2));
    });
    for (let category of main_data) {
      category.sort((a, b) => {
        if (a[4] < b[4]) {
          return -1;
        }
        if (a[4] > b[4]) {
          return 1;
        }
        return 0;
      });
    }

    main_data.map((category) => {
      category.map((item) => {
        main_sticker_sheet.addRow(item);
        main_sheet.addRow(item);
      });
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
