const utilities = require("../utilities")
const accountModel = require("../models/account-model")
const bcrypt = require("bcryptjs")
const jwt = require("jsonwebtoken")
require("dotenv").config()

/* ****************************************
*  Deliver login view
* *************************************** */
async function buildLogin(req, res, next) {
    let nav = await utilities.getNav()
    res.render("account/login", {
      
      title: "Login",
      nav,
      message: req.flash("notice"),
      errors: null,
    })
  }


/* ****************************************
*  Deliver registration view
* *************************************** */
async function buildRegister(req, res) {
  const nav = await utilities.getNav()
  res.render("account/register", {
    title: "Register",
    nav,
    message: req.flash("notice"),
    errors: null
  })
}

/* ****************************************
*  Process Registration
* *************************************** */

async function registerAccount(req, res) {
  let nav = await utilities.getNav()
  const { account_firstname, account_lastname, account_email, account_password } = req.body;
// Hash the password before storing
  let hashedPassword
  try {
  // regular password and cost (salt is generated automatically)
    hashedPassword = await bcrypt.hashSync(account_password, 10)
  } catch (error) {
    req.flash("notice", 'Sorry, there was an error processing the registration.')
    res.status(500).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    })
  }
  const regResult = await accountModel.registerAccount(
    account_firstname,
    account_lastname,
    account_email,
    hashedPassword
  )

  if (regResult) {
    req.flash("notice", `Congratulations, you have registered ${account_firstname}. Please log in.`);
    res.redirect("/account");
    
  } else {
    req.flash("notice", "Sorry, the registration failed.");
    res.status(501).render("account/register", {
      title: "Registration",
      nav,
      errors: null,
    });
  }
};

/* ****************************************
 *  Process login request
 * ************************************ */
async function accountLogin(req, res) {
  let nav = await utilities.getNav()
  const { account_email, account_password } = req.body
  const accountData = await accountModel.getAccountByEmail(account_email)
  if (!accountData) {
    req.flash("notice", "Please check your credentials and try again.")
    res.status(400).render("account/login", {
      title: "Login",
      nav,
      errors: null,
      account_email,
    })
  }
  try {
    const match = await bcrypt.compare(account_password, accountData.account_password);
    if (match) {
      delete accountData.account_password;


      const accessToken = jwt.sign(accountData, process.env.ACCESS_TOKEN_SECRET, { expiresIn: 3600 * 1000 })
      if(process.env.NODE_ENV === 'development') {
        res.cookie("jwt", accessToken, { httpOnly: true, maxAge: 3600 * 1000 })
        //return res.redirect("/account/")
      } else {
        res.cookie("jwt", accessToken, { httpOnly: true, secure: true, maxAge: 3600 * 1000 })
      }
      req.session.loggedin = true;
      req.session.username = accountData.account_firstname;
      req.session.client = accountData
      return res.redirect("/account/")
    }
    else {
      req.flash("message notice", "Please check your credentials and try again.")
      res.status(400).render("account/login", {
        title: "Login",
        nav,
        errors: null,
        account_email,
      })
    }
  } catch (error) {
    throw new Error('Access Forbidden')
  }
}

async function renderAccountView(req, res) {
  let nav = await utilities.getNav();
  res.render("account/management", {
    title: "Account Manager",
    nav,
    message: req.flash("notice"),
    loggedin: req.session.loggedin || false,
    username: req.session.username || ""
  });
};

//logout
async function logoutAccount(req, res) {
  req.session.destroy((err) => {
    if (err) {
      console.error("Logout error:", err);
      return res.redirect("/account/");
    }
    res.clearCookie("jwt");
    res.redirect("/"); // Redirect to home page or login page
  });
}

module.exports = { buildLogin, buildRegister, registerAccount, accountLogin, renderAccountView, logoutAccount }
