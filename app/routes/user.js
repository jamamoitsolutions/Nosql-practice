const userRoutes = require("express").Router();
const userController = require("../controllers/user");

userRoutes.get("/profile", userController.profile);
userRoutes.get("/list", userController.list);
userRoutes.post("/addDepartment", userController.addDepartment);
userRoutes.get("/deptList", userController.deptList);
userRoutes.get("/deptListWithUsers", userController.deptListWithUsers);

    module.exports = userRoutes;