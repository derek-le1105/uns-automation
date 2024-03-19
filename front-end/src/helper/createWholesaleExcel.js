import * as Excel from "exceljs";
import { saveAs } from "file-saver";

import { supabase } from "../supabaseClient";

export async function createWholesaleExcel(data, batch_length, date) {
  try {
    const regex = /\s-\s\d+\s+pack\s*/i;
    const APC_WB = new Excel.Workbook();
    const WCA_WB = new Excel.Workbook();
    const apc_sheet = APC_WB.addWorksheet("Sheet 1");
    const wca_sheet = WCA_WB.addWorksheet("Sheet 1");
    const fileNames = {
      APC_STORE_ORDER: APC_WB,
      WCA_STORE_ORDER: WCA_WB,
    };

    let rows = [1, 1]; // wca, apc
    const main_data = [[], [], []]; // fill and then sort by vendor
    // CPA, AWC | ETC | BBA

    //styling
    //apc_sheet.getColumn("B").font = { bold: true };
    //wca_sheet.getColumn("B").font = { bold: true };

    Object.values(data).map((order, idx) => {
      let customer = order.order_name;
      apc_sheet.addRow([customer, "", "", batch_length]);
      wca_sheet.addRow([customer, "", "", batch_length]);
      apc_sheet.addRow();
      wca_sheet.addRow();

      //apc_sheet.getCell(`A${rows[0]}`).font = { size: 11, bold: true };
      //wca_sheet.getCell(`A${rows[1]}`).font = { size: 11, bold: true };
      order.items.map((item, key) => {
        let match = regex.exec(item.title);
        //console.log(item);
        if (match) {
          const matchedSubstring = match[0]; // The entire matched substring
          const numberMatch = /\d+/.exec(matchedSubstring); // Match the number within the substring
          if (numberMatch) item.quantity *= parseInt(numberMatch[0], 10);
          item.title = item.title.slice(0, item.title.indexOf(match[0]));
          //console.log(item);
        }
        let curr_item = [
          item.quantity,
          item.title,
          item.barcode,
          batch_length,
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
          if (item.vendor.includes("CPA") || item.vendor.includes("WCA"))
            main_data[0].push(curr_item);
          else if (item.vendor.includes("BBA")) main_data[2].push(curr_item);
          else main_data[1].push(curr_item);
        }
      });
      apc_sheet.addRow([]);
      wca_sheet.addRow([]);
      rows = rows.map((row) => (row += 2));
      batch_length += 1;
    });
    //create main excel before pushing data
    // return data from new main excel function to upsert into supabase
    let names = data.map((order) => {
      return [order.order_name, order.shipping];
    });
    let new_data = await createMainExcel(main_data, names, date);

    await supabase.from("main_excel_data").upsert({
      wednesday_date: date,
      apc_wca: new_data[0],
      etc: new_data[1],
      bba: new_data[2],
      order_names: new_data[3],
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

export async function createMainExcel(main_data, order_names, date) {
  console.log(main_data);
  const { data } = await supabase
    .from("main_excel_data")
    .select()
    .eq("wednesday_date", date)
    .limit(1)
    .maybeSingle();
  let prev_data = [[], [], [], []],
    new_data = [];
  if (data !== null)
    prev_data = [data.apc_wca, data.etc, data.bba, data.order_names];
  main_data.map((category, idx) => {
    new_data.push(category.concat(prev_data[idx]));
  });
  new_data.push(prev_data[3].concat(order_names));
  const MAIN_WB = new Excel.Workbook();
  const main_sticker_sheet = MAIN_WB.addWorksheet("Main Sticker");
  const main_sheet = MAIN_WB.addWorksheet("Main");
  const store_order_sheet = MAIN_WB.addWorksheet("Store Order");

  main_sheet.getColumn("B").font = { bold: true };
  let stickers = sortAndCombine(new_data.slice(0, 3));
  new_data[3].map((order, idx) => {
    let store_row = [
      idx + 1,
      order[0],
      `1 1 1 ${order[1]}`,
      "-",
      order[0].slice(0, order[0].indexOf(" - ")),
    ];
    store_order_sheet.addRow(store_row);
    main_sheet.addRow(store_row);
    if (stickers[idx + 1]) {
      stickers[idx + 1].forEach((item) => {
        main_sheet.addRow([idx + 1, item[0], item[1], item[4], item[6]]);
        main_sticker_sheet.addRow(item);
      });
    }
  });

  const buffer = await MAIN_WB.xlsx.writeBuffer();
  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  const fileExtension = ".xlsx";

  const blob = new Blob([buffer], { type: fileType });

  saveAs(blob, `MAIN_STORE` + fileExtension);

  return new_data;
}

function sortAndCombine(data) {
  let flat_data,
    grouped_orders = {};
  flat_data = data.flat().sort((a, b) => {
    if (a[3] < b[3]) {
      return -1;
    }
    if (a[3] > b[3]) {
      return 1;
    }
    return 0;
  });

  flat_data.forEach((subArr) => {
    const key = subArr[3]; // Get the value at the fourth index
    if (!grouped_orders[key]) {
      grouped_orders[key] = [];
    }
    grouped_orders[key].push(subArr);
  });

  return grouped_orders;
}
