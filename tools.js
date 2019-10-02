/**
* Error handler wrapper for functions using Async/Await
*/
module.exports.wrap = fn => (...args) => fn(...args).catch(args[2]);;

/**
* Check if userId is a valid ObjectId
*/
module.exports.checkUserId = function checkId(userId) {
  if (!userId) throw new Error(`'userId' is required!`);

  if (!/^[0-9a-fA-F]{24}$/.test(userId))
    throw new Error(`'userId' [${userId}] is not a ObjectId!`);
};