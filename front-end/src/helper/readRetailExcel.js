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
  "Red Stem Pack": [
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
  const wb = new Excel.Workbook();
  const reader = new FileReader();

  const excelData = [];
  const plant_packs_detects = {};

  return new Promise((resolve, reject) => {
    reader.readAsText(file);

    reader.onload = function (e) {
      const text = e.target.result;
      text.split("\r\n").forEach((row) => {
        let order_split = row.split(",");
        if (order_split[1] === "zstem") {
          let pack_qty =
            order_split[3].match(/\d+/g) === null
              ? 5
              : parseInt(order_split[3].match(/\d+/g)[0]);
          let pack_name = order_split[3].includes("Pot Package")
            ? order_split[3].replace(potPackRegex, "")
            : order_split[3].replace(packRegex, "");
          if (!Object.keys(plant_packs_detects).includes(pack_name))
            plantPackQtyAssignment(plant_packs_detects, pack_name, pack_qty);
        } else {
          excelData.push(order_split);
        }
      });
    };

    reader.onloadend = function (e) {
      console.log(excelData);
      resolve(plant_packs_detects);
    };
  });

  // const formData = new FormData();
  // formData.append("file", file);

  // await fetch("/shipstation", {
  //   method: "POST",
  //   body: formData,
  // });
  // reader.readAsArrayBuffer(file);
  // reader.onload = () => {
  //   const buffer = reader.result;
  //   wb.csv.read(buffer).then((workbook) => {
  //     workbook.eachSheet((sheet, id) => {
  //       let rows = [];
  //       let code = 1;
  //       sheet.eachRow((row, rowIdx) => {
  //         console.log(row);
  //         if (rowIdx === 1) return;
  //         rows.push(row.values);
  //         if (!row.values[2]) return;
  //         if (row.values[2].toLowerCase() === "zstem") {
  //           let pack_name = row.values[4].toLowerCase();
  //           if (pack_name.includes("anubias"))
  //             packsDetected.add("Anubias Plant Pack");
  //           else if (pack_name.includes("beginner"))
  //             packsDetected.add("Beginner Plant Pack");
  //           else if (pack_name.includes("red"))
  //             packsDetected.add("Red Stem Pack");
  //           else if (pack_name.includes("potted"))
  //             packsDetected.add("Potted Buce Pack");
  //           else if (pack_name.includes("echinodorus"))
  //             packsDetected.add("Assorted Echinodorus Pack");
  //           else if (pack_name.includes("moss"))
  //             packsDetected.add("Aquarium Moss Collector Pack");
  //         }
  //       });
  //       rows.sort((a, b) => {
  //         if (a[1] < b[1]) {
  //           return -1;
  //         }
  //         if (a[1] > b[1]) {
  //           return 1;
  //         }
  //         return 0;
  //       });
  //       for (let i = 0; i < rows.length; i++) {
  //         rows[i].splice(2, 0, code);
  //         if (i + 1 >= rows.length) break;
  //         if (rows[i][1] !== rows[i + 1][1]) code += 1;
  //       }
  //     });
  //   });
  // };
}

function plantPackQtyAssignment(packsDetected, pack_name, quantity) {
  let qty_packs = [];
  plantPacks[pack_name].forEach((item) => {
    qty_packs.push([quantity / 5, item]);
  });
  packsDetected[pack_name] = qty_packs;
}

export async function createFormattedExcel(data) {
  console.log(data);
}
