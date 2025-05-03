/**
 * profile.js - נתיבים לפרופיל משתמש
 * סיגל מטר
 * 323941526
 * מיאר אסמיר
 * 324911296
 */

const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { getUserById } = require("../db/database");

// הצגת דף הפרופיל
router.get("/", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.redirect("/login");
  }
  const userId = req.session.user.id;

  // קבלת פרטי המשתמש המעודכנים ממסד הנתונים
  getUserById(userId, (err, user) => {
    if (err) {
      console.error("Error fetching user data:", err);
      return res.render("home", {
        error: "אירעה שגיאה בטעינת פרטי המשתמש",
        user: req.session.user, // השתמש בפרטים שכבר קיימים ב-session
      });
    }

    if (!user) {
      // אם המשתמש לא נמצא במסד הנתונים, נתק אותו
      req.session.destroy();
      return res.redirect("/login");
    }

    // הצגת דף הבית עם פרטי המשתמש
    res.render("home", { user, error: null });
  });
});

// הצגת תמונת פרופיל
router.get("/picture/:filename", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.status(403).send("Forbidden");
  }
  const filename = req.params.filename;
  const userId = req.session.user.id;

  // וידוא שהמשתמש מנסה לגשת לתמונה שלו בלבד
  getUserById(userId, (err, user) => {
    if (err || !user) {
      return res.status(403).send("Forbidden");
    }

    // בדיקה אם התמונה שייכת למשתמש
    if (user.profilePicture !== filename) {
      return res.status(403).send("Forbidden");
    }

    const imagePath = path.join(__dirname, "../uploads", filename);

    // בדיקה אם הקובץ קיים
    fs.access(imagePath, fs.constants.F_OK, (err) => {
      if (err) {
        console.error("Profile picture not found:", err);
        return res.status(404).send("Image not found");
      }

      // שליחת התמונה
      res.sendFile(imagePath);
    });
  });
});

module.exports = router;
