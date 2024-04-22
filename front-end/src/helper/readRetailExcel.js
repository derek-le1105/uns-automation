import * as Excel from "exceljs";
import { saveAs } from "file-saver";

const plantPacks = {
  "Assorted Anubias Plant Pack": [
    "Anubias Congensis (AAP)",
    "Anubias Congensis mini (AAP)",
    "Anubias Minima (AAP)",
    "Anubias Nana (AAP)",
    "Anubias Nana Petite (AAP)",
  ],
  "Beginner Plant Pack": [
    "Anubias Nana - Pot (BPP)",
    "Anubias Nana Petite - Pot  (BPP)",
    "Crypt Beckettii  (BPP)",
    "Java Fern Pot (BPP)",
    "Java Fern Windelov (BPP)",
  ],
  "Red Stem Plant Pack": [
    "Limnophila Aromatica (RSP)",
    "Ludwigia Diamond (RSP)",
    "Ludwigia Ovalis   (RSP)",
    "Ludwigia Super Red   (RSP)",
    "Rotala Blood Red  (RSP)",
  ],
  "Team Buce Plant Potted Starter Pack": [
    "Arrogant Blue (PBP)",
    "Black Pearl (PBP)",
    "Brownie Jade (PBP)",
    "Lamandau Mini Purple (PBP)",
    "Velvet 3 color (PBP)",
  ],
  "Assorted Echinodorus Pack": [
    "Echinodorus Martii Major",
    "Echinodorus Ozelot Green",
    "Echinodorus Ozelot",
    "Echinodorus Cordifolius",
    "Echinodorus Rose",
  ],
  "Aquarium Moss Collector Pack": [
    "Christmas Moss",
    "Java Moss",
    "Flame Moss",
    "Peacock Moss",
    "Spikey Moss",
  ],
};

export async function readRetailExcel(file) {
  const packRegex = / - \d+ Pack/;
  const potPackRegex = / - \d+ Pot Package/;
  const reader = new FileReader();

  const excel_data = [];
  const plant_packs_detects = {};

  return new Promise((resolve, reject) => {
    reader.readAsText(file);

    reader.onload = function (e) {
      const text = e.target.result;
      text.split("\r\n").forEach((row) => {
        let order_split = row.split(",");
        if (new RegExp(/^zstem$/i).test(order_split[1])) {
          let pack_qty =
            order_split[3].match(/\d+/g) === null
              ? 5
              : parseInt(order_split[3].match(/\d+/g)[0]);
          let pack_name = order_split[3].includes("Pot Package")
            ? order_split[3].replace(potPackRegex, "")
            : order_split[3].replace(packRegex, "");
          if (!Object.keys(plant_packs_detects).includes(pack_name))
            plant_packs_detects[pack_name] = plantPacks[pack_name];
          plantPackQtyAssignment(
            excel_data,
            order_split[0],
            pack_name,
            pack_qty
          );
        } else {
          if (order_split[1] !== "" && order_split[1] !== "ZZstem")
            excel_data.push(order_split);
        }
      });
      excel_data.splice(0, 1);
      excel_data.splice(excel_data.length - 1, 1);
    };

    reader.onloadend = function (e) {
      sortOrders(excel_data);
      numerizeOrders(excel_data);
      let mapping = formattingLocations(alphabetizeLocations(excel_data));
      resolve([mapping, plant_packs_detects]);
    };
  });
}

function plantPackQtyAssignment(excel_data, curr_order, pack_name, quantity) {
  let location = "";
  switch (pack_name) {
    case "Assorted Anubias Plant Pack":
      location = "Anubias";
      break;
    case "Team Buce Plant Potted Starter Pack":
      location = "Buce pot";
      break;
    case "Red Stem Plant Pack":
      location = "Stem";
      break;
    case "Assorted Echinodorus Pack":
      location = "Echinodorus";
      break;
    case "Aquarium Moss Collector Pack":
      location = "moss";
      break;
    default:
      break;
  }
  plantPacks[pack_name].forEach((item) => {
    if (pack_name === "Beginner Plant Pack") location = item.split(" ")[0];
    if (item.includes("Fern")) location = "Fern";
    excel_data.push([curr_order, location, quantity / 5, item]);
  });
}

function sortOrders(data) {
  data = [data[0]].concat(
    data.slice(1).sort((a, b) => {
      let a_sliced = a[0].slice(3),
        b_sliced = b[0].slice(3);
      if (a_sliced < b_sliced) {
        return -1;
      }
      if (a_sliced > b_sliced) return 1;
      return 0;
    })
  );
  data.splice(1, 1);
}

function numerizeOrders(data) {
  let curr_row = data[1][0],
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
    //console.log(row);
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

export async function createFormattedExcel(data) {
  const wb = new Excel.Workbook();
  const wb_sheet = wb.addWorksheet("Sheet 1");

  wb_sheet.addRow([
    "Order - Number",
    "code",
    "Item - Location",
    "Item - Qty",
    "Item -Name",
  ]);
  let locations = Object.keys(data).sort();
  locations.forEach((location) => {
    data[location].forEach((plant_row) => {
      wb_sheet.addRow(plant_row);
    });
    wb_sheet.addRow([]);
  });

  const buffer = await wb.xlsx.writeBuffer();
  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  const fileExtension = ".xlsx";

  const blob = new Blob([buffer], { type: fileType });

  saveAs(blob, `${"testasdfa"}` + fileExtension);
}
