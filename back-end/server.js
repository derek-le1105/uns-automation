require("dotenv").config();

const express = require("express");
const bodyparser = require("body-parser");
const app = express();
const ordersRoute = require("./routes/orders");
const apcRoute = require("./routes/apc");
const wcaRoute = require("./routes/wca");
const transhipRoute = require("./routes/tranship");
const newordersRoute = require("./routes/orderstest");

var cors = require("cors");

app.use(cors());
app.use(bodyparser.json({ limit: "10mb" }));
app.use(bodyparser.urlencoded({ extended: true, limit: "10mb" }));
//const { createProxyMiddleware } = require("http-proxy-middleware");

app.use((req, res, next) => {
  next();
});

app.use("/orders", ordersRoute);
app.use("/apc", apcRoute);
app.use("/wca", wcaRoute);
app.use("/tsOrders", transhipRoute);
app.use("/v2/orders", newordersRoute);

app.listen(process.env.PORT, () => {
  console.log("listen on paort " + process.env.PORT);
});
