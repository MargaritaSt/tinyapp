const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));


//to work with cookies
const cookieParser = require('cookie-parser');
app.use(cookieParser());
////

//Midleware for password hash
const bcrypt = require('bcrypt');
/////

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  i3Bopr: { longURL: "https://www.google.ca", userID: "user3" }
};

const users = {
  "user1": {
    id: "user1",
    email: "user1@example.com",
    password: "$2b$10$puHYqwmB4ALG3JoBqLTcT.BYLl0xTN.ORADmPPPaKlU5DDM11Pkke"
  },
  "user2": {
    id: "user2",
    email: "user2@example.com",
    password: "$2b$10$T.WYexw.H8975AYjSkGGLehQxuK7usz6QqovqWYn/RAXSCAZAuRVi"
  }
};

const  generateRandomString = function() {
  return Math.random().toString(36).substr(2,6);
};

//app.use((req, res, next) => {
 // req.currentUser = users[req.session[id]];
 // next();
//});
const findeUserByEmail = function(email) {
  
  for (let userId in users) {
    if (users[userId].email === email) {
      return users[userId];
    }
  }
  return false;
};

const authenticateUser = function(email, password) {
  const userId = findeUserByEmail(email);
  const passmatch  = bcrypt.compareSync(password, userId.password);
  if (userId && passmatch === true) {
    return userId;
  }
  return false;
};

const addNewUser = function(email, password) {
  let userId = generateRandomString();
  const hashedPassword = bcrypt.hashSync(password,10);
  const newUser = {
    id: userId,
    email,
    password: hashedPassword
  };
  users[userId] = newUser;
  console.log(hashedPassword);
  return userId;
  
};

const dbForId = function(userId) {
  let newObject = {};
  
  for (let url in urlDatabase) {
    if (urlDatabase[url].userID === userId) {
      newObject[url] = urlDatabase[url];
    }
  }
  console.log(newObject);
  return (newObject);
};

app.get('urls.json', (req, res) => {
  res.json(users);
});
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get("/urls", (req, res) => {
  const newDB = dbForId(req.cookies["user_id"]);
  let templateVars = {
    urls: newDB, //This is filtered by signed userID urlDatabase objectvto display the URLS for the specific user only
    userId: req.cookies["user_id"],
    users: users
  };
  res.render("urls_index", templateVars);
});

app.get("/urls/new" , (req, res) => {
  if (req.cookies["user_id"]) {
    let templateVars = {
      userId: req.cookies["user_id"],
      users: users
    };
    res.render("urls_new",templateVars);
  } else {
    res.redirect("/urls/login");
  }
});

app.get("/urls/register" , (req, res) => {
  let templateVars = {
    userId: req.cookies["user_id"],
    users: users
  };
  res.render("urls_register", templateVars);
});

app.get("/urls/login" , (req, res) => {
  let templateVars = {
    userId: req.cookies["user_id"],
    users: users
  };
  res.render("urls_login", templateVars);
});

app.post("/urls/:shortURL/update", (req, res) => {
  if (req.cookies["user_id"] !== undefined) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    //res.json(req.body);
    res.redirect("/urls");
  }
});
 
app.post("/urls/:shortURL/delete", (req, res) => {
  if (req.cookies["user_id"] !== undefined) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  }
});

app.post("/urls", (req, res) => {
  let newUrl = generateRandomString();
  urlDatabase[newUrl] = {longURL: req.body.longURL,
    userID: req.cookies["user_id"]};
  res.redirect(`/urls/${newUrl}`);
});

app.post("/login", (req, res) => {
  const {email, password} = req.body;
  const user = authenticateUser(email, password);
  if (user) {
    res.cookie('user_id', user['id']);
    res.redirect("/urls");
  } else {
    res.status(403).send("Error: Error Status 403");
  }
});

app.post("/logout", (req, res) => {
  res.clearCookie('user_id');
  res.redirect("/urls");
});

app.post("/register", (req, res) => {
  const {email, password} = req.body;
  const findeUser = findeUserByEmail(email);
  if (password === '' || (findeUser)) {
    res.status(404).send("Error: Error Status 404");
  } else {
    const userId = addNewUser(email, password);
    res.cookie('user_id', userId);
    res.redirect("/urls");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = {
    shortURL: req.params.shortURL,
    longURL: urlDatabase[req.params.shortURL].longURL,
    userId: req.cookies["user_id"],
    users: users
  };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});