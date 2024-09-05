const app = require('express')();
const Allrouter = require("./app/routes/index");
const PORT = process.env.PORT || 3000;
const logger = require('morgan');
app.use(logger('dev'));
app.use(require('express').json());
require('./app/db/connection');
const cors = require("cors");
const cron = require("node-cron");


// set public folder as public
app.use(require('express').static('app/public'));
// set the view engine to ejs
app.set("view engine", "ejs");

require("dotenv").config();

app.use(require('express').json());
app.use(require('express').urlencoded({ extended: false }));
app.use(cors()); 

// base route
app.get("/", (req, res) => {
  res
    .status(200)
    .send({ message: "Welcome to jamamo backend portal.",
  updated_at: "05-09-2024 04:13 PM IST" });
    });

// all routes
app.use("/api/v1/",require("./app/routes/index"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});