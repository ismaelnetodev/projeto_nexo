const express = require("express");
const { Login } = require("../controllers/authController.js");
const ApiRateLimiter = require("../middlewares/authMiddleware.js");

const router = express.Router();
router.post("/login", ApiRateLimiter, LoginController);
module.exports = router;