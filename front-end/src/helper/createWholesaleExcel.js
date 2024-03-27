import * as Excel from "exceljs";
import { saveAs } from "file-saver";

import { supabase } from "../supabaseClient";

const assorted_pack = [
  [10, "Anubias Barteri Round Golden Coin - Pot", "P920/1"],
  [10, "Anubias Congensis - Pot", "P928"],
  [10, "Anubias Lanceolata - Pot", "P930"],
  [5, "Anubias Nana Golden - Pot", "P933"],
  [5, "Anubias Nana Petite - Pot", "P935"],
  [10, "Anubias Nana - Pot", "P932"],
  [10, "Bacopa Caroliniana - Lead Bunch", "B880"],
  [5, "Bolbitis Heteroclita Difformis (baby leaf)", "P814/1"],
  [5, "Cryptocoryne Balansae - Pot", "P823"],
  [5, "Cryptocoryne Hudoroi - Pot", "P822/1"],
  [5, "Cryptocoryne Wendtii Brown - Pot", "P869"],
  [5, "Cryptocoryne Wendtii Green - Pot", "P869/1"],
  [10, "Echinodorus Bleheri", "P833"],
  [5, "Echinodorus Red Rubin", "P1115/3"],
  [5, "Echinodorus Xinguensis", "P1113"],
  [10, "Egeria Densa - Lead Bunch", "B835"],
  [10, "Lilaeopsis Novaezelandiae", "B1205/1"],
  [10, "Ludwigia Arcuata - Lead Bunch", "B907/1"],
  [10, "Ludwigia Natans Super Red - Lead Bunch", "B907/6"],
  [5, "Micranthemum Micranthemoides - Lead Bunch", "B1119/1"],
  [10, "Microsorum Pteropus", "P843"],
  [5, "Microsorum Pteropus Windelov", "P843/1"],
  [10, "Rotala Indica - Lead Bunch", "B888/4"],
  [10, "Sagittaria Subulata - Lead Bunch", "B852"],
  [10, "Vallisneria Americana - Lead Bunch", "B887"],
  [10, "Vallisneria Spiralis - Lead Bunch", "B871"],
  [20, "Java moss Golfball", "PT890"],
];

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

    const main_data = [[], [], []]; // fill and then sort by vendor
    const wca_data = {},
      apc_data = {};

    Object.values(data).map((order, idx) => {
      let customer = order.order_name;
      apc_data[customer] = [[customer, "", "", batch_length], []];
      wca_data[customer] = [[customer, "", "", batch_length], []];

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
          item.title.includes("$500") ? item.title.slice(5) : item.title,
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
            wca_data[customer].push(curr_item.slice(0, 5));
          } else {
            apc_data[customer].push(curr_item.slice(0, 5));
          }
        } else if (item.vendor === "ACW-TS") {
          if (item.title.toLowerCase().includes("mother")) {
            apc_data[customer].push(curr_item.slice(0, 5));
          } else {
            wca_data[customer].push(curr_item.slice(0, 5));

            //wca_sheet.addRow(curr_item.slice(0, 5));
            if (item.title.includes("$500")) {
              for (let plant of assorted_pack) {
                wca_data[customer].push([...plant, batch_length]);
              }
            }
          }
        } else {
          if (item.vendor.includes("CPA") || item.vendor.includes("WCA"))
            main_data[0].push(curr_item);
          else if (item.vendor.includes("BBA")) main_data[2].push(curr_item);
          else main_data[1].push(curr_item);
        }
      });
      wca_data[customer].push([]);
      apc_data[customer].push([]);
      batch_length += 1;
    });

    for (const order_data of Object.values(wca_data)) {
      if (order_data.length <= 3) continue;
      order_data.map((row) => {
        return wca_sheet.addRow(row);
      });
    }

    for (const order_data of Object.values(apc_data)) {
      if (order_data.length <= 3) continue;
      order_data.map((row) => {
        return apc_sheet.addRow(row);
      });
    }

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
  const store_order_sheet = MAIN_WB.addWorksheet("Store Order");

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
    if (stickers[idx + 1]) {
      stickers[idx + 1].forEach((item) => {
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
