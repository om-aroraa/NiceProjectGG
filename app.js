const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const fileUpload = require("express-fileupload");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const app = express();
const port = 3000;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "root",
  database: "slidin",
});

app.use(express.static(path.join(__dirname, "public")));
app.use(
  fileUpload({
    createParentPath: true,
  })
);
app.use(cookieParser());
app.use(
  session({
    secret: "saddjiasofjidjsfcagcrsdfngcawyefngdm",
    resave: false,
    saveUninitialized: true,
  })
);
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "indexesOfhtml"));

app.get("/", (req, res) => {
  res.render("signup.ejs", { message: "" });
});

app.get("/login", (req, res) => {
  let username = req.cookies.username;
  if (!username) return res.redirect("/");
  db.query(
    "SELECT imgpath FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) throw err;
      if (results.length === 0) return res.send("No user with that username");
      let imgpath = results[0].imgpath;
      if (!imgpath) imgpath = "/profilepics/default.png";
      res.render("profile", { path: imgpath, username: username });
    }
  );
});

app.post("/", (req, res) => {
  const { fullname, username, email, password, confirmpassword, gender } = req.body;
  let profile_pic
  try {
    profile_pic = req.files.profilePicture || false;
  } catch (e) {
    profile_pic = false;
  }
  let imgpath;
  if (!profile_pic) {
    imgpath = "/profilepics/default.png";
  } else {
    imgpath = "/profilepics/" + `${username}/` + profile_pic.name;
  }
  // check if passwords match
  if (password !== confirmpassword)
    return res.render("signup", { message: "Passwords do not match!" });
  // Check if username already exists
  db.query(
    "select * from users where username = ?",
    [username],
    (err, result) => {
      if (err) throw err;
      if (result.length > 0)
        return res.render("signup", { message: "Username already exists!" });
      // Check if email already exists
      db.query(
        "select * from users where email = ?",
        [email],
        (err, result) => {
          if (err) throw err;
          if (result.length > 0)
            return res.render("signup", { message: "Email already exists!" });
          // Insert user into database
          db.query(
            "insert into users (fullname, username, email, password, gender, imgpath) values (?,?,?,?,?,?)",
            [fullname, username, email, password, gender, imgpath],
            (err, result) => {
              if (err) throw err;
              if (profile_pic) {
                profile_pic.mv(
                  `${__dirname}/public/profilepics/${username}/${profile_pic.name}`,
                  function (err) {
                    if (err) return res.status(500).send(err);
                    res.cookie("user", username, { maxAge: 3600000 });
                    res.redirect("/profile");
                  }
                  );
                } else {
                res.cookie("user", username, { maxAge: 3600000 });
                res.redirect("/profile");
              }
            }
          );
        }
      );
    }
  );
});

app.get("/profile", (req, res) => {
  let username = req.cookies.user;
  if (!username) return res.redirect("/");
  db.query(
    "SELECT imgpath, fullname FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) throw err;
      if (results.length === 0) return res.send("No user with that username");
      let imgpath = results[0].imgpath;
      let fullname = results[0].fullname;
      if (!imgpath) imgpath = "/profilepics/default.png";
      res.render("profile", {
        path: imgpath,
        username: username,
        fullname: fullname,
      });
    }
  );
});

app.get("/home", (req, res) => {
  let username = req.cookies.user;
  if (!username) return res.redirect("/");
  db.query(
    "SELECT imgpath FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) throw err;
      if (results.length === 0) return res.send("No user with that username");
      let imgpath = results[0].imgpath;
      if (!imgpath) imgpath = "/profilepics/default.png";
      res.render("home", { path: imgpath, username: username });
    }
  );
});

app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
