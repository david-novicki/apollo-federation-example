const { ApolloServer, gql } = require("apollo-server-lambda");
const { buildFederatedSchema } = require("@apollo/federation");

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
  context: ({ req }) => {
    if (!req) return {};
    // get the user token from the headers
    const userId = req.headers["user-id"] || "";
    // try to retrieve a user with the token
    const user = getUser(userId);
    // add the user to the context
    return { user };
  }
});

exports.handler = server.createHandler();
