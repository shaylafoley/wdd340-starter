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
const bodyParser = require("body-parser")
const flash = require("connect-flash")
const cookieParser = require("cookie-parser")
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

//cookie parser
app.use(cookieParser())

//body parser
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({ extended: true })) // for parsing application/x-www-form-urlencoded

app.use(express.urlencoded({ extended: true })); // Parses form data
app.use(express.json()); // Parses JSON data

//JWt token check
app.use(utilities.checkJWTToken)

// Flash message middleware
app.use(require('connect-flash')())

//Express messages
app.use(function(req, res, next){
  res.locals.messages = require('express-messages')(req, res)
  next()
})

app.use(flash());

//Middleware to add client and loggedin to res.locals
app.use((req, res, next) => {
  res.locals.message = req.flash("info");
  res.locals.errors = req.flash("errors");
  next();
});

app.use((req, res, next) => {
  res.locals.client = req.session.client || null
  res.locals.loggedin = req.session.client ? true : false
  next()
})


/* ***********************
 * View Engines and Templates
 *************************/
app.set("view engine", "ejs")
app.use(expressLayouts)
app.set("layout", "./layouts/layout") // not at views root
app.use(express.static(path.join(__dirname, 'public')));


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
const port = process.env.PORT
const host = process.env.HOST

/* ***********************
 * Log statement to confirm server operation
 *************************/
app.listen(port, () => {
  console.log(`app listening on ${host}:${port}`)
})
