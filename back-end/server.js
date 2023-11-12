require("dotenv").config();

const express = require("express");
const bodyparser = require("body-parser");
const app = express();
const orderRoute = require("./routes/orders");
const excelRoute = require("./routes/excels");

var cors = require("cors");

app.use(cors());
app.use(bodyparser.json({ limit: "10mb" }));
app.use(bodyparser.urlencoded({ extended: true, limit: "10mb" }));
const { createProxyMiddleware } = require("http-proxy-middleware");

app.use((req, res, next) => {
  next();
});

app.use("/orders", orderRoute);
app.use("/excels", excelRoute);

app.listen(process.env.PORT, () => {
  console.log("listen on port " + process.env.PORT);
});
