const getBulkData = require("../helper/getBulkData");
const { vendorFilterString } = require("../helper/shopifyGQLStrings");
const { compare } = require("../helper/transhipHelper");

const readline = require("readline");
const fs = require("fs");

const parseData = async (filename) => {
  const dataContainer = [];
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
              variants: [],
            });
          } else {
            dataContainer[dataContainer.length - 1].variants.push({
              id: jsonData.id,
              barcode: jsonData.barcode,
              inventoryPolicy: jsonData.inventoryPolicy,
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

const prepareShopifyImport = async (vendorPlantCodes, vendorString) => {
  /**
   *
   * @param {*} shopifyData Data from Shopify GraphQL query
   * @param {*} apcData Data from user file input
   * @returns
   */
  const consolidatePlantDatas = (shopifyData, apcData) => {
    try {
      const reformatShopifyData = (shopifyData) => {
        let barcodes = {};
        //console.log(shopifyData);
        shopifyData.forEach((product) => {
          let { variants } = product;
          variants.forEach((variant) => {
            //console.log(variant);
            let { id, barcode, inventoryPolicy } = variant;
            if (barcodes[barcode] === undefined) {
              barcodes[barcode] = {
                id: id,
                inventoryPolicy: inventoryPolicy,
                exists: false,
              };
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
      console.log(error);
    }
  };

  let shopifyVendorPlants = await getBulkData(
    vendorFilterString(vendorString),
    parseData,
    vendorString
  );

  let productUpdateList = [],
    productUpdateVariantList = [],
    notOnShopifyList = [];

  let barcodeExistsMap = consolidatePlantDatas(
    shopifyVendorPlants,
    vendorPlantCodes
  );
  //tracks which product variants to make active
  shopifyVendorPlants.forEach((product) => {
    let [productToUpdate, variantToUpdate] = compare(product, barcodeExistsMap);

    if (productToUpdate.status !== product.status) {
      let { variants, ...rest } = productToUpdate;
      productUpdateList.push(rest);
    }

    variantToUpdate.forEach((variant) => {
      if (
        barcodeExistsMap[variant.barcode]["inventoryPolicy"] !==
        variant.inventoryPolicy
      ) {
        let { barcode, ...rest } = variant;
        productUpdateVariantList.push(rest);
      }
    });
  });

  console.log("products to update: ", productUpdateList.length);
  console.log("variants to update: ", productUpdateVariantList.length);

  return [productUpdateList, productUpdateVariantList];
};

module.exports = prepareShopifyImport;
