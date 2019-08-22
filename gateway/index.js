const { ApolloServer } = require("apollo-server-lambda");
const { ApolloGateway, RemoteGraphQLDataSource } = require("@apollo/gateway");

const getUserId = token => token;

const options = {
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
    // more services
  ],
  buildService({ _, url }) {
    return new RemoteGraphQLDataSource({
      url,
      willSendRequest({ request, context }) {
        // pass the user's id from the context to underlying services
        // as a header called `user-id`
        if (context && context.userId)
          request.http.headers.set("user-id", context.userId);
      }
    });
  }
};
const gateway = new ApolloGateway(options);

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
if (process.env.ENGINE_API_KEY)
  serverOptions.engine = {
    apiKey: process.env.ENGINE_API_KEY
  };
const server = new ApolloServer(serverOptions);

exports.handler = server.createHandler();
