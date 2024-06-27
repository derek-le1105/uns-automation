var _ = require("lodash");

const compare = (product, barcodeMap) => {
  let newProduct = _.cloneDeep(product);
  let productToUpdate = {};
  let variantToUpdate = [];
  let { variants, title } = newProduct;
  if (variants.length <= 1) {
    let barcode = variants[0].barcode;
    //check after if status remains the same after checking between APC
    //if same, dont do anything

    if (barcodeMap[barcode]["exists"]) {
      productToUpdate = {
        ...newProduct,
        status: "ACTIVE",
        variants: [{ ...newProduct.variants[0], inventoryPolicy: "CONTINUE" }],
      };
      variantToUpdate.push({
        ...newProduct.variants[0],
        title: title,
        inventoryPolicy: "CONTINUE",
      });
    } else {
      productToUpdate = {
        ...newProduct,
        status: "DRAFT",
        variants: [{ ...newProduct.variants[0], inventoryPolicy: "DENY" }],
      };
      variantToUpdate.push({
        ...newProduct.variants[0],
        title: title,
        inventoryPolicy: "DENY",
      });
    }
  } else {
    let inventoryPolicySet = new Set();
    variants.forEach((variant) => {
      //if shopify barcode exists in apc list, make active if not already
      let { barcode, inventoryPolicy } = variant;
      if (barcodeMap[barcode]["exists"]) {
        variantToUpdate.push({
          ...variant,
          title: title,
          inventoryPolicy: "CONTINUE",
        });

        inventoryPolicySet.add("CONTINUE");
      } else {
        variantToUpdate.push({
          ...variant,
          title: title,
          inventoryPolicy: "DENY",
        });

        inventoryPolicySet.add("DENY");
      }
    });
    if (inventoryPolicySet.size > 1) {
      productToUpdate = { ...newProduct, status: "ACTIVE" };
    } else {
      if (inventoryPolicySet.has("DENY"))
        productToUpdate = { ...newProduct, status: "DRAFT" };
      else productToUpdate = { ...newProduct, status: "ACTIVE" };
    }
  }

  return [productToUpdate, variantToUpdate];
};

module.exports = { compare };
