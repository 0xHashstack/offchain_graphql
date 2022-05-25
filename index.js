require('dotenv').config();
var newrelic = require('newrelic');
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
const { listenToEvents } = require('./web3/events')
const { getLiquidadableLoan } = require('./web3/liquidableLoanMethod');
const { getWeb3 } = require("./web3/transaction");
const { diamondAddress } = require("./constants/constants");
const Liquidator = require('./blockchain/abis/Liquidator.json');

const PORT = process.env.PORT || 4000;
const CORS_OPTIONS = {
  origin: [ 
            'https://testnet.hashstack.finance',
            'https://stagingnet.hashstack.finance', 
            'https://testgql.hashstack.finance',
            `http://localhost:${PORT}`,
            'http://localhost:3000', 
            'http://localhost:3001'
          ],
  optionsSuccessStatus: 200,
  credentials: false
}

// A schema is a collection of type definitions (hence "typeDefs")
// that together define the "shape" of queries that are executed against your data.
startApolloServer()
async function startApolloServer() {

  const app = express();
  app.use(
    cors(CORS_OPTIONS)
  );
  app.use(cookieParser());
  
  app.get("/", (_req, res) => res.send("Welcome to Hashstack Finance"));
  
  //"liquidable_loan end-point returns all the loans that need to be liquidated"
  app.get("/liquidable_loan", async (req, res) => {
    const web3 = getWeb3();
    let liquidationContract = new web3.eth.Contract(
        Liquidator,
        diamondAddress
    )
    var responseData = await getLiquidadableLoan(liquidationContract)
    return res.send(responseData);
  });


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
    const user = await db.select('address').from('accounts').where({address: payload.address}).first()
    if (!user) {
      return res.send({ ok: false, accessToken: "" });
    }
    
    sendRefreshToken(res, createRefreshToken(user));
    return res.send({ ok: true, accessToken: getAccessToken(user) });
  });

  listenToEvents(app);
  
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

  await new Promise(resolve => httpServer.listen({ port: PORT }, resolve));
  console.log(`🚀 Server ready at http://localhost:${PORT}${server.graphqlPath}`);
}