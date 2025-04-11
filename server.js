/* ******************************************
 * This server.js file is the primary file of the 
 * application. It is used to control the project.
 *******************************************/
/* ***********************
 * Require Statements
 *************************/
const session = require("express-session")
const pool = require('./database/')
const express = require("express")
const expressLayouts = require("express-ejs-layouts")
const env = require("dotenv").config()
const app = express()
const static = require("./routes/static")
const path = require('path')
const baseController = require("./controllers/baseController")
const inventoryRoute = require("./routes/inventoryRoute")
const utilities = require("./utilities")
const accountRoute = require("./routes/accountRoute")
const reviewRoute = require("./routes/reviewRoute")
const bodyParser = require("body-parser")
//const flash = require("connect-flash")
const cookieParser = require("cookie-parser")
const serverErrorRouter = require("./routes/serverErrorRoute")
/* ***********************
 * Middleware
 * ************************/
app.use(session({
  store: new (require('connect-pg-simple')(session))({
    createTableIfMissing: true,
    pool,
  }),
  secret: process.env.SESSION_SECRET,
  resave: true,
  saveUninitialized: true,
  name: 'sessionId',
}))



//body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use(express.urlencoded({ extended: true })); // Parses form data


//cookie parser
app.use(cookieParser())

//JWt token check
app.use(utilities.checkJWTToken)

// Flash message middleware
app.use(require('connect-flash')())

//Express messages
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

//app.use(flash());

//Middleware to add client and loggedin to res.locals
app.use((req, res, next) => {
  res.locals.message = req.flash("info");
  res.locals.errors = req.flash("errors");
  next();
});


/* ***********************
 * View Engines and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root
//app.use(express.static(path.join(__dirname, 'public')));


/* ***********************
 * Routes
 *************************/
app.use(static)
//Index route
app.get("/", utilities.handleErrors(baseController.buildHome)) 
// Inventory routes
app.use("/inv", inventoryRoute)
app.use("/", inventoryRoute)
// Account routes
app.use("/account", accountRoute)
// Review Route
app.use("/reviews", reviewRoute)
// Error Route
app.use("/server-error", serverErrorRouter)
// File Not Found Route - must be last route in list
app.use(async (req, res, next) => {
  next({status: 404, message: 'Sorry, we appear to have lost that page.'})
})

/* ***********************
* Express Error Handler
* Place after all other middleware
*************************/
app.use(async (err, req, res, next) => {
  let nav = await utilities.getNav()
  console.error(`Error at: "${req.originalUrl}": ${err.message}`)
  if(err.status == 404){ message = err.message} else {message = 'Oh no! There was a crash. Maybe try a different route?'}
  res.render("errors/error", {
    title: err.status || 'Server Error',
    message,
    nav
  })
})

/* ***********************
 * Local Server Information
 * Values from .env (environment) file
 *************************/

app.use(async (err, req, res, next) => {
  const nav = await getNav();
  const title = `${err.message}` || 'Server Error';
  let message = '';
  let grid;
  const data = {
    title,
    statusCode: err.status,
  };
  console.error(`Error at: "${req.originalUrl}": ${err.message}`);
  if (err.status === 404) {
    data.message = `Sorry, it seems that page doesn't exists!`;
    data.imageUrl = '/images/site/404-empty.png';
    data.imageName = 'Image of an empty street';
  } else {
    data.message = `Oh no! There was a crash. Maybe try a different route?`;
    data.imageUrl = '/images/site/500-crash.png';
    data.imageName = 'Image of an crash';
  }
  grid = gridErrorTemplate(data);

  res.render('errors/error', {
    title,
    nav,
    grid,
    errors: null,
  })
});
 
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
