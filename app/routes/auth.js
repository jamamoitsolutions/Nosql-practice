const router = require('express').Router();
require('dotenv').config();
const User = require('../models/User');
const authController = require('../controllers/auth');
const userController = require('../controllers/user');
const upload = require('../middlewares/multer');
const authMiddleware = require('../middlewares/auth');

router.post("/register", authController.register);
router.post("/login", authController.login);
// router.post("/signin", [verifyMirosoftToken], controller.verify_user);
router.post("/getPublicInfo", [], userController.getPublicInfo);
router.post("/signin",[authMiddleware.verifyMirosoftToken], authController.azure_login);
router.post("/azure-invite", [upload.fields([
    { name: "profile" }
  ]),authMiddleware.getADToken], authController.send_azure_invite);

module.exports = router;