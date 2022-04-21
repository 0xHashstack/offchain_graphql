require('dotenv').config()
const request = require('supertest');
// we will use supertest to test our server
const { typeDefs } = require('../typedefs/index');
const { resolvers } = require('../resolvers/index')
const { ApolloServer } = require('apollo-server')
const { getPayload, getAccessToken } = require('./../../src/utils');

// TEST USER
const testAccount = {
  address: "0x317A69fA54E8e7113326E897DF6204ef2129a3A7",
  account_id: "f554c8f6-06e6-4386-88b9-59047adb6365",
  signature: "0xda8bce5014816646060e9c83ce81554a30d2bbde62f358e7cd0b3e06a39c3aef5e88b6f58f7977796bfa6e7f02125d0c8444506769969d725be6db398558d48b1c",
  jwtAccessToken: getAccessToken({
    id: 'f554c8f6-06e6-4386-88b9-59047adb6365',
    address: '0x317A69fA54E8e7113326E897DF6204ef2129a3A7'
  })
}

const createApolloServer = function (options = { port: 4009 }) {
  const server = new ApolloServer({
    typeDefs,
    resolvers,
    plugins: [],
    context: ({ req, res }) => {
      // get the user token from the headers
      const token = req.headers.authorization || testAccount.jwtAccessToken;
      // try to retrieve a user with the token

      const { payload: user, loggedIn } = getPayload(token);
      // add the user to the context
      return { user, loggedIn, res };
    },
  });

  const serverInfo = server.listen(options);
  if (process.env.NODE_ENV !== 'test') {
    console.log(
      `🚀 Query endpoint ready at http://localhost:${options.port}${server.graphqlPath}`,
    );
  }
  // serverInfo is an object containing the server instance and the url the server is listening on
  return serverInfo;
};

// SAMPLE TEST
const helloDataQuery = {
  query: `query sayHello($name: String) {
    hello(name: $name)
  }`,
  variables: { name: 'test' },
};

const getAccountDetailsByAddressQuery = {
  query: `query GetAccountDetailsByAddress($address: String!) {
    getAccountDetailsByAddress(address: $address) {
      id
      whitelist_status_id
      address
      user_role
    }
  }`,
  variables: { "address": testAccount.address },
};

const getAllAccountsQuery = {
  query: `query{
    getAllAccounts {
      id
      address
      whitelist_status_id
      whitelist_status_description
      user_role
    }
  }`,
  variables: {},
};

const getAllDepositByAccountIdQuery = {
  query: `query GetAllDepositByAccountId($accountId: ID!) {
    getAllDepositByAccountId(account_id: $accountId) {
      id
      account_id
      commitment
      market
      net_balance
      net_saving_interest
    }
  }`,
  variables: { "accountId": testAccount.account_id },
};

const getAllLoanByAccountIdQuery = {
  query: `query GetAllLoanByAccountId($accountId: ID!) {
    getAllLoanByAccountId(account_id: $accountId) {
      id
      loan_market
      loan_amount
      collateral_market
      collateral_amount
      commitment
      cdr
      debt_category
      current_amount
      current_market
      is_swapped
      loan_status_id
      account_id
    }
  }`,
  variables: { "accountId": testAccount.account_id },
};

const getAllLoansByStatusQuery = {
  query: `query GetAllLoansByStatus($loanStatusDescription: String!) {
    getAllLoansByStatus(loan_status_description: $loanStatusDescription) {
      id
      loan_market
      loan_amount
      collateral_market
      collateral_amount
      commitment
      cdr
      debt_category
      current_amount
      current_market
      is_swapped
      loan_status_id
      loan_status_description
      loan_state
      account_id
    }
  }`,
  variables: {"loanStatusDescription": "LOAN_CREATED"},
};


const loginMutation = {
  query: `mutation Login($signature: String!, $address: String!) {
    login(signature: $signature, address: $address) {
      account_id
    }
  }`,
  variables: {  
    "signature": testAccount.signature,
    "address": testAccount.address,
  }
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

    //SAMPLE TEST
    it('says hello', async () => {
      // send our request to the url of the test server
      const response = await request(url).post('/').send(helloDataQuery);
      expect(response.errors).toBeUndefined();
      expect(response.body.data?.hello).toBe('Hello test!');
    });

    it('GetAccountDetailsByAddress Test', async () => {
      const response = await request(url).post('/').send(getAccountDetailsByAddressQuery);
      expect(response.errors).toBeUndefined();
      expect(response.body).toEqual({
        "data": {
          "getAccountDetailsByAddress": {
            "id": "f554c8f6-06e6-4386-88b9-59047adb6365",
            "address": "0x317A69fA54E8e7113326E897DF6204ef2129a3A7",
            "whitelist_status_id": 2,
            "user_role": "DUMMY_USER"
          }
        }
      });
    });

    it('getAllAccounts Test', async () => {
        const response = await request(url).post('/').send(getAllAccountsQuery);
        expect(response.errors).toBeUndefined();
        expect(response.body).toEqual({
          "data": {
            "getAllAccounts": [
              {
                "id": "a731640c-5b22-496b-86fc-85e630b2155a",
                "address": "0x0000000000000000000000DUMMY_3",
                "whitelist_status_id": 2,
                "whitelist_status_description": "WHITELIST_NOT_REQUESTED",
                "user_role": "DUMMY_USER"
              },
              {
                "id": "f1f791d2-3f61-49cd-8013-6b94c42d3ddf",
                "address": "0x0000000000000000000000DUMMY_2",
                "whitelist_status_id": 2,
                "whitelist_status_description": "WHITELIST_NOT_REQUESTED",
                "user_role": "DUMMY_USER"
              },
              {
                "id": "f554c8f6-06e6-4386-88b9-59047adb6365",
                "address": "0x317A69fA54E8e7113326E897DF6204ef2129a3A7",
                "whitelist_status_id": 2,
                "whitelist_status_description": "WHITELIST_NOT_REQUESTED",
                "user_role": "DUMMY_USER"
              },
              {
                "id": "a8331bd8-fa9d-49ae-aa1e-da6734514643",
                "address": "0x0000000000000000000000DUMMY_1",
                "whitelist_status_id": 10,
                "whitelist_status_description": "WHITELIST_REQUESTED",
                "user_role": "DUMMY_USER"
              }
            ]
          }
        });
    });

// Test for getAllDepositByAccountId
it('getAllDepositByAccountId Test', async () => {
  const response = await request(url).post('/').send(getAllDepositByAccountIdQuery);
  expect(response.errors).toBeUndefined();
  expect(response.body).toEqual({
    "data": {
      "getAllDepositByAccountId": [
        {
          "id": "5543ad1d-ddee-4328-b9ff-f1ce4ea9a6b3",
          "account_id": "f554c8f6-06e6-4386-88b9-59047adb6365",
          "commitment": "0x636f6d69745f4e4f4e4500000000000000000000000000000000000000000000",
          "market": "0x555344542e740000000000000000000000000000000000000000000000000000",
          "net_balance": 100,
          "net_saving_interest": 0.54
        },
        {
          "id": "6ec212aa-e1dc-4c55-9a05-9f17c2e06e95",
          "account_id": "f554c8f6-06e6-4386-88b9-59047adb6365",
          "commitment": "0x636f6d69745f54574f5745454b53000000000000000000000000000000000000",
          "market": "0x555344542e740000000000000000000000000000000000000000000000000000",
          "net_balance": 200,
          "net_saving_interest": 0.54
        }
      ]
    }
  });
});

//Test for getAllLoanByAccountIdQuery
it('getAllLoanByAccountIdQuery Test', async () => {
  const response = await request(url).post('/').send(getAllLoanByAccountIdQuery);
  expect(response.errors).toBeUndefined();
  expect(response.body).toEqual({
    "data": {
      "getAllLoanByAccountId": [
        {
          "id": "16c2ec38-aa8e-4793-bbbb-0d0879cd3eaa",
          "loan_market": "0x555344542e740000000000000000000000000000000000000000000000000000",
          "loan_amount": 300000000000000000000,
          "collateral_market": "0x555344542e740000000000000000000000000000000000000000000000000000",
          "collateral_amount": 200000000000000000000,
          "commitment": "0x636f6d69745f4e4f4e4500000000000000000000000000000000000000000000",
          "cdr": 0.66666,
          "debt_category": 2,
          "current_amount": 300000000000000000000,
          "current_market": "0x555344542e740000000000000000000000000000000000000000000000000000",
          "is_swapped": false,
          "loan_status_id": 2,
          "account_id": "f554c8f6-06e6-4386-88b9-59047adb6365"
        }
      ]
    }
  });
});

//Test for getAllLoansByStatusQuery
it('getAllLoansByStatusQuery Test', async () => {
  const response = await request(url).post('/').send(getAllLoansByStatusQuery);
  expect(response.errors).toBeUndefined();
  expect(response.body).toEqual({
    "data": {
      "getAllLoansByStatus": [
        {
          "id": "16c2ec38-aa8e-4793-bbbb-0d0879cd3eaa",
          "loan_market": "0x555344542e740000000000000000000000000000000000000000000000000000",
          "loan_amount": 300000000000000000000,
          "collateral_market": "0x555344542e740000000000000000000000000000000000000000000000000000",
          "collateral_amount": 200000000000000000000,
          "commitment": "0x636f6d69745f4e4f4e4500000000000000000000000000000000000000000000",
          "cdr": 0.66666,
          "debt_category": 2,
          "current_amount": 300000000000000000000,
          "current_market": "0x555344542e740000000000000000000000000000000000000000000000000000",
          "is_swapped": false,
          "loan_status_id": 2,
          "loan_status_description": "LOAN_CREATED",
          "loan_state": "ACTIVE",
          "account_id": "f554c8f6-06e6-4386-88b9-59047adb6365"
        }
      ]
    }
  });
});

//login mutation test
it('loginMutation Test', async () => {
  const response = await request(url).post('/').send(loginMutation);
  expect(response.errors).toBeUndefined();
  expect(response.body).toEqual({
    "data": {
      "login": {
        "account_id": "f554c8f6-06e6-4386-88b9-59047adb6365"
      }
    }
  });
});

});