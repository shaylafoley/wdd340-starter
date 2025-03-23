const utilities = require("../utilities/")
const baseController = {}

baseController.buildHome = async function(req, res) {
  const nav = await utilities.getNav(); // Pass req to getNav
  res.render("index", { title: "Home", nav });
}

// baseController.buildByClassificationId = async function(req, res) {
//   const nav = await utilities.getNav(req); // Pass req to getNav
//   res.render("classification", { title: "Vehicles by Classification", nav });
// }

// baseController.getVehicleDetail = async function(req, res) {
//   const { invId } = req.params;
//   const vehicleDetails = await utilities.getDetail(invId); // Fetch vehicle details by ID
//   const nav = await utilities.getNav(req); // Pass req to getNav
//   res.render("vehicleDetail", { title: "Vehicle Detail", nav, vehicleDetails });
// }


module.exports = baseController
