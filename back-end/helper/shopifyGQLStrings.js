const getShopifyPlants = (vendor) => {
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

const requestBulkProductUpdate = (url) => {
  return `
      mutation {
      bulkOperationRunMutation(
        mutation: """mutation call($input: ProductInput!) { 
            productUpdate(input: $input) { 
                product {
                    id 
                    status
                    title
                } 
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

module.exports = { getShopifyPlants, requestBulkProductUpdate };
