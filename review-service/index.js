const { ApolloServer, gql } = require("apollo-server");
const { buildFederatedSchema } = require("@apollo/federation");

const reviews = [
  { id: "1", authorId: "123", rating: 3, comment: "This POC sucks!" },
  {
    id: "3",
    authorId: "456",
    rating: 5,
    comment: "What was this guy thinking doing this?!"
  }
];

const typeDefs = gql`
  extend type Query {
    reviews: [Review]
  }

  type Review @key(fields: "id") {
    id: ID!
    rating: Int
    author: User
    comment: String
  }

  extend type User @key(fields: "id") {
    id: ID! @external
    reviews: [Review]
  }
`;

const resolvers = {
  Query: {
    reviews() {
      return reviews;
    }
  },
  Review: {
    __resolveReference(review) {
      return reviews.filter(
        currentReview => currentReview.authorId === review.authorId
      );
    },
    author(review) {
      return { __typename: "User", id: review.authorId };
    }
  },
  User: {
    reviews(user) {
      return reviews.filter(review => review.authorId === user.id);
    }
  }
};

const server = new ApolloServer({
  schema: buildFederatedSchema([{ typeDefs, resolvers }])
});

server.listen(4002).then(({ url }) => {
  console.log(`🚀 Server ready at ${url}`);
});
