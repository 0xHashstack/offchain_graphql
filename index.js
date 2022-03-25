const { ApolloServer } = require('apollo-server');
const { resolvers } = require('./src/resolvers/index');
const { typeDefs } = require('./src/typedefs/index');
const logger = require("./src/utils/logger")

require('dotenv').config()
// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against your data.

const BASIC_LOGGING = {
  requestDidStart(requestContext) {
      logger.log('http',"request started");
      logger.log('http',requestContext.request.query);
      //logger.log('info',requestContext.request.variables);
      return {
          didEncounterErrors(requestContext) {
              logger.error("an error happened in response to query " + requestContext.request.query);
              logger.error(requestContext.errors);
          }
      };
  },

  willSendResponse(requestContext) {
      logger.log('info',"response sent", requestContext.response);
  }
};

const server = new ApolloServer({ 
  typeDefs,
  resolvers, 
  plugins: [BASIC_LOGGING]
});

// The `listen` method launches a web server.
server.listen({port: process.env.PORT || 4000}).then(({ url }) => {
  console.log(`🚀  Server ready at ${url}`);
});
