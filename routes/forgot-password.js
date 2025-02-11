const express = require("express");
const router = express.Router();
const db = require("../config/db");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
require("dotenv").config();


const crypto = require("crypto");


//  Forgot Password Route
router.post("/forgot-password", (req, res) => {
    const { email } = req.body;

    const sql = "SELECT * FROM users WHERE email = ?";
    db.query(sql, [email], (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (results.length === 0) {
            return res.status(404).json({ error: "User not found" });
        }

        const user = results[0];
        const resetToken = crypto.randomBytes(32).toString("hex");

        // Store the new token (overwriting old one) in `password_reset_tokens`
        const upsertTokenSql = `
            INSERT INTO password_reset_tokens (email, token, created_at)
            VALUES (?, ?, NOW())
            ON DUPLICATE KEY UPDATE token = VALUES(token), created_at = NOW()
        `;
        
        db.query(upsertTokenSql, [email, resetToken], (tokenErr) => {
            if (tokenErr) return res.status(500).json({ error: "Database error" });

            // Log request in `password_resets`
            const logResetSql = "INSERT INTO password_resets (email, token, created_at) VALUES (?, ?, NOW())";
            db.query(logResetSql, [email, resetToken], (logErr) => {
                if (logErr) console.error("Logging error:", logErr);
            });

            // Send reset link via email
            const transporter = nodemailer.createTransport({
                service: "gmail",
                auth: { user: process.env.EMAIL_USER, pass: process.env.EMAIL_PASS }
            });

            const mailOptions = {
                from: process.env.EMAIL_USER,
                to: user.email,
                subject: "Password Reset Request",
                html: `<p>Click below to reset your password:</p>
                       <a href="http://localhost:5000/api/admin/reset-password/${resetToken}">Reset Password</a>`
            };

            transporter.sendMail(mailOptions, (mailErr) => {
                if (mailErr) return res.status(500).json({ error: "Failed to send reset email" });
                res.status(200).json({ message: "Password reset link sent to email" });
            });
        });
    });
});


router.post("/reset-password/:token", async (req, res) => {
    const { token } = req.params;
    const { newPassword } = req.body;

    // Validate the token from `password_reset_tokens`
    const sql = "SELECT * FROM password_reset_tokens WHERE token = ?";
    db.query(sql, [token], async (err, results) => {
        if (err) return res.status(500).json({ error: "Database error" });

        if (results.length === 0) {
            return res.status(400).json({ error: "Invalid or expired token" });
        }

        const userEmail = results[0].email;
        const hashedPassword = await bcrypt.hash(newPassword, 10);

        // Update the password
        const updateSql = "UPDATE users SET password = ?, updated_at = NOW() WHERE email = ?";
        db.query(updateSql, [hashedPassword, userEmail], (updateErr) => {
            if (updateErr) return res.status(500).json({ error: "Database error" });

            // Delete the token after use
            db.query("DELETE FROM password_reset_tokens WHERE email = ?", [userEmail], (delErr) => {
                if (delErr) console.error("Error deleting reset token:", delErr);
            });

            res.status(200).json({ message: "Password reset successful" });
        });
    });
});


module.exports = router;
