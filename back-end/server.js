require("dotenv").config();

const express = require("express");
const app = express();
const orderRoute = require("./routes/orders");
const itemRoute = require("./routes/item");
var cors = require("cors");

app.use(cors());

const { createProxyMiddleware } = require("http-proxy-middleware");

app.use((req, res, next) => {
  next();
});

app.use("/orders", orderRoute);
app.use("/item", itemRoute);

app.listen(process.env.PORT, () => {
  console.log("listen on port " + process.env.PORT);
});
