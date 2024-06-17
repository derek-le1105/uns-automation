const productUpdateString = `ProductUpdate(input: $input) { 
  product {
      id 
      status
      title
  } `;

const variantUpdateString = `ProductVariantUpdate(input: $input) { 
  product {
      id
      inventoryPolicy
  } `;

const wholesalePlantsQuery = (fridays) => {
  try {
    let query = `mutation{
      bulkOperationRunQuery(
      query: """
      {
          orders(first: 75, query: "created_at:>'${fridays[1]}' created_at:<'${fridays[0]}' tag:'PlantOrder' -tag:'Edit Order'"){
              edges{
                node{
                    id
                    name
                    customer{
                      firstName
                      lastName
                    }
                    shippingLine{
                      title
                    }
                  lineItems(first: 150){
                    edges{
                      node{
                        name
                        quantity
                        sku
                        vendor
                        variant{
                          barcode
                          title
                        }
                      }
                    }
                  }
                }
              }
            }
      }
      """)
      {
          bulkOperation {
              id
              status
          }
          userErrors{
              field
              message
          }
      }
    }`;
    return query;
  } catch (error) {
    console.log(error);
  }
};

const vendorFilterString = (vendor) => {
  return `mutation{
      bulkOperationRunQuery(
      query: """
      {
          products(first: 2000, query: "vendor:${vendor}"){
              edges{
                node{
                  id
                  title
                  status
                  variants(first: 10) {
                      edges{
                          node{
                            id
                            barcode
                            inventoryPolicy
                          }
                      }
                  }
                }
              }
            }
      }
      """)
      {
          bulkOperation {
              id
              status
          }
          userErrors{
              field
              message
          }
      }
  }`;
};

const requestBulkProductUpdate = (url, inputType) => {
  return `
      mutation {
      bulkOperationRunMutation(
        mutation: """mutation call($input: ProductInput!) { 
                ${inputType}
                userErrors { 
                    message 
                    field 
                } 
            } 
        }
        """,
      stagedUploadPath: "${url}") {
        bulkOperation {
          id
          url
          status
        }
        userErrors {
          message
          field
        }
      }
    }
  `;
};

module.exports = {
  vendorFilterString,
  requestBulkProductUpdate,
  wholesalePlantsQuery,
  productUpdateString,
  variantUpdateString,
};
