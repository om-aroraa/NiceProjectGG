const express = require("express");
const path = require("path");
const mysql = require("mysql2");
const fileUpload = require("express-fileupload");
const session = require("express-session");
const cookieParser = require("cookie-parser");
const http = require("http");
const socketIO = require("socket.io");
const app = express();
const server = http.createServer(app);
const io = socketIO(server);
const port = 3000;

const db = mysql.createConnection({
  host: "localhost",
  user: "root",
  password: "14351435",
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
  res.clearCookie("userimg");
  res.redirect("/login");
});

app.get("/login", (req, res) => {
  return res.render("login", { message: "" });
});

app.post("/login", (req, res) => {
  const { username, password } = req.body;
  db.query(
    "SELECT * FROM users WHERE username = ?",
    [username],
    (err, results) => {
      if (err) throw err;
      if (results.length === 0)
        return res.render("login", { message: "Username does not exist!" });
      if (results[0].password !== password)
        return res.render("login", { message: "Password is incorrect!" });
      res.cookie("user", username, { maxAge: 3600000 });
      res.cookie("userimg", results[0].imgpath, { maxAge: 3600000 });
      res.redirect("/profile");
    }
  );
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
                    res.cookie("userimg", imgpath, { maxAge: 3600000 });
                    res.redirect("/profile");
                  }
                );
              } else {
                res.cookie("user", username, { maxAge: 3600000 });
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
        userpath: decodeURIComponent(req.cookies.userimg),
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
  // URL Decode userimg cookie
  let imgpath = decodeURIComponent(req.cookies.userimg);
  if (!imgpath) imgpath = "/profilepics/default.png";
  if (value === "")
    return res.render("profile", {
      path: imgpath,
      username: username,
      results: false,
      value: false,
    });
  db.query(
    "SELECT username, imgpath FROM users WHERE username LIKE ?",
    [value + "%"],
    (err, results) => {
      if (err) throw err;
      console.log(results);
      res.render("profile", {
        path: imgpath,
        username: username,
        results: results,
        value: value,
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
      res.render("home", {
        userpath: decodeURIComponent(req.cookies.userimg),
        path: imgpath,
        username: username,
        results: false,
        value: false,
      });
    }
  );
});

app.post("/home", (req, res) => {
  let username = req.cookies.user;
  if (!username) return res.redirect("/");
  const { value } = req.body;
  let imgpath = decodeURIComponent(req.cookies.userimg);
  if (!imgpath) imgpath = "/profilepics/default.png";
  if (value === "")
    return res.render("home", {
      path: imgpath,
      username: username,
      results: false,
      value: false,
    });
  db.query(
    "SELECT username, imgpath FROM users WHERE username LIKE ?",
    [value + "%"],
    (err, results) => {
      if (err) throw err;
      res.render("home", {
        path: imgpath,
        username: username,
        results: results,
        value: value,
      });
    }
  );
});

app.get("/profile/:username", (req, res) => {
  let username = req.params.username;
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
      res.render("viewprofile", {
        userpath: decodeURIComponent(req.cookies.userimg),
        path: imgpath,
        username: username,
        fullname: fullname,
        results: false,
        value: false,
      });
    }
  );
});


app.get("/chat", (req, res) => {
  res.sendFile(path.join(__dirname, "indexesOfhtml", "chat.html"));
});

// render chat page
app.get("/chat", (req, res) => {
  res.render("chat");
});

// Initialize chat data
const chatData = [];

// Socket.IO connection
io.on("connection", (socket) => {
  // Load chat history from cookies
  const savedChats = socket.handshake.headers.cookie; // Access cookies from handshake
  if (savedChats) {
    const parsedCookies = require("cookie").parse(savedChats);
    const chatHistoryCookie = parsedCookies.savedChats;
    if (chatHistoryCookie) {
      const chatHistory = JSON.parse(chatHistoryCookie);
      socket.emit("loadHistory", chatHistory);
    }
  }

  // Receive and broadcast messages
  socket.on("chat message", (msg) => {
    let date = new Date();
    let ampm = date.getHours() >= 12 ? "PM" : "AM";
    let hours = time.getHours() < 10 ? "0" + time.getHours() : time.getHours();
    let formattedTime = `${hours}:${date.getMinutes()} ${ampm}`;
    chatData.push({
      proflie: "/profilepics/default.png",
      message: msg,
      time: formattedTime,
    });
    io.emit("chat message", msg);

    // Save chat history to cookies
    const updatedChatsCookie = JSON.stringify(chatData);
    socket.emit("updateHistoryCookie", updatedChatsCookie);
  });

  // Handle disconnection
  socket.on("disconnect", () => {
    console.log("User disconnected");
  });
});


server.listen(port, () => {
  console.log(`Server is running on http://localhost:${port}`);
});