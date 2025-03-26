const express = require("express");
const router = new express.Router() 
const accountController = require("../controllers/accountController")
const utilities = require("../utilities")

router.get("/register", utilities.handleErrors(accountController.buildRegister))


module.exports = router