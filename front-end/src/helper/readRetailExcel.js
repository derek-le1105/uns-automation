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

          order_split[2] = parseInt(order_split[2]);

          if (new RegExp(/^zstem$/i).test(order_split[1])) {
            temp_packs.push(order_split);
            let pack_name = getPackNames(order_split);

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

function getPackNames(order) {
  const packRegex = / - \d+ Pack/;
  const potPackRegex = / - \d+ Pot Package/;
  return order[3].includes("Pot Package")
    ? order[3].replace(potPackRegex, "")
    : order[3].replace(packRegex, "");
}

export async function createFormattedExcel(data, updated_packs) {
  try {
    var new_excel = updatePlantPacks(data, updated_packs);
    sortOrders(new_excel);
    numerizeOrders(new_excel);
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

    saveAs(
      blob,
      `${new Date().getMonth() + 1}.${new Date().getDate()}` + fileExtension
    );
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
      let quantity =
        order[3].match(/\d+/g) === null
          ? 5
          : parseInt(order[3].match(/\d+/g)[0]) * order[2];
      plantPackQtyAssignment(new_data, order[0], getPackNames(order), quantity);
    });
    return new_data;
  } else return data;
}

function plantPackQtyAssignment(excel_data, curr_order, pack_name, quantity) {
  plantPacks[pack_name].forEach((item) => {
    excel_data.push([
      curr_order,
      item["location"],
      quantity / 5,
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
  let curr_row = data[0][0],
    count = 1;
  for (let row of data) {
    if (row[0] !== curr_row) {
      count += 1;
      curr_row = row[0];
    }
    row.splice(1, 0, count);
  }
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
