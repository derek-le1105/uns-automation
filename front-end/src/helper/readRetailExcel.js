import * as Excel from "exceljs";
import { saveAs } from "file-saver";

export async function readRetailExcel(file) {
  const wb = new Excel.Workbook();
  const reader = new FileReader();

  const excelData = [];
  const packsDetected = new Set([]);

  reader.readAsArrayBuffer(file);
  reader.onload = () => {
    const buffer = reader.result;
    wb.xlsx.load(buffer).then((workbook) => {
      workbook.eachSheet((sheet, id) => {
        let rows = [];
        let code = 1;
        sheet.eachRow((row, rowIdx) => {
          //console.log(row.values, rowIdx);
          if (rowIdx === 1) return;
          rows.push(row.values);
          if (!row.values[2]) return;
          if (row.values[2].toLowerCase() === "zstem") {
            let pack_name = row.values[4].toLowerCase();
            if (pack_name.includes("anubias"))
              packsDetected.add("Anubias Plant Pack");
            else if (pack_name.includes("beginner"))
              packsDetected.add("Beginner Plant Pack");
            else if (pack_name.includes("red"))
              packsDetected.add("Red Stem Pack");
            else if (pack_name.includes("potted"))
              packsDetected.add("Potted Buce Pack");
            else if (pack_name.includes("echinodorus"))
              packsDetected.add("Assorted Echinodorus Pack");
            else if (pack_name.includes("moss"))
              packsDetected.add("Aquarium Moss Collector Pack");
          }
        });
        rows.sort((a, b) => {
          if (a[1] < b[1]) {
            return -1;
          }
          if (a[1] > b[1]) {
            return 1;
          }
          return 0;
        });
        for (let i = 0; i < rows.length; i++) {
          rows[i].splice(2, 0, code);
          if (i + 1 >= rows.length) break;
          if (rows[i][1] !== rows[i + 1][1]) code += 1;
        }
      });
    });
  };
  return [excelData, packsDetected];
}

export async function createFormattedExcel(data) {
  console.log(data);
}
