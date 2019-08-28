const { ApolloServer, gql } = require("apollo-server-lambda");
const { buildFederatedSchema } = require("@apollo/federation");
const pipe = require("lodash/flow");
const {
  encryptionMiddleware,
  decryptionMiddleware
} = require("../utils/middleware");

const users = [
  { id: "123", username: "@ava" },
  { id: "456", username: "@dno" }
];

const getUser = id => users.find(currentUser => currentUser.id === id);

const typeDefs = gql`
  extend type Query {
    me: User
    getUsers: [User]
    getUser(username: String!): User
  }

  type User @key(fields: "id") {
    id: ID!
    username: String
  }
`;

const resolvers = {
  Query: {
    me(_, __, context) {
      if (!context || !context.user) throw new Error("test");
      return context.user;
    },
    getUsers() {
      return users;
    },
    getUser(_, args) {
      return users.find(currentUser => currentUser.username === args.username);
    }
  },
  User: {
    __resolveReference(user) {
      return users.find(currentUser => currentUser.id === user.id);
    }
  }
};

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }]),
  context: ({ event }) => {
    if (!event || !event.headers) return {};
    // get the user token from the headers
    const userId = event.headers["user-id"] || "";
    // try to retrieve a user with the token
    const user = getUser(userId);
    // add the user to the context
    return { user };
  }
});

exports.handler = pipe([
  decryptionMiddleware,
  ([event, context, callback]) =>
    server.createHandler()(
      event,
      context,
      pipe([encryptionMiddleware, newArgs => callback(...newArgs)]) // wrapped call to enable encryption filter
    )
]);
