require("dotenv").config();

const express = require("express");
const app = express();
const orderRoute = require("./routes/orders");
const excelRoute = require("./routes/excels");
var cors = require("cors");

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
const { createProxyMiddleware } = require("http-proxy-middleware");

app.use((req, res, next) => {
  next();
});

app.use("/orders", orderRoute);
app.use("/excels", excelRoute);

app.listen(process.env.PORT, () => {
  console.log("listen on port " + process.env.PORT);
});
