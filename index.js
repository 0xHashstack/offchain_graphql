const { ApolloServer } = require('apollo-server');
const { resolvers } = require('./src/resolvers/index');
const { typeDefs } = require('./src/typedefs/index');
const logger = require("./src/utils/logger")
const { getPayload } = require('./src/utils');
const { basicLogging } = require('./src/utils/basic_logging');

require('dotenv').config()
// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against your data.



const server = new ApolloServer({ 
  typeDefs,
  resolvers, 
  plugins: [basicLogging],
  context: ({ req }) => {
    // get the user token from the headers
    const token = req.headers.authorization || '';
    // try to retrieve a user with the token
    
    const { payload: user, loggedIn } = getPayload(token);
    // add the user to the context
    return { user, loggedIn };
  },
});

// The `listen` method launches a web server.
server.listen({port: process.env.PORT || 4000}).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
