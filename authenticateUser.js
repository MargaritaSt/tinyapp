const { getUserByEmail } = require('./helpers.js');
const express = require("express");
const app = express();
//to work with encrypted cookies
const cookieSession = require('cookie-session');
app.use(cookieSession({
  name: 'session',
  keys: ['key1', 'key2']
}));
//Midleware for password hash
const bcrypt = require('bcrypt');

const authenticateUser = function(email, password, dataBase) {
  const userId = getUserByEmail(email, dataBase);
  let passmatch;
  if (password !== "" && userId !== false) {
    passmatch  = bcrypt.compareSync(password, userId.password);
  }
  if (userId && passmatch === true) {
    return userId;
  }
  return false;
};

module.exports = { authenticateUser };