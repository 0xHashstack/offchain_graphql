const { gql } = require('apollo-server');
exports.typeDefs = gql`
  # This "Account" type defines the queryable fields for every account in our data source.
  type Account {
    address: String
    timestamp: String
    whitelisted: Boolean
    whitelist_requested: Boolean 
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "accounts" query returns an array of zero or more Account (defined above).
  type Query {
    accounts: [Account]
    account(address: String!): Account
  }
`;