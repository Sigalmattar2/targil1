/**
 * database.js - ניהול מסד הנתונים
 * סיגל מטר
 * 323941526
 * מיאר אסמיר
 * 324911296
 */

const sqlite3 = require("sqlite3");
const path = require("path");
const bcrypt = require("bcrypt");

// יצירת חיבור למסד הנתונים
const dbPath = path.join(__dirname, "profiles.db");
const db = new sqlite3.Database(dbPath, (err) => {
  if (err) {
    console.error("Error connecting to database:", err.message);
  } else {
    console.log("Connected to the database");
  }
});

/**
 * פונקציה ליצירת טבלת המשתמשים במסד הנתונים אם היא לא קיימת
 */
function initializeDatabase() {
  db.run(
    `CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    username TEXT UNIQUE NOT NULL,
    password TEXT NOT NULL,
    firstName TEXT NOT NULL,
    lastName TEXT NOT NULL,
    email TEXT NOT NULL,
    birthDate TEXT NOT NULL,
    profilePicture TEXT
  )`,
    (err) => {
      if (err) {
        console.error("Error creating users table:", err.message);
      } else {
        console.log("profiles database is ready");
      }
    }
  );
}

/**
 * פונקציה להוספת משתמש חדש למסד הנתונים
 */
function addUser(userData, callback) {
  // הצפנת הסיסמה לפני שמירה במסד הנתונים
  bcrypt.hash(userData.password, 10, (err, hashedPassword) => {
    if (err) {
      return callback(err);
    }

    const query = `INSERT INTO users 
      (username, password, firstName, lastName, email, birthDate, profilePicture) 
      VALUES (?, ?, ?, ?, ?, ?, ?)`;

    db.run(
      query,
      [
        userData.username,
        hashedPassword,
        userData.firstName,
        userData.lastName,
        userData.email,
        userData.birthDate,
        userData.profilePicture,
      ],
      function (err) {
        if (err) {
          return callback(err);
        }
        callback(null, { id: this.lastID, ...userData });
      }
    );
  });
}

/**
 * פונקציה לבדיקה אם שם משתמש כבר קיים במערכת
 */
function checkUsernameExists(username, callback) {
  db.get(
    "SELECT username FROM users WHERE username = ?",
    [username],
    (err, row) => {
      if (err) {
        return callback(err);
      }
      callback(null, !!row);
    }
  );
}

/**
 * פונקציה לאימות משתמש לפי שם משתמש וסיסמה
 */
function validateUser(username, password, callback) {
  db.get("SELECT * FROM users WHERE username = ?", [username], (err, user) => {
    if (err) {
      return callback(err);
    }

    if (!user) {
      return callback(null, false);
    }

    // השוואת הסיסמה המוצפנת
    bcrypt.compare(password, user.password, (err, isMatch) => {
      if (err) {
        return callback(err);
      }

      if (isMatch) {
        // אין צורך להחזיר את הסיסמה המוצפנת
        const { password, ...userWithoutPassword } = user;
        callback(null, userWithoutPassword);
      } else {
        callback(null, false);
      }
    });
  });
}

/**
 * פונקציה לקבלת פרטי משתמש לפי מזהה
 */
function getUserById(userId, callback) {
  db.get(
    "SELECT id, username, firstName, lastName, email, birthDate, profilePicture FROM users WHERE id = ?",
    [userId],
    (err, user) => {
      if (err) {
        return callback(err);
      }
      callback(null, user);
    }
  );
}

module.exports = {
  initializeDatabase,
  addUser,
  checkUsernameExists,
  validateUser,
  getUserById,
};
