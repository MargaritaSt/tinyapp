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

const addNewUser = function(email, password, dataBase) {
  let userId = Math.random().toString(36).substr(2,6);
  const hashedPassword = bcrypt.hashSync(password,10);
  const newUser = {
    id: userId,
    email,
    password: hashedPassword
  };
  dataBase[userId] = newUser;
  return userId;
};

module.exports = { addNewUser };