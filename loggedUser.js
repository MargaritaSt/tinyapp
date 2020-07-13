const loggedUser = function(userID, shortURL, dataBase) {
  let templateVars;
  if (userID === undefined) {
    templateVars = {
      userId: userID,
      users: dataBase,
      shortURL: shortURL,
      error: `The user is not logged in`
    };
  }
  return templateVars;
};

module.exports = { loggedUser };