const { checkOwnUrl } = require('./checkOwnUrl.js');
const checkOwnShip = function(shortURL, userID, dataBase) {
//Check if URL exists. If it doesn't it should return the error
  //If exists then check URL ownership
  let result = [];
  let error = "";
  let longURL = '';
  if (dataBase[shortURL])  {
    longURL =  dataBase[shortURL].longURL;
    const ownURL = checkOwnUrl(shortURL, userID, dataBase);
    //Check if userID owns requested URL
    if (ownURL === false) {
      error = `You do not own the URL with the given ID: ${shortURL}`;
    }
  } else {
    error = `URL for the given ID: ${shortURL} does not exist`;
  }
  result.push(error);
  result.push(longURL);
  return result;
};
module.exports = { checkOwnShip };