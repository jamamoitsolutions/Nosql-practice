const adminRoutes = require("express").Router();
const adminController = require("../controllers/admin");

adminRoutes.post("/addCourse", adminController.addCourse);
adminRoutes.post("/addBatch", adminController.addBatch);


    module.exports = adminRoutes;