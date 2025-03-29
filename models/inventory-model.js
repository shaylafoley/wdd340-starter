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
      const sql = "INSERT INTO classifications (classification_name) VALUES (?)";
      const data = pool.query(sql, [classification_name]);
      return data.affectedRows > 0;
    } catch (error) {
      console.error("Database error:", error);
      return false;
    }
}


async function insertInventory( classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color ) {
    try {
      const sql = "INSERT INTO inventory (classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)";
      const data = pool.query(sql, [classification_id, inv_make, inv_model, inv_description, inv_image, inv_thumbnail, inv_price, inv_year, inv_miles, inv_color]);
      return data.affectedRows > 0;
    } catch (error) {
      console.error("Database error:", error);
      return false;
    }
}

module.exports = {getClassifications, getInventoryByClassificationId, getVehicleById, insertClassification, insertInventory};

