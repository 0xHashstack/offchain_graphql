const { gql } = require('apollo-server');

exports.typeDefs = gql`
  # This "Account" type defines the queryable fields for every account in our data source.

  scalar Date

  type Account {
    address: String
    whitelist_status_id: Int
    user_role: String
    created_at: Date
    updated_at: Date
  }

  type AccountWithWhitelistStatus {
    address: String
    whitelist_status_id: Int
    whitelist_status_description: String 
    user_role: String
    created_at: Date
    updated_at: Date
    whitelist_requested_timestamp: Date
    waitlist_count: Int
  }

  type Deposit {
    id: ID
    account_address: String
    commitment: String
    market: String
    net_balance: Float
    net_saving_interest: Float
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
      loan_status_id: Int
      account_address: String
      created_at: Date
      updated_at: Date
  }

  type LoanWithLoanStatus {
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
      loan_status_id: Int
      loan_status_description: String
      loan_state: String
      account_address: ID
      created_at: Date
      updated_at: Date
  }

  type LoginResponse {
      accessToken: String!
      account_address: String!
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "accounts" query returns an array of zero or more Account (defined above).
  type Query {
    getAllAccounts: [AccountWithWhitelistStatus]
    getAccountDetailsByAddress(address: String!): AccountWithWhitelistStatus
    getAllDepositByAddress(account_address: String!): [Deposit]
    getAllLoanByAddress(account_address: String!): [Loan]
    getAllLoansByStatus(loan_status_description: String!): [LoanWithLoanStatus]
    hello(name: String): String!
  }

  type Mutation {
    login(signature: String!, address: String!): LoginResponse!
    
    addAccount(address: String!): Account!

    addDeposit(account_address: String!, commitment: String!, market: String!, amount: Float!): Deposit!

    addLoan(loan_market: String!, loan_amount: Float!, collateral_market: String!, collateral_amount: Float!, commitment: String!, cdr: Float!, debt_category: Int!, current_amount: Float!, current_market: String!, account_address: ID!): Loan!

    updateWhitelistStatus(account_address: String!, whitelist_status_id: Int!): Account!

    requestWhitelist(account_address: ID!): Account!
  }
`;
