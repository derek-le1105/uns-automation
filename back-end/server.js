require("dotenv").config();

const express = require("express");
const app = express();
const shopifyRoutes = require("./routes/shopify");
var cors = require("cors");

app.use(cors());

const { createProxyMiddleware } = require("http-proxy-middleware");

app.use((req, res, next) => {
  console.log(req.path, req.method);
  next();
});

app.use("/pullShopifyOrders", shopifyRoutes);

app.listen(process.env.PORT, () => {
  console.log("listen on port " + process.env.PORT);
});
