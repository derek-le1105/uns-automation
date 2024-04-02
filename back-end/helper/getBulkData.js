const axios = require("axios");
const express = require("express");
const router = express.Router();
const readline = require("readline");
const fs = require("fs");

const wait = (n) => new Promise((resolve) => setTimeout(resolve, n));

const getBulkData = async (queryString, parseCallback) => {
  try {
    await axios({
      url: "https://ultumnaturesystems.myshopify.com/admin/api/2023-10/graphql.json",
      method: "post",
      headers: {
        "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
        "Content-Type": "application/json",
      },
      data: {
        query: queryString,
      },
    });

    do {
      var response2 = await axios({
        url: "https://ultumnaturesystems.myshopify.com/admin/api/2023-10/graphql.json",
        method: "post",
        headers: {
          "X-Shopify-Access-Token": process.env.SHOPIFY_ACCESS_TOKEN,
          "Content-Type": "application/json",
        },
        data: {
          query: `query {
                      currentBulkOperation {
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
                    }`,
        },
      });
      await wait(1000);
    } while (response2.data.data.currentBulkOperation.status != "COMPLETED");

    const url = response2.data.data.currentBulkOperation.url;
    const writer = fs.createWriteStream("data.jsonl");
    await axios.get(url, { responseType: "stream" }).then((response) => {
      //https://stackoverflow.com/questions/55374755/node-js-axios-download-file-stream-and-writefile
      return new Promise((resolve, reject) => {
        response.data.pipe(writer);
        let error = null;
        writer.on("error", (err) => {
          error = err;
          writer.close();
          reject(err);
        });
        writer.on("close", () => {
          if (!error) {
            resolve(true);
          }
          //no need to call the reject here, as it will have been called in the
          //'error' stream;
        });
      });
    });
  } catch (error) {
    console.log("a", error);
  }

  return await parseCallback();
};

module.exports = getBulkData;
