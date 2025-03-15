const express = require("express");
const router = express.Router();
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const db = require("../config/db"); 
const authenticateToken = require("../middlewares/authenticateToken"); 

// Login Route
router.post("/login", (req, res) => {
  const { email, password } = req.body;

  const sql = "SELECT * FROM users WHERE email = ?";
  db.query(sql, [email], async (err, results) => {
      if (err) {
          console.error("Database error:", err);
          return res.status(500).json({ error: "Database error" });
      }
      
      if (results.length === 0) {
          return res.status(404).json({ error: "User not found" });
      }

      const user = results[0];

      // Compare passwords
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
          return res.status(401).json({ error: "Invalid credentials" });
      }

      // Check if user is an admin
      const adminCheck = "SELECT * FROM admins WHERE user_id = ?";
      db.query(adminCheck, [user.id], (adminErr, adminResults) => {
          if (adminErr) {
              console.error("Database error:", adminErr);
              return res.status(500).json({ error: "Database error" });
          }

          if (adminResults.length === 0) {
              return res.status(403).json({ error: "Access denied. User is not an admin." });
          }

          // Generate JWT token
        //   const token = jwt.sign(
        //       { user_id: user.id, email: user.email, role: user.role_id },
        //       process.env.JWT_SECRET,
        //       { expiresIn: "1h" }
        //   );

        //   res.status(200).json({ message: "Login successful", token });
          res.status(200).json({ message: "Login successful" });
      });
  });
});


// Protected Route
router.get("/protected", authenticateToken, (req, res) => {
  res.send(`Hello, ${req.user.email}. This is a protected route!`);
});

module.exports = router;
