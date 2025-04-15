const { Pool } = require("pg")
require("dotenv").config()

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: {
    rejectUnauthorized: false,
  },
})

module.exports = {
  async query(text, params) {
    try {
      const res = await pool.query(text, params)
      console.log("executed query", { text })
      return res
    } catch (error) {
      console.error("error in query", { text })
      throw error
    }
  },
  pool, // include this if you're using `pool` elsewhere (e.g., in `connect-pg-simple`)
}


// const { Pool } = require("pg")
// require("dotenv").config()

// /* ***************
//  * Connection Pool
//  * SSL Object needed for Render (production)
//  * and optionally in development
//  * *************** */
// const isDev = process.env.NODE_ENV === "development"

// const pool = new Pool({
//   connectionString: process.env.DATABASE_URL,
//   ssl: isDev
//     ? false // for local dev, no SSL needed
//     : { rejectUnauthorized: false } // required by Render
// })

// // Export BOTH the pool and query function for use elsewhere
// module.exports = {
//   pool,
//   async query(text, params) {
//     try {
//       const res = await pool.query(text, params)
//       console.log("executed query", { text })
//       return res
//     } catch (error) {
//       console.error("error in query", { text })
//       throw error
//     }
//   }
// }


// const { Pool } = require("pg")
// require("dotenv").config()
// /* ***************
//  * Connection Pool
//  * SSL Object needed for local testing of app
//  * But will cause problems in production environment
//  * If - else will make determination which to use
//  * *************** */
// let pool
// if (process.env.NODE_ENV == "development") {
//   pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
//     ssl: {
//       rejectUnauthorized: false,
//     },
// })

// // Added for troubleshooting queries
// // during development
// module.exports = {
//   async query(text, params) {
//     try {
//       const res = await pool.query(text, params)
//       console.log("executed query", { text })
//       return res
//     } catch (error) {
//       console.error("error in query", { text })
//       throw error
//     }
//   },
// }
// } else {
//   pool = new Pool({
//     connectionString: process.env.DATABASE_URL,
//   })
//   module.exports = pool
// }