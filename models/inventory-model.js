const pool = require("../database")

/* ***************************
 *  Get all classification data
 * ************************** */
async function getClassifications(){
  return await pool.query("SELECT * FROM public.classification ORDER BY classification_name")
}

/* ***************************
 *  Get all inventory items and classification_name by classification_id
 * ************************** */
async function getInventoryByClassificationId(classification_id) {
  try {
    const data = await pool.query(
      `SELECT * FROM public.inventory AS i 
      JOIN public.classification AS c 
      ON i.classification_id = c.classification_id 
      WHERE i.classification_id = $1`,
      [classification_id]
    )
    return data.rows
  } catch (error) {
    console.error("getclassificationsbyid error " + error)
  }
}

/* ***************************
 *  Get all inventory items by inv_id
 * ************************** */

async function getVehicleById(invId) {
  try {
    const sql = `SELECT * FROM public.inventory WHERE inv_id = $1`
    const data = await pool.query(sql, [invId])  // Use parameterized query to prevent SQL injection
    return data
  } catch (error) {
    console.error("Error in getVehicleById:", error)
  }
}

async function insertClassification(classification_name) {
    try {
      const sql = "INSERT INTO public.classification (classification_name) VALUES ($1) RETURNING *"
      return await pool.query(sql, [classification_name]);
  
    } catch (error) {
      console.error("Database error:", error);
      return error.message
    }
}


async function insertInventory( classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color ) {
    try {
      const sql = "INSERT INTO inventory (classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color) VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10) RETURNING *"
      return await pool.query(sql, [classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color]);
      
    } catch (error) {
      console.error("Database error:", error);
      return error.message
    }
}

module.exports = {getClassifications, getInventoryByClassificationId, getVehicleById, insertClassification, insertInventory};

