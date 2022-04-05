const { gql } = require('apollo-server');



exports.typeDefs = gql`
  # This "Account" type defines the queryable fields for every account in our data source.

  scalar Date

  type Account {
    id: ID
    address: String
    whitelist_status_id: Int 
    created_at: Date
    user_role: String
    updated_at: Date
  }

  type Deposit {
    id: ID
    account_id: ID
    commitment: String
    market: String
    net_amount: Float
    net_accrued_yield: Float
    created_at: Date
    updated_at: Date
  }

  type Loan {
      id: ID
      loan_market: String
      loan_amount: Float
      collateral_market: String
      collateral_amount: Float
      commitment: String
      cdr: Float
      debt_category: Int
      current_amount: Float
      current_market: String
      is_swapped: Boolean
      loan_status_id: String
      account_id: ID
      created_at: Date
      updated_at: Date
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "accounts" query returns an array of zero or more Account (defined above).
  type Query {
    getAllAccounts: [Account]
    getAccountDetailsByAddress(address: String!): Account
    getAllDepositByAccountId(account_id: ID!): [Deposit]
    getAllLoanByAccountId(account_id: ID!): [Loan]
  }

  type Mutation {
    addAccount(address: String!): Account!

    addDeposit(account_id: ID!, commitment: String!, market: String!, amount: Float!): Deposit!

    addLoan(loan_market: String!, loan_amount: Float!, collateral_market: String!, collateral_amount: Float!, commitment: String!, cdr: Float!, debt_category: Int!, current_amount: Float!, current_market: String!, account_id: ID!): Loan!

    updateWhitelistStatus(account_id: ID!, whitelist_status_id: Int!): Account!
  }
`;

/*
---------------------------WHITELIST STATUS--------------------------- 
2 - "WHITELIST_NOT_REQUESTED"
10 - "WHITELIST_REQUESTED"
18 - "WHITELISTED"

---------------------------LOAN STATUS --------------------------------
2- ""
10-""
18-""
*/