/**
 * Server.js - קובץ ראשי
 * סיגל מטר
 * 323941526
 * מיאר אסמיר
 * 324911296
 */

const express = require("express");
const path = require("path");
const session = require("express-session");
const fileUpload = require("express-fileupload");
const authRoutes = require("./routes/auth");
const profileRoutes = require("./routes/profile");
const { initializeDatabase } = require("./db/database");

// אתחול האפליקציה
const app = express();
const PORT = process.env.PORT || 3000;

// אתחול מסד הנתונים
initializeDatabase();

// הגדרת EJS
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));

app.use(express.urlencoded({ extended: true }));
app.use(express.json());
app.use(express.static(path.join(__dirname, "public")));
app.use(
  fileUpload({
    createParentPath: true,
    limits: { fileSize: 5 * 1024 * 1024 },
  })
);

// הגדרת sessions
app.use(
  session({
    secret: "sigal",
    resave: false,
    saveUninitialized: false,
    cookie: {
      maxAge: 3600000, // תוקף לשעה אחת
      httpOnly: true,
    },
  })
);

// להעברת פרטי המשתמש המחובר לכל הבקשות
app.use((req, res, next) => {
  res.locals.currentUser = req.session.user;
  next();
});

// routes - נתיבי האפליקציה
app.use("/", authRoutes);
app.use("/profile", profileRoutes);

// נתיב ברירת מחדל - הפניה לדף הכניסה
app.get("/", (req, res) => {
  if (req.session.user) {
    res.redirect("/profile");
  } else {
    res.redirect("/login");
  }
});

// הפעלת השרת
app.listen(PORT, () => {
  console.log(`Server is running on port ${PORT} | http://localhost:${PORT}`);
});
