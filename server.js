const app = require('express')();
const Allrouter = require("./routes/index");
const PORT = process.env.PORT || 3000;
const logger = require('morgan');
app.use(logger('dev'));
app.use(require('express').json());
require('./db/connection');

// base route
app.get('/', (req, res) => {
  res.send('Hello World');
});

// all routes
app.use("/api/v1/",require("./routes/index"));

app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT}`);
});