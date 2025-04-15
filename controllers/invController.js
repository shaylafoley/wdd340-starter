const { header } = require("express-validator")
const invModel = require("../models/inventory-model")
const utilities = require("../utilities/")
const bcrypt = require("bcryptjs")
const reviewModel = require("../models/reviewModel")

const invCont = {}

/* ***************************
 *  Build inventory by classification view
 * ************************** */
invCont.buildByClassificationId = async function (req, res, next) {
  const classification_id = req.params.classificationId
  const data = await invModel.getInventoryByClassificationId(classification_id)

  // ✅ If no vehicles found, redirect with message
  if (!data || data.length === 0) {
    req.flash("notice", "Sorry, we appear to have lost that page.")
    return res.redirect("/inv")
  }

  const grid = await utilities.buildClassificationGrid(data)
  let nav = await utilities.getNav()
  const className = data[0].classification_name

  res.render("./inventory/classification", {
    title: className + " vehicles",
    nav,
    grid,
    errors: null,
    messages: req.flash() // 👈 Include flash messages here
  })
}


// invCont.buildByClassificationId = async function (req, res, next) {
//   const classification_id = req.params.classificationId
//   const data = await invModel.getInventoryByClassificationId(classification_id)
//   const grid = await utilities.buildClassificationGrid(data)
//   let nav = await utilities.getNav()
//   const className = data[0].classification_name
//   res.render("./inventory/classification", {
//     title: className + " vehicles",
//     nav,
//     grid,
//     errors: null,
//   })
// }

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
    const reviews = await reviewModel.getReviewsByInvId(invId)

    res.render("./inventory/vehicle-detail", { title: `${vehicle.inv_make} ${vehicle.inv_model}`, 
      nav, 
      vehicle,
      vehicleDetail,
      reviews,
      loggedin: req.session.loggedin,
      username: req.session.username,
      errors: null,
      messages: req.flash() })
  } catch (error) {
    console.error("Error fetching vehicle details:", error)
    res.status(500).render("error", { title: "Error", message: "Internal Server Error", nav })
  }
};

invCont.renderManagementView = async function(req, res) {
const nav = await utilities.getNav() 
const classificationSelect = await utilities.buildClassificationList()
const message = req.flash("notice");
  res .render("inventory/management", {
    title: "Inventory Management",
    nav,
    message: message.length > 0 ? message[0] : null,
    classificationSelect, 
  })
}

invCont.renderClassificationView = async function(req, res) {
  const nav = await utilities.getNav()
  
  res.render("inventory/add-classification", {
    title: "Add Classification",
    nav,
    message: req.flash("notice"), 
    errors: null
  })
}
//Add classification

invCont.addClassification = async function (req, res) {
  let nav = await utilities.getNav();
  const { classification_name } = req.body;
  
  const regResult = await invModel.insertClassification(classification_name);

  if (regResult) {
    req.flash("notice", `Congratulations, you successfully added the classification: ${classification_name}.`);
    res.redirect("/inv"); // Redirect to the management page
  } else {
    req.flash("notice", "Sorry, the classification creation failed.");
    res.status(501).render("inventory/add-classification", {
      title: "Add Classification",
      nav,
      errors: null,
    });
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
    errors: null,
  });
};

// Add Inventory Handler
invCont.addInventory = async function (req, res) {  // <-- Fix: Assign to invCont
  let nav = await utilities.getNav();
  //let classificationList = await Util.buildClassificationList();
  const { classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color } = req.body;
  const regResult = await invModel.insertInventory (
    classification_id, 
    inv_make, 
    inv_model, 
    inv_description, 
    inv_image, 
    inv_thumbnail, 
    inv_price, 
    inv_year, 
    inv_miles, 
    inv_color
  );
  if (regResult) {
    req.flash("notice", `Congratulations, you successfully added the inventory: ${inv_make} ${inv_model} ${inv_year}`);
    res.redirect("/inv"); // Redirect to the management page
  } else {
    req.flash("notice", "Sorry, the classification creation failed.");
    res.status(501).render("inventory/add-inventory", {
      title: "Add Inventory",
      nav,
      errors: null,
    });
  }
};

/* ***************************
 *  Return Inventory by Classification As JSON
 * ************************** */
invCont.getInventoryJSON = async (req, res, next) => {
  const classification_id = parseInt(req.params.classification_id)
  const invData = await invModel.getInventoryByClassificationId(classification_id)
  if (invData[0].inv_id) {
    return res.json(invData)
  } else {
    next(new Error("No data returned"))
  }
}

/* ***************************
 *  Build edit inventory view
 * ************************** */
invCont.editInventoryView = async function (req, res, next) {
  const inv_id = parseInt(req.params.inv_id)
  let nav = await utilities.getNav()
  const itemData = await invModel.getVehicleById(inv_id)
  const classificationSelect = await utilities.buildClassificationList(itemData.classification_id)
  const itemName = `${itemData.inv_make} ${itemData.inv_model}`
  res.render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id: itemData.inv_id,
    inv_make: itemData.inv_make,
    inv_model: itemData.inv_model,
    inv_year: itemData.inv_year,
    inv_description: itemData.inv_description,
    inv_image: itemData.inv_image,
    inv_thumbnail: itemData.inv_thumbnail,
    inv_price: itemData.inv_price,
    inv_miles: itemData.inv_miles,
    inv_color: itemData.inv_color,
    classification_id: itemData.classification_id
  })
  
}

/* ***************************
 *  Update Inventory Data
 * ************************** */
invCont.updateInventory = async function (req, res, next) {
  let nav = await utilities.getNav()
  const {
    inv_id,
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id,
  } = req.body

  const updateResult = await invModel.updateInventory(
    inv_id,  
    inv_make,
    inv_model,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_year,
    inv_miles,
    inv_color,
    classification_id
  )

  if (updateResult) {
    const itemName = updateResult.inv_make + " " + updateResult.inv_model
    req.flash("notice", `The ${itemName} was successfully updated.`)
    res.redirect("/inv/")
  } else {
    const classificationSelect = await utilities.buildClassificationList(classification_id)
    const itemName = `${inv_make} ${inv_model}`
    req.flash("notice", "Sorry, the insert failed.")
    res.status(501).render("inventory/edit-inventory", {
    title: "Edit " + itemName,
    nav,
    classificationSelect: classificationSelect,
    errors: null,
    inv_id,
    inv_make,
    inv_model,
    inv_year,
    inv_description,
    inv_image,
    inv_thumbnail,
    inv_price,
    inv_miles,
    inv_color,
    classification_id
    })
  }
}

module.exports = invCont

