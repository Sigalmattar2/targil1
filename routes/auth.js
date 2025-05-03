/**
 * auth.js - נתיבים לאימות משתמשים
 * סיגל מטר
 * 323941526
 * מיאר אסמיר
 * 324911296
 */

const express = require("express");
const router = express.Router();
const path = require("path");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");
const {
  checkUsernameExists,
  addUser,
  validateUser,
} = require("../db/database");

// GET /login
router.get("/login", (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect("/profile");
  }
  res.render("login", { error: null });
});

// POST /login
router.post("/login", (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect("/profile");
  }

  const { username, password } = req.body;

  if (!username || !password) {
    return res.render("login", {
      error: "יש להזין שם משתמש וסיסמה",
    });
  }

  validateUser(username, password, (err, user) => {
    if (err) {
      console.error("Error validating user:", err);
      return res.render("login", {
        error: "אירעה שגיאה במערכת, אנא נסה שוב מאוחר יותר",
      });
    }

    if (!user) {
      return res.render("login", {
        error: "שם משתמש או סיסמה אינם נכונים",
      });
    }

    req.session.user = user;
    res.redirect("/profile");
  });
});

// GET /register
router.get("/register", (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect("/profile");
  }
  res.render("register", { error: null });
});

// POST /register
router.post("/register", (req, res) => {
  if (req.session && req.session.user) {
    return res.redirect("/profile");
  }

  const { username, password, firstName, lastName, email, birthDate } =
    req.body;

  if (
    !username ||
    !password ||
    !firstName ||
    !lastName ||
    !email ||
    !birthDate
  ) {
    return res.render("register", {
      error: "יש למלא את כל השדות",
      formData: req.body,
    });
  }

  checkUsernameExists(username, (err, exists) => {
    if (err) {
      console.error("Error checking username:", err);
      return res.render("register", {
        error: "אירעה שגיאה במערכת, אנא נסה שוב מאוחר יותר",
        formData: req.body,
      });
    }

    if (exists) {
      return res.render("register", {
        error: "שם המשתמש כבר קיים במערכת",
        formData: req.body,
      });
    }

    let profilePictureName = null;

    if (req.files && req.files.profileImage) {
      const profilePicture = req.files.profileImage;

      if (!profilePicture.mimetype.startsWith("image/")) {
        return res.render("register", {
          error: "נא להעלות קובץ תמונה בלבד",
          formData: req.body,
        });
      }
      // נותן שם יחודי לתמונה בעזרת uuidv4
      profilePictureName = `${uuidv4()}${path.extname(profilePicture.name)}`;
      const uploadPath = path.join(__dirname, "../uploads", profilePictureName);

      profilePicture.mv(uploadPath, (err) => {
        if (err) {
          console.error("Error saving profile picture:", err);
          return res.render("register", {
            error: "אירעה שגיאה בשמירת התמונה",
            formData: req.body,
          });
        }

        const userData = {
          username,
          password,
          firstName,
          lastName,
          email,
          birthDate,
          profilePicture: profilePictureName,
        };

        addUser(userData, (err, user) => {
          if (err) {
            console.error("Error creating user:", err);
            return res.render("register", {
              error: "אירעה שגיאה ביצירת המשתמש",
              formData: req.body,
            });
          }

          res.render("login", {
            error: null,
            success: "ההרשמה הושלמה בהצלחה, אנא התחבר",
          });
        });
      });
    } else {
      const userData = {
        username,
        password,
        firstName,
        lastName,
        email,
        birthDate,
        profilePicture: null,
      };

      addUser(userData, (err, user) => {
        if (err) {
          console.error("Error creating user:", err);
          return res.render("register", {
            error: "אירעה שגיאה ביצירת המשתמש",
            formData: req.body,
          });
        }

        res.render("login", {
          error: null,
          success: "ההרשמה הושלמה בהצלחה, אנא התחבר",
        });
      });
    }
  });
});

// GET /logout
router.get("/logout", (req, res) => {
  if (!req.session || !req.session.user) {
    return res.redirect("/login");
  }
  req.session.destroy((err) => {
    if (err) {
      console.error("Error destroying session:", err);
    }
    res.redirect("/login");
  });
});

module.exports = router;
