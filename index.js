require('dotenv').config()
const { ApolloServer } = require('apollo-server-express');
const { applyMiddleware } = require("graphql-middleware");
const { resolvers } = require('./src/resolvers/index');
const { typeDefs } = require('./src/typedefs/index');
const { ApolloServerPluginDrainHttpServer } = require('apollo-server-core');
const { getPayload, getAccessToken, sendRefreshToken,  createRefreshToken } = require('./src/utils');
const { basicLogging } = require('./src/utils/basic_logging');
const cors = require("cors");
const express = require("express");
const http = require('http');
const cookieParser = require("cookie-parser")
const jwt = require('jsonwebtoken')
const db = require('./src/database/db')

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against your data.
startApolloServer()
async function startApolloServer() {

  const app = express();
  app.use(
    cors({
      origin: "http://localhost:4000",
      credentials: false
    })
  );
  app.use(cookieParser());
  
  app.get("/", (_req, res) => res.send("hello"));
  
  app.post("/refresh_token", async (req, res) => {
    const token = req.cookies.jid;
    if (!token) {
      return res.send({ ok: false, accessToken: "" });
    }
    let payload = null;
    try {
      payload = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      console.log(err);
      return res.send({ ok: false, accessToken: "" });
    }
    // token is valid and
    // we can send back an access token
    const user = await db.select('*').from('accounts').where({address: payload.address}).first()
    if (!user) {
      return res.send({ ok: false, accessToken: "" });
    }
    
    sendRefreshToken(res, createRefreshToken(user));
    return res.send({ ok: true, accessToken: getAccessToken(user) });
  });

  
  
  const httpServer = http.createServer(app);
  const server = new ApolloServer({ 
    typeDefs,
    resolvers, 
    plugins: [basicLogging, ApolloServerPluginDrainHttpServer({ httpServer })],
    context: ({ req, res }) => {
      // get the user token from the headers
      const token = req.headers.authorization || '';
      // try to retrieve a user with the token
      
      const { payload: user, loggedIn } = getPayload(token);
      // add the user to the context
      return { user, loggedIn, res };
    },
  });
  await server.start();
  server.applyMiddleware({ app, path: "/graphql", cors: false });

  await new Promise(resolve => httpServer.listen({ port: 4000 }, resolve));
  console.log(`🚀 Server ready at http://localhost:4000${server.graphqlPath}`);
}