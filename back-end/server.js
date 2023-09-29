require("dotenv").config();

const express = require("express");
const app = express();

app.use((req, res, next) => {
  res.json({ mssg: "test" });
  next();
});

app.listen(process.env.PORT, () => {
  console.log("listen on port " + process.env.PORT);
});
