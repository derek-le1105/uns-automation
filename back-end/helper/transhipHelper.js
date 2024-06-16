const compare = (product, barcodeMap) => {
  let newProduct = structuredClone(product);
  let productToUpdate = {};
  let variantToUpdate = [];
  let { variants } = newProduct;
  if (variants.length <= 1) {
    let barcode = variants[0].barcode;
    //check after if status remains the same after checking between APC
    //if same, dont do anything
    productToUpdate = barcodeMap[barcode]["exists"]
      ? {
          ...newProduct,
          status: "ACTIVE",
          variants: [
            { ...newProduct.variants[0], inventoryPolicy: "CONTINUE" },
          ],
        }
      : {
          ...newProduct,
          status: "DRAFT",
          variants: [{ ...newProduct.variants[0], inventoryPolicy: "DENY" }],
        };
  } else {
    let inventoryPolicySet = new Set();
    variants.forEach((variant) => {
      //if shopify barcode exists in apc list, make active if not already
      let { barcode, inventoryPolicy } = variant;
      if (barcodeMap[barcode]["exists"]) {
        variantToUpdate.push({ ...variant, inventoryPolicy: "CONTINUE" });

        inventoryPolicySet.add("CONTINUE");
      } else {
        variantToUpdate.push({ ...variant, inventoryPolicy: "DENY" });

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
