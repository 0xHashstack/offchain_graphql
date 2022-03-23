const request = require('supertest');
// we will use supertest to test our server
const { typeDefs } = require('../typedefs/index');
const { resolvers } = require('../resolvers/index')

const { ApolloServer } = require('apollo-server')

require('dotenv').config()


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

  
// this is the query we use for our test
const queryHelloData = {
  query: `query sayHello($name: String) {
    hello(name: $name)
  }`,
  variables: { name: 'test' },
};

const querygetAccountDetailsByAddressData = {
query:`query getAccountDetailsByAddress(address: $address) {
      id
    }`,
    variables : { "address": "0x0000000000000000000000DUMMY_4" },
};
  

describe('e2e test', () => {
    let server, url;
  
    beforeAll(async () => {
        // Note we must wrap our object destructuring in parentheses because we already declared these variables
        // We pass in the port as 0 to let the server pick its own ephemeral port for testing
        ({ server, url } = await createApolloServer({ port: 0 }));
      });
  
    // after the tests we will stop our server
    afterAll(async () => {
      await server?.close();
    });
  
    it('says hello', async () => {
      // send our request to the url of the test server
      const response = await request(url).post('/').send(queryHelloData);
      console.log(response)
      expect(response.errors).toBeUndefined();
      expect(response.body.data?.hello).toBe('Hello test!');
    });


    it('getAccountDetailsByAddress', async () => {
        // send our request to the url of the test server
        const response = await request(url).post('/').send(querygetAccountDetailsByAddressData);
        console.log(response)
        expect(response.errors).toBeUndefined();
        expect(response.body.data?.hello).toBe( `{
            \"id\": \"a731640c-5b22-496b-86fc-85e630b2155a\"
          }`);
      });
  });
