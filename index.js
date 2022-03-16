const { ApolloServer } = require('apollo-server');
const { resolvers } = require('./src/resolvers/index');
const { typeDefs } = require('./src/typedefs/index');

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against your data.

const server = new ApolloServer({ typeDefs, resolvers });

// The `listen` method launches a web server.
server.listen().then(({ url }) => {
  console.log("reso", resolvers)
  console.log(`🚀  Server ready at ${url}`);
});
