const { gql } = require('apollo-server');

exports.typeDefs = gql`
  # This "Account" type defines the queryable fields for every account in our data source.

  scalar Date

  type Account {
    id: ID
    address: String
    whitelist_status_id: Int
    user_role: String
    created_at: Date
    updated_at: Date
  }

  type AccountWithWhitelistStatus {
    id: ID
    address: String
    whitelist_status_id: Int
    whitelist_status_description: String 
    user_role: String
    created_at: Date
    updated_at: Date
    whitelist_requested_timestamp: Date
  }

  type Deposit {
    id: ID
    account_id: ID
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
      account_id: ID
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
      account_id: ID
      created_at: Date
      updated_at: Date
  }

  type LoginResponse {
      accessToken: String!
      account_id: ID!
  }

  # The "Query" type is special: it lists all of the available queries that
  # clients can execute, along with the return type for each. In this
  # case, the "accounts" query returns an array of zero or more Account (defined above).
  type Query {
    getAllAccounts: [AccountWithWhitelistStatus]
    getAccountDetailsByAddress(address: String!): Account
    getAllDepositByAccountId(account_id: ID!): [Deposit]
    getAllLoanByAccountId(account_id: ID!): [Loan]
    getAllLoansReadyForLiquidationByLiquidator: [LoanWithLoanStatus]
    hello(name: String): String!
  }

  type Mutation {
    login(signature: String!, address: String!): LoginResponse!
    
    addAccount(address: String!): Account!

    addDeposit(account_id: ID!, commitment: String!, market: String!, amount: Float!): Deposit!

    addLoan(loan_market: String!, loan_amount: Float!, collateral_market: String!, collateral_amount: Float!, commitment: String!, cdr: Float!, debt_category: Int!, current_amount: Float!, current_market: String!, account_id: ID!): Loan!

    updateWhitelistStatus(account_id: ID!, whitelist_status_id: Int!): Account!

    requestWhitelist(account_id: ID!): Account!
  }
`;

/*
---------------------------WHITELIST STATUS--------------------------- 
2 - "WHITELIST_NOT_REQUESTED"
10 - "WHITELIST_REQUESTED"
18 - "WHITELISTED"

---------------------------LOAN STATUS --------------------------------
2. LOAN_CREATED
10. READY_FOR_LIQUIDATION_BY_LIQUIDATOR
18. PROTOCOL_TRIGGERED_LIQUIDATION_ENQUEUED
26. LIQUIDATED_BY_PROTOCOL
34. LIQUIDATED_BY_LIQUIDATOR
42. REPAID_BY_USER

---------------------------LIQUIDATION STATUS --------------------------------
2- ""
10-""
18-""
26=""
34=""

*/