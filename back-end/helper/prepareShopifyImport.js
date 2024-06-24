const downloadBulkData = require("../helper/downloadBulkData");
const { vendorFilterString } = require("../helper/shopifyGQLStrings");
const { compare } = require("../helper/transhipHelper");

const readline = require("readline");
const fs = require("fs");

const parseData = async (filename) => {
  const dataContainer = [];
  let currVendor = "";
  function processJSONLData() {
    return new Promise((resolve, reject) => {
      const jsonlFilePath = `${filename}.jsonl`; // The path to the downloaded JSONL file
      const readStream = readline.createInterface({
        input: fs.createReadStream(jsonlFilePath),
      });
      readStream.on("line", (line) => {
        try {
          const cleanLine = line.replace(/'/g, "");
          const jsonData = JSON.parse(cleanLine);
          if (!jsonData.id.includes("ProductVariant")) {
            dataContainer.push({
              id: jsonData.id,
              status: jsonData.status,
              title: jsonData.title,
              vendor: jsonData.vendor,
              variants: [],
            });
            currVendor = jsonData.vendor;
          } else {
            dataContainer[dataContainer.length - 1].variants.push({
              id: jsonData.id,
              barcode: jsonData.barcode,
              inventoryPolicy: jsonData.inventoryPolicy,
              vendor: currVendor,
            });
          }
        } catch (error) {
          //TODO: handle error when reading line stops abruptly
          console.error("Error parsing JSON:", error);
        }
      });

      readStream.on("close", () => {
        resolve(dataContainer); // Resolve the Promise when processing is complete
      });
    });
  }

  // Call the async function to start processing JSONL data
  return processJSONLData().then((data) => {
    return data;
  });
};

const isValidProduct = (product) => {
  const isTissueCulture = (product) => {
    let { title } = product;

    if (typeof title === "string") {
      if (
        title.includes("Tissue Culture") ||
        title.includes("Cup") ||
        title.includes("TC")
      ) {
        return true;
      }
    }
    return false;
  };

  let isValid = true;
  let packs = [
    "$500 Assorted Plant Pack",
    "Assorted Stem Pack",
    "Assorted Tissue Culture Pack",
  ];
  let { title, status } = product;
  packs.forEach((pack) => {
    if (!isValid) return;
    if (title.includes(pack)) isValid = false;
  });

  if (status === "Archived") isValid = false;

  if (isTissueCulture(product)) isValid = false;

  return isValid;
};

const prepareShopifyImport = async (
  vendorPlantCodes,
  filterString,
  vendorString
) => {
  /**
   *
   * @param {*} shopifyData Data from Shopify GraphQL query
   * @param {*} apcData Data from user file input
   * @returns
   */
  const consolidatePlantDatas = (shopifyData, apcData) => {
    try {
      const reformatShopifyData = (shopifyData) => {
        //{ 'barcode': {}}
        let barcodes = {};
        shopifyData.forEach((product) => {
          let { variants, vendor, title } = product;
          variants.forEach((variant) => {
            let { id, barcode, inventoryPolicy } = variant;
            if (barcodes[barcode] === undefined) {
              barcodes[barcode] = {
                exists: false,
                title: title,
                vendors: {
                  [vendor]: { id, inventoryPolicy },
                },
              };
            } else {
              barcodes[barcode]["vendors"][vendor] = { id, inventoryPolicy };
            }
          });
        });
        return barcodes;
      };

      let newShopifyData = reformatShopifyData(shopifyData);
      let sortedShopifyKeys = Object.keys(newShopifyData).sort();
      let intersection = sortedShopifyKeys.filter((x) => apcData.includes(x));
      intersection.forEach((barcode) => {
        newShopifyData[barcode]["exists"] = true;
      });
      return newShopifyData;
    } catch (error) {
      console.log(error.lineNumber);
    }
  };

  const isValidBarcode = (product, barcodeMap) => {
    let isValid = true;
    let { variants, title } = product;

    variants.forEach((variant) => {
      if (!isValid) return;
      let { barcode } = variant;
      let vendors = Object.keys(barcodeMap[barcode].vendors);
      if (vendors.length <= 1 && !vendors[0].includes("-TS")) {
        isValid = false;
      }
    });
    return isValid;
  };

  await downloadBulkData(vendorFilterString(filterString), vendorString);

  let shopifyVendorPlants = await parseData(vendorString);

  let productUpdateList = [],
    productUpdateVariantList = [],
    notOnShopifyList = [];

  let barcodeExistsMap = consolidatePlantDatas(
    shopifyVendorPlants,
    vendorPlantCodes
  );
  //tracks which product variants to make active
  shopifyVendorPlants.forEach((product) => {
    if (!isValidProduct(product)) return;
    if (!isValidBarcode(product, barcodeExistsMap)) return;
    let [productToUpdate, variantToUpdate] = compare(product, barcodeExistsMap);

    if (productToUpdate.status !== product.status) {
      let { variants, vendor, ...rest } = productToUpdate;
      productUpdateList.push(rest);
    }
    variantToUpdate.forEach((variant) => {
      let { barcode, inventoryPolicy, vendor } = variant;
      let { vendors } = barcodeExistsMap[barcode];
      if (vendors[vendor].inventoryPolicy !== inventoryPolicy) {
        let { barcode, vendor, ...rest } = variant;
        productUpdateVariantList.push(rest);
      }
    });
  });

  return [productUpdateList, productUpdateVariantList];
};

module.exports = prepareShopifyImport;
