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

const encryptionMiddleware = requestContext => {
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

const decryptionMiddleware = event => {
  try {
    if (event && event.body) {
      const parsedBody = JSON.parse(event.body);
      const decryptedBody = decrypt(parsedBody);
      event.body = JSON.stringify(decryptedBody);
    }
  } catch (error) {
    console.log("something went wrong during encryption", error);
  }
};
module.exports = {
  enableMiddleware,
  assignUserIdMiddleware,
  encryptionMiddleware,
  decryptionMiddleware
};
