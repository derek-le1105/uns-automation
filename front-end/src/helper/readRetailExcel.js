import * as Excel from "exceljs";
import { saveAs } from "file-saver";

const plantPacks = {};

export async function readRetailExcel(file, supabase_packs) {
  //Formats 'plant_packs' object
  supabase_packs.forEach((pack) => {
    plantPacks[pack["Plant Pack"]] = Object.values(pack).filter(
      (plant) => plant !== pack["Plant Pack"]
    );
  });
  const reader = new FileReader();

  const excel_data = [];
  const detected_packs = {};

  return new Promise((resolve, reject) => {
    reader.readAsText(file);

    reader.onload = function (e) {
      let temp_packs = [];
      const text = e.target.result;
      text.split("\r\n").forEach((row) => {
        try {
          let order_split = row.split(",").map((entry) => {
            return entry.replace(/['"]+/g, "");
          });
          let [order_number, location, item_quantity, line_item] = order_split;

          if (new RegExp(/^zstem$/i).test(location)) {
            temp_packs.push(order_split);
            let pack_name = formatPackName(line_item);

            //if detected pack is not included in saved plant packs
            if (!Object.keys(plantPacks).includes(pack_name)) {
              detected_packs[pack_name] = ["", "", "", "", ""];
              plantPacks[pack_name] = ["", "", "", "", ""];
            }
            //if detected pack is not already detected
            else {
              if (!Object.keys(detected_packs).includes(pack_name))
                detected_packs[pack_name] = plantPacks[pack_name];
            }
          } else {
            if (order_split[1] !== "" && order_split[1] !== "ZZstem")
              excel_data.push(order_split);
          }
        } catch (error) {
          reject(error);
        }
      });
      excel_data.splice(0, 1);
      excel_data.splice(excel_data.length - 1, 1);
      temp_packs.forEach((pack) => {
        excel_data.push(pack);
      });
    };

    reader.onloadend = function (e) {
      resolve([excel_data, detected_packs]);
    };
  });
}

function formatPackName(line_item) {
  const packRegex = / - \d+ Pack/;
  const potPackRegex = / - \d+ Pot Package/;
  return line_item.includes("Pot Package")
    ? line_item.replace(potPackRegex, "")
    : line_item.replace(packRegex, "");
}

export async function createFormattedExcel(data, updated_packs, round_string) {
  try {
    var new_excel = updatePlantPacks(data, updated_packs);
    sortOrders(new_excel);
    let order_count = numerizeOrders(new_excel);
    let mapping = formattingLocations(alphabetizeLocations(new_excel));

    const wb = new Excel.Workbook();
    const wb_sheet = wb.addWorksheet("Sheet 1");

    wb_sheet.addRow([
      "Order - Number",
      "code",
      "Item - Location",
      "Item - Qty",
      "Item -Name",
    ]);
    let locations = Object.keys(mapping).sort();
    locations.forEach((location) => {
      mapping[location].forEach((plant_row) => {
        wb_sheet.addRow(plant_row);
      });
      wb_sheet.addRow([]);
    });

    const buffer = await wb.xlsx.writeBuffer();
    const fileType =
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
    const fileExtension = ".xlsx";

    const blob = new Blob([buffer], { type: fileType });

    saveAs(blob, `${round_string}` + fileExtension);
    return order_count;
  } catch (error) {
    //todo
    console.log(error);
  }
}

function updatePlantPacks(data, updated_packs) {
  Object.keys(updated_packs).forEach((pack) => {
    plantPacks[pack] = updated_packs[pack];
  });

  var zstem_index = data.findIndex((order) =>
    new RegExp(/^zstem$/i).test(order[1])
  );
  if (zstem_index !== -1) {
    var new_data = [...data.slice(0, zstem_index)];
    data.slice(zstem_index).forEach((order) => {
      let [order_number, location, item_quantity, line_item] = order;
      let quantity =
        line_item.match(/\d+/g) === null
          ? item_quantity
          : (parseInt(line_item.match(/\d+/g)[0]) * item_quantity) / 5;
      plantPackQtyAssignment(
        new_data,
        order_number,
        formatPackName(line_item),
        parseInt(quantity)
      );
    });
    return new_data;
  } else return data;
}

function plantPackQtyAssignment(excel_data, order_number, pack_name, quantity) {
  plantPacks[pack_name].forEach((item) => {
    if (item["plant"] !== "" || item["location"] !== "")
      excel_data.push([
        order_number,
        item["location"],
        quantity,
        item["plant"],
      ]);
  });
}

function sortOrders(data) {
  data = data.sort((a, b) => {
    let a_sliced = a[0].slice(3),
      b_sliced = b[0].slice(3);
    if (a_sliced < b_sliced) {
      return -1;
    }
    if (a_sliced > b_sliced) return 1;
    return 0;
  });
}

function numerizeOrders(data) {
  let order_set = new Set();
  try {
    for (let row of data) {
      if (!order_set.has(row[0])) {
        order_set.add(row[0]);
      }
      row.splice(1, 0, order_set.size);
    }
  } catch (error) {
    console.log(error);
  }
  return order_set.size;
}

function alphabetizeLocations(data) {
  let location_mapping = {};
  data.forEach((row) => {
    let location = row[2].toLowerCase();
    if (location_mapping[location]) {
      location_mapping[location].push(row);
    } else {
      location_mapping[location] = [row];
    }
  });
  return location_mapping;
}

function formattingLocations(location_mapping) {
  let sorted_keys = Object.keys(location_mapping).sort();
  for (let location of sorted_keys) {
    if (location === "") continue;
    location_mapping[location].sort((a, b) => {
      if (a[4] < b[4]) return -1;
      if (a[4] > b[4]) return 1;
      return 0;
    });
  }
  return location_mapping;
}
