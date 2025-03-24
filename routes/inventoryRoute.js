// Needed Resources 
const express = require("express");
const router = new express.Router() 
const invController = require("../controllers/invController")

// Route to build inventory by classification view
router.get("/type/:classificationId", invController.buildByClassificationId);
router.get("/detail/:invId", invController.getVehicleDetail);
router.get("/favicon.ico", (req, res) => res.status(204).end());

module.exports = router;
