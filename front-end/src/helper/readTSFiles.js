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
          else resolve(wcaParse(workbook));
        });
      };
    } catch (error) {
      console.log(error);
      reject(error);
    }
  });
}

/**
 * Parses through file input provided through APC input component and returns
 * a list of barcodes that are available for stores to order from.
 * WCA and APC provide different formats for their stocklist
 * @param {*} workbook Workbook object provided by ExcelJS library
 * @returns A list of barcodes where each barcode is a product variant that is in stock from APC
 */
const wcaParse = (workbook) => {
  try {
    let prefixMap = { 4: "L", 6: "B", 8: "P", 10: "TR", 12: "TB", 14: "D" };
    let codes = [];
    const worksheet = workbook.getWorksheet("Plant List");
    worksheet.eachRow((row) => {
      //first index is null, everything else matches xlsx file
      let values = JSON.parse(JSON.stringify(row.values));

      //sets barcode to string as some read barcodes are numbers
      let barcode =
        typeof values[1] === "number" ? values[1].toString() : values[1];

      if (typeof values[15] === "string") {
        if (values[15].includes("Not Available")) return;
      }
      if (barcode !== "CODE") {
        if (/[a-zA-Z]+/.test(values[1])) {
          if (typeof values[14] === "string") {
            if (values[14].includes("Not Available")) return;
          }
          codes.push(values[1]);
        }
        for (const [col, prefix] of Object.entries(prefixMap)) {
          if (col >= values.length) continue;
          if (typeof values[col] === "string") {
            if (values[col].includes("Not Available")) continue;
          }

          codes.push(prefix + values[1]);
        }
      }
    });
    return codes;
  } catch (error) {
    console.log(error);
  }
};

/**
 * Parses through file input provided through APC input component and returns
 * a list of barcodes that are available for stores to order from
 * @param {*} workbook Workbook object provided by ExcelJS library
 * @returns A list of barcodes where each barcode is a product variant that is in stock from APC
 */
const apcParse = (workbook) => {
  try {
    let codes = [];
    var isValidRow = false;
    const worksheet = workbook.getWorksheet("Stocklist");
    let variantColumns = [2, 5, 8, 11, 14];
    worksheet.eachRow((row) => {
      if (isValidRow) {
        variantColumns.forEach((col) => {
          if (row.values[col] !== undefined) codes.push(row.values[col]);
        });
      }
      if (row.values[2] === "code" && !isValidRow) isValidRow = true;
    });
    return codes;
  } catch (error) {
    console.log(error);
  }
};
