const app = require('express')();
const Allrouter = require("./app/routes/index");
const PORT = process.env.PORT || 3000;
const logger = require('morgan');
app.use(logger('dev'));
app.use(require('express').json());
require('./app/db/connection');
const cors = require("cors");


// set public folder as public
app.use(express.static('app/public'));
// set the view engine to ejs
app.set("view engine", "ejs");

require("dotenv").config();

app.use(express.json());
app.use(express.urlencoded({ extended: false }));
app.use(cors()); 

// base route
app.get("/", (req, res) => {
  res
    .status(200)
    .send({ message: "Welcome to jamamo backend portal (EC2).",
  updated_at: "12-02-2024 09:02 IST" });
    });

// all routes
app.use("/api/v1/",require("./app/routes/index"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});