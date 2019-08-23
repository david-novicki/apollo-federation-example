const { ApolloServer } = require("apollo-server-lambda");
const { ApolloGateway, RemoteGraphQLDataSource } = require("@apollo/gateway");
const { getUserId } = require("../utils/user");
const {
  enableMiddleware,
  assignUserIdMiddleware,
  encryptionMiddleware,
  decryptionMiddleware
} = require("../utils/middleware");

const gateway = new ApolloGateway({
  debug: true,
  serviceList: [
    {
      name: "users",
      url: process.env.USER_SERVICE_URL || "http://localhost:4001/graphql"
    },
    {
      name: "reviews",
      url: process.env.REVIEW_SERVICE_URL || "http://localhost:4002/graphql"
    }
  ],
  buildService({ url }) {
    return new RemoteGraphQLDataSource({
      url,
      willSendRequest: enableMiddleware([
        assignUserIdMiddleware,
        encryptionMiddleware
      ])
    });
  }
});

let serverOptions = {
  tracing: true,
  gateway,
  subscriptions: false,
  context: ({ req }) => {
    if (!req) return {};
    // get the user token from the headers
    const token = req.headers.authorization || "";
    // try to retrieve a user with the token
    const userId = getUserId(token);
    // add the user to the context
    return { userId };
  }
};
// optional engine metrics
if (process.env.ENGINE_API_KEY)
  serverOptions.engine = {
    apiKey: process.env.ENGINE_API_KEY
  };
const server = new ApolloServer(serverOptions);

exports.handler = enableMiddleware([
  decryptionMiddleware, // decrypt body before graph parsing
  server.createHandler() // standard lambda grapqh impl.
]);
