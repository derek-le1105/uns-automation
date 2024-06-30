import * as Excel from "exceljs";
import { saveAs } from "file-saver";

export default async function createTranshipDraft(data) {
  let [products, variants] = data;

  const wb = new Excel.Workbook();
  const product_sheet = wb.addWorksheet("Drafted");
  const variant_sheet = wb.addWorksheet("Denied Overselling");

  product_sheet.addRow(["Title", " Vendor", "Status"]);
  products.forEach((product) => {
    let { title, vendor, status } = product;
    if (status === "DRAFT") product_sheet.addRow([title, vendor, status]);
  });

  variant_sheet.addRow(["Title", "Barcode", "Vendor", "Allow Oversell?"]);
  variants.forEach((variant) => {
    let { title, barcode, vendor, inventoryPolicy } = variant;
    if (inventoryPolicy === "DENY")
      variant_sheet.addRow([title, barcode, vendor, inventoryPolicy]);
  });

  const buffer = await wb.xlsx.writeBuffer();
  const fileType =
    "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet";
  const fileExtension = ".xlsx";

  const blob = new Blob([buffer], { type: fileType });

  saveAs(
    blob,
    `APC Drafted ${new Date().getMonth() + 1}/${new Date().getDate() + 1}` +
      fileExtension
  );
}
