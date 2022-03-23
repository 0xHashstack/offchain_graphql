const { ApolloServer } = require('apollo-server');
const { resolvers } = require('./src/resolvers/index');
const { typeDefs } = require('./src/typedefs/index');
require('dotenv').config()
// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against your data.

// The `listen` method launches a web server.


// const createApolloServer = async(options = { port: 4002 }) => {
//   let serverInfo;
//   const server = new ApolloServer({
//     typeDefs,
//     resolvers,
//   });

//    serverInfo = await server.listen(options);
//   if (process.env.NODE_ENV !== 'test') {
//     console.log(
//       `🚀 Query endpoint ready at http://localhost:${options.port}${server.graphqlPath}`,
//     );
//   }
// //   if (process.env.ENV == 'test') {
// //   serverInfo = await server.listen({port: 4005}).then(({ url }) => {
// //     console.log(`🚀  Server ready at ${url}`);
// //   });
// //  }
// // else{
// //   serverInfo = await server.listen({port: process.env.PORT || 4001}).then(({ url }) => {
// //     console.log(`🚀  Server ready at ${url}`);
// //   });
// // }

//   // serverInfo is an object containing the server instance and the url the server is listening on
//   return serverInfo;
// };

const createApolloServer = function (options = { port: 4009 }) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
  });

  const serverInfo =  server.listen(options);
  if (process.env.NODE_ENV !== 'test') {
    console.log(
      `🚀 Query endpoint ready at http://localhost:${options.port}${server.graphqlPath}`,
    );
  }

  // serverInfo is an object containing the server instance and the url the server is listening on
  return serverInfo;
};

module.exports= createApolloServer();
