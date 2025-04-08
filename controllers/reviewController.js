const reviewModel = require("../models/reviewModel")
const utilities = require("../utilities")

// Handle POST request to add review
async function addReview(req, res) {
  const { review_text, review_rating, inv_id } = req.body
  const account_id = req.session.client.account_id
  const nav = await utilities.getNav()

  try {
    await reviewModel.addReview(review_text, review_rating, inv_id, account_id)
    req.flash("notice", "Review submitted!")
    res.redirect(`/inv/detail/${inv_id}`)
  } catch (error) {
    req.flash("notice", "Sorry, failed to submit review.")
    res.redirect(`/inv/detail/${inv_id}`)
  }
}

module.exports = { addReview }
