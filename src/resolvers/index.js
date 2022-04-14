const { GraphQLScalarType, Kind } = require('graphql');
const db = require('../database/db')
const uuid = require('uuid')
const logger = require("../utils/logger");
const ethers = require("ethers")
const { getAccessToken, sendRefreshToken, createRefreshToken } = require('./../utils/index')
const { AuthenticationError } = require('apollo-server');

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
        getAccountDetailsByAddress : async (parent, {address}, context) => {
          if(context.loggedIn){
            try {
              const data = await db.select('*').from('accounts').join('whitelist_status_lookup', 'whitelist_status_lookup.whitelist_status_id', '=', 'accounts.whitelist_status_id').where({address:address}).first()
              logger.log('info','SUCCESSFULLY EXECUTED QUERY(getAccountDetailsByAddress): %s',address)
              return data;  
            } catch (error) {
              logger.error('ERROR OCCURRED IN QUERY(getAccountDetailsByAddress): %s', new Error(error))
            }
          }
          else{
            throw new AuthenticationError("Please Login Again!")
          }
        },

        getAllAccounts: async (parent, args, context) => {
          if (context.loggedIn) {
            try {
              const data = await db.select('*').from('accounts').join('whitelist_status_lookup', 'whitelist_status_lookup.whitelist_status_id', '=', 'accounts.whitelist_status_id')
              logger.log('info','SUCCESSFULLY EXECUTED QUERY(getAllAccounts)')
              return data;
            } catch (error) {
              logger.error('ERROR OCCURRED IN QUERY(getAllAccounts): %s', new Error(error))
            }
            return
          } else {
              throw new AuthenticationError("Please Login Again!")
          }
        },

        getAllDepositByAccountId : async (parent, {account_id}, context) => {
          if(context.loggedIn){
            try {
              const data = await db.select('*').from('deposits').where({account_id:account_id})
              logger.log('info','SUCCESSFULLY EXECUTED QUERY(getAllDepositByAccountId), account_id : %s', account_id)
              return data;
            } catch (error) {
              logger.error('ERROR OCCURRED IN QUERY(getAllDepositByAccountId): %s', new Error(error))
            }
          }
          else{
            throw new AuthenticationError("Please Login Again!")
          }
        },

        getAllLoanByAccountId : async (parent, {account_id}, context) => {
          if(context.loggedIn){
            try {
              const data = await db.select('*').from('loans').where({account_id:account_id})
              logger.log('info','SUCCESSFULLY EXECUTED QUERY(getAllLoanByAccountId), account_id : %s', account_id)
              return data;
            } catch (error) {
              logger.error('ERROR OCCURRED IN QUERY(getAllLoanByAccountId): %s', new Error(error))
            }
          }
          else{
            throw new AuthenticationError("Please Login Again!")
          } 
        },
        hello: (_, { name }) => `Hello ${name}!`,
    },

    Mutation : {

        login: async (parent, {signature ,address}, context) => {
          let user = await db.select('*').from('accounts').where({address:address}).first()
          
          if (!user) {
            throw new Error("could not find user");
          }
          const signerAddr = await ethers.utils.verifyMessage("LOGIN_TO_HASHSTACK", signature);
          const valid = signerAddr===address ? true : false
      
          if(valid){
            sendRefreshToken(context.res, createRefreshToken(user));
            return {accessToken: getAccessToken(user), user};
          }
          else{
            throw new Error("Invalid Signature");
          }
        },

        addAccount : async (parent, args, context) => {
          try {
            const accountDetails = {
              id: uuid.v4(),
              address: args.address,
              whitelist_status_id: 2,
              user_role: "USER",
              created_at: new Date(),
              updated_at: new Date()
            }
            await db.from('accounts').insert(accountDetails)
            logger.log('info','addToDeposit with : %s', updatedDepositDetails)
            return accountDetails
          } catch (error) {
              logger.error('ERROR OCCURRED IN MUTATION(addAccount): %s', new Error(error))       
          }
        },

        addDeposit : async (parent, args, context) => {
          if(context.loggedIn){
            try {
              const accountId = args.account_id;
              const depositCommitment = args.commitment;
              const depositMarket = args.market;
              const depositAmount = args.amount;
              //find the deposit-id, if deposit already exist
              const existingDeposit = await db.select('*').from('deposits').where({account_id:accountId ,commitment:depositCommitment, market:depositMarket}).first();
            
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
                logger.log('info','updated existing deposit, New Amount: %s', updated_net_amount)
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
                logger.log('info','Created new Deposit: %s', deposit)
                await db.from('deposits').insert(deposit)
                return deposit;
              }
            } catch (error) {
              logger.error('ERROR OCCURRED IN MUTATION(addDeposit): %s', new Error(error))
            }
          }
          else{
            throw new AuthenticationError("Please Login Again!")
          }
        },

        addLoan : async (parent, args, context) => {    
          // TODO: P2 add authorization middleware, to avoid code-rep
          if(context.loggedIn){
            try {
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
              logger.log('info','Created new loan: %s', loanData)
              return loanData
            } catch (error) {
              logger.error('ERROR OCCURRED IN MUTATION(addLoan): %s', new Error(error))
            }
          } 
          else{
            throw new AuthenticationError("Please Login Again!")
          }
          
        },

        updateWhitelistStatus : async (parent, args, context) => { 
          if(context.loggedIn){
            try {
              await db.from('accounts').where({id:args.account_id})
              .update({
                whitelist_status_id: args.whitelist_status_id,
                updated_at: new Date()
              })
              logger.log('info','Updated whitelist status to whitelist_status_id: %s', args.whitelist_status_id)
              //returning the updated whitelist status  
              return await db.select('*').from('accounts').where({id:args.account_id}).first()
            } catch (error) {
              logger.error('ERROR OCCURRED IN MUTATION(updateWhitelistStatus): %s', new Error(error))
            }
          } 
          else{
            throw new AuthenticationError("Please Login Again!")
          }
        },

        requestWhitelist : async (parent, {account_id}, context) => { 
          if(context.loggedIn){
            try {
              await db.from('accounts').where({id:account_id})
              .update({
                whitelist_status_id: 10,
                updated_at: new Date()
              })
              logger.log('info','Whitelist request for account_id: %s', account_id)
              //returning the updated whitelist status  
              return await db.select('*').from('accounts').where({id:account_id}).first()
            } catch (error) {
              logger.error('ERROR OCCURRED IN MUTATION(requestWhitelist): %s', new Error(error))
            }
          } 
          else{
            throw new AuthenticationError("Please Login Again!")
          }
        }
    }
  };
  
