const invModel = require("../models/inventory-model")
const Util = {}

/* ************************
 * Constructs the nav HTML unordered list
 ************************** */
Util.getNav = async function (req, res, next) {
  
  let data = await invModel.getClassifications()
  let list = "<ul>"
  list += '<li><a href="/" title="Home page">Home</a></li>'
  data.rows.forEach((row) => {
    list += "<li>"
    list +=
      '<a href="/inv/type/' +
      row.classification_id +
      '" title="See our inventory of ' +
      row.classification_name +
      ' vehicles">' +
      row.classification_name +
      "</a>"
    list += "</li>"
  })
  list += "</ul>"
  return list
}

/* **************************************
* Build the classification view HTML
* ************************************ */
// 

Util.buildClassificationGrid = async function(data) {
  let grid
  if (data.length > 0) {
    grid = '<ul id="inv-display">'
    data.forEach(vehicle => { 
      grid += '<li>'
      grid += `<a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
                <img src="${vehicle.inv_thumbnail}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors">
              </a>`
      grid += '<div class="namePrice">'
      grid += '<hr />'
      grid += `<h2><a href="/inv/detail/${vehicle.inv_id}" title="View ${vehicle.inv_make} ${vehicle.inv_model} details">
                ${vehicle.inv_make} ${vehicle.inv_model}
              </a></h2>`
      grid += `<span>$${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</span>`
      grid += '</div>'
      grid += '</li>'
    })
    grid += '</ul>'
  } else { 
    grid = '<p class="notice">Sorry, no matching vehicles could be found.</p>'
  }
  return grid
}


Util.getDetail = async function (invId) {
  let data = await invModel.getVehicleById(invId) // Fetch vehicle data by ID

  if (!data || data.rowCount === 0) {
    return '<p class="notice">Sorry, vehicle not found.</p>'
  }

  return Util.buildVehicleDetail(data.rows[0]) // Pass the vehicle data to buildVehicleDetail
}

Util.buildVehicleDetail = function(vehicle) {
  return `
    <div class="vehicle-detail">
        <h2>${vehicle.inv_year} ${vehicle.inv_make} ${vehicle.inv_model}</h2>
        <img src="${vehicle.inv_image}" alt="Image of ${vehicle.inv_make} ${vehicle.inv_model} on CSE Motors">
        <p><strong>Price:</strong> $${new Intl.NumberFormat('en-US').format(vehicle.inv_price)}</p>
        <p><strong>Mileage:</strong> ${new Intl.NumberFormat('en-US').format(vehicle.inv_miles)} miles</p>
        <p><strong>Color:</strong> ${vehicle.inv_color}</p>
        <p><strong>Description:</strong> ${vehicle.inv_description}</p>
    </div>
  `
}


// Util.buildLogin = function (title, req) {
//   //const nav = await Util.getNav() // Get the navigation bar
  
//   return `
//     <header>
//       ${nav}
//     </header>
//     <main class="loginPage">
//       <h1>${title}</h1>

//       ${req.flash("notice") ? `<div class="flash-message">${req.flash("notice")}</div>` : ""}
      
//       <form action="/account/login" method="POST" class="login-form">
//         <label for="email">Email Address:</label>
//         <input type="email" id="email" name="email" required>

//         <label for="password">Password:</label>
//         <input type="password" id="password" name="password" required>

//         <button type="submit">Login</button>
//       </form>

//       <p>Don't have an account? <a href="/account/register">Register here</a></p>
//     </main>
//   `
// }

module.exports = Util


/* ****************************************
 * Middleware For Handling Errors
 * Wrap other function in this for 
 * General Error Handling
 **************************************** */
Util.handleErrors = fn => (req, res, next) => Promise.resolve(fn(req, res, next)).catch(next)


module.exports = Util
