const { ApolloServer } = require("apollo-server-lambda");
const { ApolloGateway, RemoteGraphQLDataSource } = require("@apollo/gateway");
const { contextHandler } = require("../utils/context");
const pipe = require("lodash/flow");
const {
  enableMiddleware,
  assignUserIdMiddleware,
  serviceEncryptionMiddleware,
  encryptionMiddleware,
  decryptionMiddleware
} = require("../utils/middleware");

const gateway = new ApolloGateway({
  serviceList: [
    {
      name: "users",
      url: process.env.USER_SERVICE_URL
    },
    {
      name: "reviews",
      url: process.env.REVIEW_SERVICE_URL
    }
  ],
  buildService({ url }) {
    return new RemoteGraphQLDataSource({
      url,
      willSendRequest: enableMiddleware([
        assignUserIdMiddleware,
        serviceEncryptionMiddleware
      ])
    });
  }
});

let serverOptions = {
  tracing: true,
  gateway,
  subscriptions: false,
  context: contextHandler
};
// optional engine metrics
if (process.env.ENGINE_API_KEY)
  serverOptions.engine = {
    apiKey: process.env.ENGINE_API_KEY
  };
const server = new ApolloServer(serverOptions);

exports.handler = pipe([
  decryptionMiddleware,
  ([event, context, callback]) =>
    server.createHandler()(
      event,
      context,
      pipe([encryptionMiddleware, newArgs => callback(...newArgs)]) // wrapped call to enable encryption filter
    )
]);
