const { header } = require("express-validator")
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
    errors: null,
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

    res.render("./inventory/vehicle-detail", { title: `${vehicle.inv_make} ${vehicle.inv_model}`, 
      nav, 
      vehicleDetail,
      errors: null, })
  } catch (error) {
    console.error("Error fetching vehicle details:", error)
    res.status(500).render("error", { title: "Error", message: "Internal Server Error", nav })
  }
};

invCont.renderManagementView = async function(req, res) {
const nav = await utilities.getNav() 
  res.render("inventory/management", {
    title: "Inventory Management",
    nav,
    message: req.flash("info")
  })
}

invCont.renderClassificationView = async function(req, res) {
  const nav = await utilities.getNav()  
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    message: req.flash("info"), 
    errors: req.flash("errors")
  })
}
//Add classification

invCont.addClassification = async function (req, res) {  // <-- Fix: Assign to invCont
  const { classification_name } = req.body;
  const pattern = /^[a-zA-Z0-9]+$/;
  if (!pattern.test(classification_name)) {
    req.flash("errors", ["Classification name cannot contain spaces or special characters."]);
    return res.redirect("/inv/add-classification");
  }
  try {
    const success = await invModel.insertClassification(classification_name);
    if (success) {
      req.flash("info", "Classification added successfully!");
      return res.redirect("/inv/");
    } else {
      req.flash("errors", ["Error adding classification. Please try again."]);
      return res.redirect("/inv/add-classification");
    }
  } catch (error) {
    console.error("Database error:", error);
    req.flash("errors", ["Server error. Please try again later."]);
    return res.redirect("/inv/add-classification");
  }
};

// Render Add Inventory View
invCont.renderAddInventoryView = async function (req, res) {
  const classificationList = await utilities.buildClassificationList(); // <-- Fix: Correct function
  const nav = await utilities.getNav();
  res.render("inventory/add-inventory", {
    title: "Add Inventory",
    classificationList,
    nav,
    message: req.flash("info"),
    errors: req.flash("errors"),
  });
};

// Add Inventory Handler
invCont.addInventory = async function (req, res) {  // <-- Fix: Assign to invCont
  const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body;
  if (!classification_id || !inv_make || !inv_model || !inv_description || !inv_price || !inv_year || !inv_miles || !inv_color) {
    req.flash("errors", ["All fields are required."]);
    return res.redirect("/inv/add-inventory");
  }
  try {
    const success = await invModel.insertInventory({ classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color });
    if (success) {
      req.flash("info", "Vehicle added successfully!");
      return res.redirect("/inv/");
    } else {
      req.flash("errors", ["Error adding vehicle. Please try again."]);
      return res.redirect("/inv/add-inventory");
    }
  } catch (error) {
    console.error("Database error:", error);
    req.flash("errors", ["Server error. Please try again later."]);
    return res.redirect("/inv/add-inventory");
  }
};
  

module.exports = invCont

