const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)
  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name
  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
  })
}


// async function getVehicleDetail (req, res) {
//   const invId = req.params.invId; // Getting the invId from the URL parameter
//   try {
//     const data = await invModel.getVehicleById(invId); // Make sure this uses the correct model method
//     if (data.rowCount === 0) {
//       return res.status(404).send("Vehicle not found");
//     }
//     const vehicleDetail = Util.buildVehicleDetail(data.rows[0]); // Assuming you have a method to build the detail
//     res.render('vehicleDetail', { vehicleDetail }); // Rendering the vehicle detail view
//   } catch (error) {
//     console.error("Error fetching vehicle details:", error);
//     res.status(500).send("An error occurred while retrieving vehicle details.");
//   }
// };

invCont.getVehicleDetail = async function (req, res, next) {
  const invId = req.params.invId // Get ID from URL
  
  try {
    const data = await invModel.getVehicleById(invId)

    if (!data || data.rowCount === 0) {
      // ✅ Correct error handling
      res.status(404).render("error", { title: "Error", message: "Vehicle not found", nav })
      return
    }

    const vehicle = data.rows[0]
    const vehicleDetail = utilities.buildVehicleDetail(vehicle);
    const nav = await utilities.getNav() 

    res.render("vehicle-detail", { title: `${vehicle.inv_make} ${vehicle.inv_model}`, nav, vehicleDetail })
  } catch (error) {
    console.error("Error fetching vehicle details:", error)
    res.status(500).render("error", { title: "Error", message: "Internal Server Error", nav })
  }
};


module.exports = invCont

