const router = require('express').Router();
require('dotenv').config();
const User = require('../models/User');
const authController = require('../controllers/auth');

router.post("/register", authController.register);
router.post("/login", authController.login);

module.exports = router;