const productUpdateString = {
  input: "ProductInput",
  mutation: `productUpdate(input: $input) { 
  product {
      id 
      status
      title
  } `,
};

const variantUpdateString = {
  input: "ProductVariantInput",
  mutation: `productVariantUpdate(input: $input) { 
  productVariant {
      id
      inventoryPolicy
  } `,
};

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
                    cancelledAt
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
    console.log(error.lineNumber);
  }
};

const vendorFilterString = (vendor) => {
  return `mutation{
      bulkOperationRunQuery(
      query: """
      {
          products(first: 2000, query: "${vendor}"){
              edges{
                node{
                  id
                  title
                  status
                  vendor
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
        mutation: """mutation call($input: ${inputType.input}!) { 
                ${inputType.mutation}
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

const wholesaleOrdersQuery = (dates) => {
  return `query {
  orders(first: 75, query: "created_at:>'${dates[1]}' created_at:<'${dates[0]}' tag:'PlantOrder' -tag:'Edit Order'"){
            edges{
              node{
                  id
                  name  
                  customer{
                    firstName
                    lastName
                  }shippingLine{
                      title
                    }
                  cancelledAt
              }
            }
          }
}`;
};

const pollBulkMutationQuery = () => {
  return `query {
  currentBulkOperation(type: MUTATION) {
      id
      status
      errorCode
      createdAt
      completedAt
      objectCount
      fileSize
      url
      partialDataUrl
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
  wholesaleOrdersQuery,
  pollBulkMutationQuery,
};
