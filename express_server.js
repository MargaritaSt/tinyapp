const express = require("express");
const { getUserByEmail } = require('./helpers.js');
const { authenticateUser } = require('./authenticateUser.js');
const { addNewUser } = require('./addNewUser.js');
const { checkOwnShip } = require('./checkOwnShip.js');
const { loggedUser } = require('./loggedUser.js');
const { bdForUser } = require('./bdForUser.js');
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");

const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));

//to work with encrypted cookies
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));

const urlDatabase = {
  b6UTxQ: { longURL: "https://www.tsn.ca", userID: "aJ48lW" },
  i3BoGr: { longURL: "https://www.google.ca", userID: "aJ48lW" },
  i3Bopr: { longURL: "https://www.google.ca", userID: "user1" }
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

app.get('urls.json', (req, res) => {
  res.json(users);
});
app.get("/", (req, res) => {
  res.send("Hello!");
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

//Open page with the list of URLs
app.get("/urls", (req, res) => {
  const newDB = bdForUser(req.session["user_id"],urlDatabase);
  let templateVars = {
    urls: newDB, //This is filtered by signed userID urlDatabase objectvto display the URLS for the specific user only
    userId: req.session["user_id"],
    users: users
  };
  res.render("urls_index", templateVars);
});

//Returns the page where you can create a new URL
app.get("/urls/new" , (req, res) => {
  if (req.session["user_id"]) {
    let templateVars = {
      userId: req.session["user_id"],
      users: users
    };
    res.render("urls_new",templateVars);
  } else {
    res.redirect("/urls/login");
  }
});

app.get("/urls/register" , (req, res) => {
  let templateVars = {
    userId: req.session["user_id"],
    users: users
  };
  res.render("urls_register", templateVars);
});

app.get("/urls/login" , (req, res) => {
  let templateVars = {
    userId: req.session["user_id"],
    users: users
  };
  res.render("urls_login", templateVars);
});

//Editing existing URLs
app.post("/urls/:shortURL/update", (req, res) => {
  const userID = req.session["user_id"];
  const shortURL = req.params.shortURL;
  if (req.session["user_id"] !== undefined) {
    urlDatabase[req.params.shortURL].longURL = req.body.longURL;
    res.redirect("/urls");
  } else {
    const templateVars = loggedUser(userID, shortURL, users);
    res.render("urls_show", templateVars);
  }
});

//Deleting existing URLs
app.post("/urls/:shortURL/delete", (req, res) => {
  const userID = req.session["user_id"];
  const shortURL = req.params.shortURL;
  if (req.session["user_id"] !== undefined) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    const templateVars = loggedUser(userID, shortURL, users);
    res.render("urls_show", templateVars);
  }
});

//Adding new URLs
app.post("/urls", (req, res) => {
  const userID = req.session["user_id"];
  const shortURL = req.params.shortURL;
  if (req.session["user_id"]) {
    let newUrl = Math.random().toString(36).substr(2,6);
    urlDatabase[newUrl] = {longURL: req.body.longURL,userID: req.session["user_id"]};
    res.redirect(`/urls/${newUrl}`);
  } else {
    const templateVars = loggedUser(userID, shortURL, users);
    res.render("urls_show", templateVars);
  }
});

//Login with authentication
app.post("/login", (req, res) => {
  const {email, password} = req.body;
  const user = authenticateUser(email, password,users);
  if (user) {
    req.session["user_id"] = user['id'];
    res.redirect("/urls");
  } else {
    res.status(403).send("Error: Error Status 403");
  }
});

app.post("/logout", (req, res) => {
  req.session = null;
  res.redirect("/urls/login");
});

//Adding new user
app.post("/register", (req, res) => {
  const {email, password} = req.body;
  const findeUser = getUserByEmail(email, users);
  if (password === '' || (findeUser)) {
    res.status(404).send("Error: Error Status 404");
  } else {
    const userId = addNewUser(email, password, users);
    req.session["user_id"] = userId;
    res.redirect("/urls");
  }
});

//Redirecting a user to longURL by cliking on shortUrl
app.get("/u/:shortURL", (req, res) => {
  let longURL;
  const userID = req.session["user_id"];
  const shortURL = req.params.shortURL;
  if (urlDatabase[req.params.shortURL]) {
    longURL = urlDatabase[req.params.shortURL].longURL;
    res.redirect(longURL);
  } else {
    let templateVars = {
      userId: userID,
      users: users,
      shortURL: shortURL,
      error: `URL for the given ID:${req.params.shortURL} does not exist`
    };
    res.render("urls_show", templateVars);
  }
});

//Returns web page with the specific shortURL details
//And with the form to edit the URL
app.get("/urls/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const userID = req.session["user_id"];
  const checkOwn =  checkOwnShip(shortURL, userID, urlDatabase);
  let templateVars = {
    shortURL: shortURL,
    longURL: checkOwn[1],
    userId: userID,
    users: users,
    error: checkOwn[0]
  };
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});