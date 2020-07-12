const bdForUser = function(userId, dataBase) {
  let newObject = {};
  for (let url in dataBase) {
    if (dataBase[url].userID === userId) {
      newObject[url] = dataBase[url];
    }
  }
  return (newObject);
};
module.exports = { bdForUser };