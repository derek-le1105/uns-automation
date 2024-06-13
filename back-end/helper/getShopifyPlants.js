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

module.exports = getShopifyPlants;
