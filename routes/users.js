// Import required modules
const express = require('express');
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");

const db = require('../config/db'); 
const authenticateToken = require("../middlewares/authenticateToken");



// // Registration Route
router.post("/register", async (req, res) => {
  try {
      const { name, email, password, role_id } = req.body;

      // Check if user already exists
      db.query("SELECT * FROM users WHERE email = ?", [email], async (err, users) => {
          if (err) return res.status(500).json({ error: "Database error" });

          if (users.length > 0) {
              return res.status(409).json({ error: "User already exists" });
          }

          // Hash the password
          const hashedPassword = await bcrypt.hash(password, 10);

          // Insert user into users table
          const insertUserSQL = "INSERT INTO users (name, email, password, role_id) VALUES (?, ?, ?, ?)";
          db.query(insertUserSQL, [name, email, hashedPassword, role_id], (err, result) => {
              if (err) return res.status(500).json({ error: "Error inserting user", details: err.sqlMessage });

              const userId = result.insertId;

              // If user is an admin (role_id = 1), add entry in admins table
              if (role_id == 1) {
                  const insertAdminSQL = "INSERT INTO admins (user_id, first_name, last_name) VALUES (?, ?, ?)";
                  db.query(insertAdminSQL, [userId, name.split(" ")[0], name.split(" ")[1] || ""], (err) => {
                      if (err) {
                          return res.status(500).json({ error: "Error inserting admin",details: err.sqlMessage });
                      }
                      // Send response **only after admin is inserted successfully**
                      return res.status(201).json({ message: "Admin registered successfully" });
                  });
              } else {
                  // Send response if not an admin
                  return res.status(201).json({ message: "User registered successfully" });
              }
          });
      });
  } catch (error) {
      console.error("Registration Error:", error);
      res.status(500).json({ error: "Internal server error" });
  }
});




module.exports = router;