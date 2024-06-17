import * as Excel from "exceljs";

export async function readFileUpload(file, type) {
  return new Promise((resolve, reject) => {
    try {
      const wb = new Excel.Workbook();
      const reader = new FileReader();
      reader.readAsArrayBuffer(file);
      reader.onload = () => {
        const buffer = reader.result;
        wb.xlsx.load(buffer).then((workbook) => {
          if (type === "apc") resolve(apcParse(workbook));
          else wcaParse(workbook);
        });
      };
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
}

const wcaParse = (workbook) => {
  try {
    let prefixMap = { 4: "L", 6: "B", 8: "P", 10: "TR", 12: "TB", 14: "D" };
    let codes = [];
    const worksheet = workbook.getWorksheet("Plant List");
    worksheet.eachRow((row) => {
      let values = JSON.parse(JSON.stringify(row.values));
      //first index is null, everything else matches xlsx file

      //sets barcode to string as some read barcodes are numbers
      let barcode =
        typeof values[1] === "number" ? values[1].toString() : values[1];

      if (barcode !== "CODE") {
        for (const [col, prefix] of Object.entries(prefixMap)) {
          if (col >= values.length) continue;

          //some barcodes already have a prefix added to them
          if (/[a-zA-Z]+/.test(values[1])) {
            codes.push(values[1]);
          } else {
            codes.push(prefix + values[1]);
          }
        }
      }
    });
    return codes;
  } catch (error) {
    console.log(error);
  }
};

const apcParse = (workbook) => {
  try {
    let codes = [];
    var isValidRow = false;
    const worksheet = workbook.getWorksheet("Stocklist");
    let variantColumns = [2, 5, 8, 11, 14];
    worksheet.eachRow((row) => {
      if (isValidRow) {
        variantColumns.forEach((col) => codes.push(row.values[col]));
      }
      if (row.values[2] === "code" && !isValidRow) isValidRow = true;
    });
    return codes;
  } catch (error) {
    console.log(error);
  }
};
