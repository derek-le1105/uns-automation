import * as Excel from "exceljs";

export async function readAPCFileUpload(file) {
  return new Promise((resolve, reject) => {
    const wb = new Excel.Workbook();
    const reader = new FileReader();
    const codes = [];
    var isValidRow = false;
    reader.readAsArrayBuffer(file);
    reader.onload = () => {
      const buffer = reader.result;
      wb.xlsx.load(buffer).then((workbook) => {
        const worksheet = workbook.getWorksheet("Stocklist");
        worksheet.eachRow((row, rowIdx) => {
          if (isValidRow) {
            if (row.values[2] !== undefined) codes.push(row.values[2]);
            if (row.values[5] !== undefined) codes.push(row.values[5]);
            if (row.values[8] !== undefined) codes.push(row.values[8]);
            if (row.values[11] !== undefined) codes.push(row.values[11]);
            if (row.values[14] !== undefined) codes.push(row.values[14]);
          }
          if (row.values[2] === "code" && !isValidRow) isValidRow = true;
        });
        resolve(codes);
      });
    };
  });
}
