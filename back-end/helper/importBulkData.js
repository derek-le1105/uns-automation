const axios = require("axios");
const express = require("express");
const router = express.Router();
const readline = require("readline");
const fs = require("fs");

const wait = (n) => new Promise((resolve) => setTimeout(resolve, n));

const importBulkData = async (jsonData, filePrefixName) => {
  createJSONLFile(jsonData, filePrefixName);
};

const createJSONLFile = (jsonData, filePrefixName) => {
  const writer = fs.createWriteStream(`${filePrefixName}.jsonl`, {
    flags: "w",
  });
  jsonData.forEach((line) => {
    writer.write(`{input: ${JSON.stringify(line)}}\n`);
  });
};

module.exports = importBulkData;
