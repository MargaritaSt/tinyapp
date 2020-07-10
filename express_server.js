const express = require("express");
const cookieParser = require('cookie-parser');
const app = express();
const PORT = 8080; // default port 8080
app.set("view engine", "ejs");
const bodyParser = require("body-parser");
app.use(bodyParser.urlencoded({extended: true}));
app.use(cookieParser());

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

const users = {
  "user1": {
    id: "user1",
    email: "user1@example.com",
    password: "123"
  },
  "user2": {
    id: "user2",
    email: "user2@example.com",
    password: "321"
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
  if (userId && password === userId.password) {
    return userId;
  }
  return false;
};

const addNewUser = function(email, password) {
  let userId = generateRandomString();
  const newUser = {
    id: userId,
    email,
    password
  };
  users[userId] = newUser;
  return userId;
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
  let templateVars = { urls: urlDatabase,
                     userId: req.cookies["user_id"],
                      users: users};
  res.render("urls_index", templateVars);
});

app.get("/urls/new" , (req, res) => {
  let templateVars = { userId: req.cookies["user_id"],
                        users: users};
  res.render("urls_new",templateVars);
});

app.get("/urls/register" , (req, res) => {
  let templateVars = { userId: req.cookies["user_id"],
                        users: users};
  res.render("urls_register", templateVars);
});

app.get("/urls/login" , (req, res) => {
  let templateVars = { userId: req.cookies["user_id"],
                        users: users};
  res.render("urls_login", templateVars);
});

app.post("/urls/:shortURL/update", (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  //res.json(req.body);
  res.redirect("/urls");
});
 
app.post("/urls/:shortURL/delete", (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

app.post("/urls", (req, res) => {
  let newUrl = generateRandomString();
  urlDatabase[newUrl] = req.body.longURL;
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
    console.log(users);
    res.redirect("/urls");
  }
});

app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  res.redirect(longURL);
});

app.get("/urls/:shortURL", (req, res) => {
  let templateVars = { shortURL: req.params.shortURL,
                        longURL: urlDatabase[req.params.shortURL],
                         userId: req.cookies["user_id"],
                          users: users};
                    //   username: req.cookies['username']
  res.render("urls_show", templateVars);
});

app.get("/hello", (req, res) => {
  res.send("<html><body>Hello <b>World</b></body></html>\n");
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});