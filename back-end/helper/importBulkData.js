const axios = require("axios");
const fs = require("fs");
const FormData = require("form-data");

const { requestBulkProductUpdate } = require("../helper/shopifyGQLStrings");

const wait = (n) => new Promise((resolve) => setTimeout(resolve, n));

const importBulkData = async (jsonData, filePrefixName, inputType) => {
  try {
    createJSONLFile(jsonData, filePrefixName);
    // const parameters = await generateParameters();
    // const url = await stagedShopifyRequest(parameters);

    // const res = await axios({
    //   url: "https://ultumnaturesystems.myshopify.com/admin/api/2023-10/graphql.json",
    //   method: "post",
    //   headers: {
    //     "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
    //     "Content-Type": "application/json",
    //   },
    //   data: {
    //     query: requestBulkProductUpdate(url, inputType),
    //   },
    // });
  } catch (error) {
    console.log(error);
  }
};

const createJSONLFile = (jsonData, filePrefixName) => {
  const writer = fs.createWriteStream(`${filePrefixName}.jsonl`, {
    flags: "w",
  });
  jsonData.forEach((line) => {
    //variants cannot be added while bulk updating products
    let { variants, ...rest } = line;
    //console.log(variants, rest);
    writer.write(`{"input": ${JSON.stringify(rest)}}\n`);
  });
};

const generateParameters = () => {
  return new Promise(async (resolve, reject) => {
    await axios({
      url: "https://ultumnaturesystems.myshopify.com/admin/api/2024-04/graphql.json",
      method: "post",
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
      data: {
        query: `mutation {
            stagedUploadsCreate(input:{
                resource: BULK_MUTATION_VARIABLES,
                filename: "bulk_op_vars",
                mimeType: "text/jsonl",
                httpMethod: POST
            }){
                userErrors{
                    field,
                    message
                },
                stagedTargets{
                    url,
                    resourceUrl,
                    parameters {
                        name,
                        value
                    }
                }
            }
        }`,
      },
    })
      .then(({ data }) => {
        resolve(data.data.stagedUploadsCreate.stagedTargets[0]);
      })
      .catch((err) => reject(err));
  });
};

const stagedShopifyRequest = async (data) => {
  try {
    let { url, resourceUrl, parameters } = data;
    let key = "";
    var shopifyFormData = new FormData();

    parameters.forEach((param) => {
      if (param.name === "key") key = param.value;
      shopifyFormData.append(param.name, param.value);
    });

    //change 'testingapc' whenever ready to upload files
    shopifyFormData.append(
      "file",
      fs.readFileSync(
        "C:/Users/derek/Documents/code project/uns-automation/back-end/testingapc.jsonl"
      ),
      "C:/Users/derek/Documents/code project/uns-automation/back-end/testingapc.jsonl"
    );
    const response = await axios.post(url, shopifyFormData, {
      headers: { ...shopifyFormData.getHeaders() },
    });
    //console.log(response);
    return key;
  } catch (error) {
    console.log(error);
  }
};

module.exports = importBulkData;
