const axios = require("axios");
const express = require("express");
const router = express.Router();
const readline = require("readline");
const fs = require("fs");
const FormData = require("form-data");

const wait = (n) => new Promise((resolve) => setTimeout(resolve, n));

const importBulkData = async (jsonData, filePrefixName) => {
  try {
    createJSONLFile(jsonData, filePrefixName);

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
    }).then(async ({ data }) => {
      let { url, resourceUrl, parameters } =
        data.data.stagedUploadsCreate.stagedTargets[0];
      var shopifyFormData = new FormData();
      let key = "";
      parameters.forEach((param) => {
        if (param.name === "key") key = param.value;
        shopifyFormData.append(param.name, param.value);
      });
      console.log("qwe");
      shopifyFormData.append(
        "file",
        fs.readFileSync(
          "C:/Users/derek/Documents/code project/uns-automation/back-end/testingapc.jsonl"
        ),
        "C:/Users/derek/Documents/code project/uns-automation/back-end/testingapc.jsonl"
      );
      console.log(url);
      const response = await axios.post(url, shopifyFormData, {
        headers: { ...shopifyFormData.getHeaders() },
      });
      console.log(key);
    });
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
    console.log(variants, rest);
    writer.write(`{"input": ${JSON.stringify(rest)}}\n`);
  });
};

module.exports = importBulkData;
