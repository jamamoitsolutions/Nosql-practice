const userRoutes = require("express").Router();
const userController = require("../controllers/user");
const courseController = require("../controllers/course");

userRoutes.get("/profile", userController.profile);
userRoutes.get("/list", userController.list);
userRoutes.post("/addDepartment", userController.addDepartment);
userRoutes.get("/deptList", userController.deptList);
userRoutes.get("/deptListWithUsers", userController.deptListWithUsers);
userRoutes.get("/getCourseList", courseController.getCourseList);
userRoutes.get("/getBatchList", courseController.getBatchList);
userRoutes.get("/demo/getCoursesBatchesUpcoming", courseController.getCoursesBatchesUpcoming);
userRoutes.post("/demo/submitDemoForm", courseController.submitDemoForm);
userRoutes.get("/demo/getBookedDemo", courseController.getBookedDemo);

    module.exports = userRoutes;