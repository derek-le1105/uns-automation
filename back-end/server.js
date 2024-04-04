require("dotenv").config();

const express = require("express");
const bodyparser = require("body-parser");
const app = express();
const ordersRoute = require("./routes/orders");
const shipstationRoute = require("./routes/shipstation");
const multer = require("multer");

var cors = require("cors");
const upload = multer({ dest: "uploads/" });

app.use(cors());
app.use(bodyparser.json({ limit: "10mb" }));
app.use(bodyparser.urlencoded({ extended: true, limit: "10mb" }));
//const { createProxyMiddleware } = require("http-proxy-middleware");

app.use((req, res, next) => {
  next();
});

app.use("/orders", ordersRoute);
app.use("/shipstation", shipstationRoute);

app.listen(process.env.PORT, () => {
  console.log("listen on port " + process.env.PORT);
});
