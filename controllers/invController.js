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

    res.render("./inventory/vehicle-detail", { title: `${vehicle.inv_make} ${vehicle.inv_model}`, nav, vehicleDetail })
  } catch (error) {
    console.error("Error fetching vehicle details:", error)
    res.status(500).render("error", { title: "Error", message: "Internal Server Error", nav })
  }
};


module.exports = invCont

