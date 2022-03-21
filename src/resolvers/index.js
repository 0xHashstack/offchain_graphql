const { GraphQLScalarType, Kind } = require('graphql');
const db = require('../database/db')
const uuid = require('uuid')

const resolverMap = {
  Date: new GraphQLScalarType({
    name: 'Date',
    description: 'Date custom scalar type',
    parseValue(value) {
      return new Date(value); // value from the client
    },
    serialize(value) {
      return value.getTime(); // value sent to the client
    },
    parseLiteral(ast) {
      if (ast.kind === Kind.INT) {
        return parseInt(ast.value, 10); // ast value is always in string format
      }
      return null;
    },
  }),
}

exports.resolvers = {
    Date: resolverMap,

    Query: {
        getAccountDetailsByAddress : (parent, {address}) => {
          return db.select('*').from('accounts').where({address:address}).first();
        },
        getAllAccounts: () => {
          return db.select('*').from('accounts');
        },
        getAllDepositByAccountId : (parent, {account_id}) => {
          return db.select('*').from('deposits').where({account_id:account_id});
        },
        getAllLoanByAccountId : (_, {account_id}) => {
          return db.select('*').from('loans').where({account_id:account_id});
        },
    },

    Mutation : {
        addAccount : async (parent, args) => {
          const id = uuid.v4()
          const whitelist_status_id = 2 
          console.log(args)
          const account = { id, whitelist_status_id, ...args }
          await db.from('accounts').insert(account)
          return account
        },
        addDeposit : async (parent, args) => {
          const accountId = args.account_id;
          const depositCommitment = args.commitment;
          const depositMarket = args.market;
          const depositAmount = args.amount;
          //find the deposit-id, if deposit already exist
          const existingDeposit = await db.select('*').from('deposits').where({account_id:accountId ,commitment:depositCommitment, market:depositMarket}).first();
          console.log(existingDeposit)
          //If deposit already exists
          if(existingDeposit){
            current_net_amount = existingDeposit.net_amount
            updated_net_amount = current_net_amount*1 + depositAmount*1

            // check if acquired yield needs to be updated
            // current_net_acquired_yield = db.select('net_amount').from('deposits').where({id:existingDepositId})
            // updated_net_acquired_yield = current_net_amount + args.amount
            console.log("UPDATING EXISTING DEPOSIT")
            await db.from('deposits').where({id:existingDeposit.id})
            .update({
              net_amount: updated_net_amount,
              updated_at: new Date()
            })
            return await db.select('*').from('deposits').where({id:existingDeposit.id}).first();
          }
          //else if deposit doesn't exists 
          else{
            const deposit = { 
              id: uuid.v4(),
              account_id: accountId,
              commitment: depositCommitment,
              market: depositMarket,
              net_amount: depositAmount,
              net_accrued_yield:0,
              created_at: new Date(),
              updated_at: new Date()
            }
            console.log("CREATING NEW DEPOSIT")
            await db.from('deposits').insert(deposit)
            return deposit;
          }
        },
        addLoan : async (parent, args) => {    
          
          const loanData = {
            id: uuid.v4(),
            loan_market: args.loan_amount,
            loan_amount: args.loan_amount,
            collateral_market: args.collateral_market,
            collateral_amount: args.collateral_amount,
            commitment: args.commitment,
            cdr: args.cdr,
            debt_category: args.debt_category,
            current_amount: args.current_amount,
            current_market: args.current_market,
            is_swapped: false,
            loan_status_id: 2,
            account_id: args.account_id,
            created_at: new Date(),
            updated_at: new Date()
          }

          await db.from('loans').insert(loanData)

          return loanData
        },
        updateWhitelistStatus : async (parent, args) => {    
          await db.from('accounts').where({id:args.account_id})
            .update({
              whitelist_status_id: args.whitelist_status_id,
              updated_at: new Date()
            })

          //returning the updated whitelist status  
          return await db.select('*').from('accounts').where({id:args.account_id}).first()
        }
    }
  };
  
