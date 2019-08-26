const { getUserId } = require("../utils/user");
const contextHandler = ({ event }) => {
  if (!event || !event.headers) return {};
  // get the user token from the headers
  const token = event.headers.authorization || "";
  // try to retrieve a user with the token
  const userId = getUserId(token);
  // add the user to the context
  return { userId };
};
module.exports = { contextHandler };
