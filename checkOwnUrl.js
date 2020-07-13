const checkOwnUrl = function(shortURL, userID, urlDB) {
  if (userID === undefined) {
    return false;
  }
  if (urlDB[shortURL].userID === userID) {
    return true;
  } else {
    return false;
  }
};
module.exports = { checkOwnUrl };