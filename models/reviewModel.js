const pool = require("../database/")

// Add a review
async function addReview(review_text, review_rating, inv_id, account_id) {
  try {
    const sql = `
      INSERT INTO reviews (review_text, review_rating, inv_id, account_id)
      VALUES ($1, $2, $3, $4) RETURNING *;
    `
    const result = await pool.query(sql, [review_text, review_rating, inv_id, account_id])
    return result.rows[0]
  } catch (error) {
    throw new Error("Error adding review: " + error)
  }
}

// Get all reviews for a vehicle
async function getReviewsByInvId(inv_id) {
  try {
    const sql = `
      SELECT r.*, a.account_firstname, a.account_lastname
      FROM reviews r
      JOIN account a ON r.account_id = a.account_id
      WHERE r.inv_id = $1
      ORDER BY r.review_date DESC;
    `
    const result = await pool.query(sql, [inv_id])
    return result.rows
  } catch (error) {
    throw new Error("Error fetching reviews: " + error)
  }
}

module.exports = { addReview, getReviewsByInvId }
