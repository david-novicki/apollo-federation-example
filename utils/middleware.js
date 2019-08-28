const { encrypt, decrypt } = require("./encryption");

const enableMiddleware = function(fns) {
  var that = this;
  return function callEachFn() {
    fns.forEach(fn => fn.apply(that, arguments));
  };
};

const assignUserIdMiddleware = requestContext => {
  // pass the user's id from the context to underlying services
  // as a header called `user-id`
  if (!requestContext || !requestContext.context || !requestContext.request)
    return;
  if (requestContext.context.userId) {
    requestContext.request.http.headers.set(
      "user-id",
      requestContext.context.userId
    );
  }
};

const serviceEncryptionMiddleware = requestContext => {
  if (!requestContext || !requestContext.request) return;
  if (requestContext.request.query)
    requestContext.request.query = encrypt(requestContext.request.query);
  if (
    requestContext.request.variables &&
    Object.keys(requestContext.request.variables) > 0
  )
    requestContext.request.variables = encrypt(
      requestContext.request.variables
    );
};

const encryptionMiddleware = (error, event, ...rest) => {
  let newBody = {};
  try {
    const body = JSON.parse(event.body);
    const encryptedBody = encrypt(body);
    newBody = JSON.stringify(encryptedBody) + "\n";
  } catch (error) {
    console.log("failed to encrypt", error);
  }
  return [error, { ...event, body: newBody }, ...rest];
};

const decryptionMiddleware = (event, ...rest) => {
  let newBody = {};
  try {
    if (event && event.body) {
      const parsedBody = JSON.parse(event.body);
      const decryptedBody = decrypt(parsedBody);
      newBody = JSON.stringify(decryptedBody);
    }
  } catch (error) {
    console.log("something went wrong during encryption", error);
  }
  return [{ ...event, body: newBody }, ...rest];
};

module.exports = {
  enableMiddleware,
  assignUserIdMiddleware,
  serviceEncryptionMiddleware,
  encryptionMiddleware,
  decryptionMiddleware
};
