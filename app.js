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

app.get("/logout", (req, res) => {
  res.clearCookie("user");
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  return res.render("login", { message: "" });
});

app.post('/login', (req, res) => {
  const { username, password } = req.body;
  db.query('SELECT * FROM users WHERE username = ?', [username], (err, results) => {
    if (err) throw err;
    if (results.length === 0) return res.render('login', { message: 'Username does not exist!' });
    if (results[0].password !== password) return res.render('login', { message: 'Password is incorrect!' });
    res.cookie('user', username, { maxAge: 3600000 });
    res.redirect('/profile');
  });
});

app.post("/", (req, res) => {
  const { fullname, username, email, password, confirmpassword, gender } =
    req.body;
  let profile_pic;
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
  if (!username) return res.redirect("/login");
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
        results: false,
        value: false,
      });
    }
    );
  });
  
app.post("/profile", (req, res) => {
  let username = req.cookies.user;
  if (!username) return res.redirect("/");
  const { value } = req.body;
  let imgpath
  if (!imgpath) imgpath = "/profilepics/default.png";
  if (value === "") return res.render("profile", {path:imgpath, username:username, results: false, value: false });
  db.query(
    "SELECT username FROM users WHERE username LIKE ?",
    [value + "%"],
    (err, results) => {
      if (err) throw err;
      res.render("profile", { path:imgpath, username:username, results: results, value: value });
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
      res.render("home", { path: imgpath, username: username, results: false, value: false });
    }
  );
});

app.post("/home", (req, res) => {
  let username = req.cookies.user;
  if (!username) return res.redirect("/");
  const { value } = req.body;
  if (value === "") return res.render("home", { results: false, value: false });
  db.query(
    "SELECT username FROM users WHERE username LIKE ?",
    [value + "%"],
    (err, results) => {
      if (err) throw err;
      res.render("home", { results: results, value: value });
    }
  );
});


app.listen(port, () => {
  console.log(`Server running on port ${port}`);
});
