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
      if (typeof values[1] !== "string") values[1] = values[1].toString();

      if (typeof values[3] !== "string") {
        if (values[1] !== "CODE") {
          //barcodes need to be assigned a value that says if they are available or not
          for (const [col, prefix] of Object.entries(prefixMap)) {
            if (/[a-zA-Z]+/.test(values[1])) {
              codes.push(values[1]);
              break;
            }
            if (col >= values.length) continue;
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
    worksheet.eachRow((row) => {
      if (isValidRow) {
        if (row.values[2] !== undefined) codes.push(row.values[2]);
        if (row.values[5] !== undefined) codes.push(row.values[5]);
        if (row.values[8] !== undefined) codes.push(row.values[8]);
        if (row.values[11] !== undefined) codes.push(row.values[11]);
        if (row.values[14] !== undefined) codes.push(row.values[14]);
      }
      if (row.values[2] === "code" && !isValidRow) isValidRow = true;
    });
    return codes;
  } catch (error) {
    console.log(error);
  }
};
