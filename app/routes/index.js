// Initiate all routes here
const Allrouter = require('express').Router();
const router = require("./auth");
const userRoutes = require("./user");
const {auth} = require("../middlewares/auth");

// Allrouter.use("/auth", (req, res) => {
//   res.send('Auth route');
// });

Allrouter.use("/auth", router);
Allrouter.use(auth);
Allrouter.use("/user", userRoutes);
Allrouter.use("/admin", require("./admin"));

module.exports = Allrouter;

