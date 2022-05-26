const { GraphQLScalarType, Kind } = require('graphql');
const db = require('../database/db')
const uuid = require('uuid')
const logger = require("../utils/logger");
const ethers = require("ethers")
const { getAccessToken, sendRefreshToken, createRefreshToken } = require('./../utils/index')
const { AuthenticationError } = require('apollo-server');

exports.resolvers = {

    Query: {
        getAccountDetailsByAddress : async (parent, {address}, context) => {
          if(true || context.loggedIn){
            try {
              const data = await db.select('*').from('accounts').join('whitelist_status_lookup', 'whitelist_status_lookup.whitelist_status_id', '=', 'accounts.whitelist_status_id').where({address:address}).first()
              const waitlist_count_object = await db.count('address').from('accounts').where('whitelist_requested_timestamp','<=', data.whitelist_requested_timestamp).first()
              const accountDetails = {
                address: data.address,
                whitelist_status_id: data.whitelist_status_id,
                whitelist_status_description: data.whitelist_status_description, 
                user_role: data.user_role,
                created_at: data.created_at,
                updated_at: data.updated_at,
                whitelist_requested_timestamp: data.whitelist_requested_timestamp,
                waitlist_count: waitlist_count_object.count - 1
              }
              logger.log('info','SUCCESSFULLY EXECUTED QUERY(getAccountDetailsByAddress): %s',address)
              return accountDetails;  
            } catch (error) {
              logger.error('ERROR OCCURRED IN QUERY(getAccountDetailsByAddress): %s', new Error(error))
            }
          }
          else{
            throw new AuthenticationError("Please Login Again!")
          }
        },

        getAllAccounts: async (parent, args, context) => {
          if (true || context.loggedIn) {
            try {
              const data = await db.select('*').from('accounts').join('whitelist_status_lookup', 'whitelist_status_lookup.whitelist_status_id', '=', 'accounts.whitelist_status_id')
              logger.log('info','SUCCESSFULLY EXECUTED QUERY(getAllAccounts)')
              return data;
            } catch (error) {
              logger.error('ERROR OCCURRED IN QUERY(getAllAccounts): %s', new Error(error))
            }
          } else {
              throw new AuthenticationError("Please Login Again!")
          }
        },

        getAllDepositByAddress : async (parent, {account_address}, context) => {
          if(true || context.loggedIn){
            try {
              const data = await db.select('*').from('account_balance').where({account_address:account_address})
              logger.log('info','SUCCESSFULLY EXECUTED QUERY(getAllDepositByAddress), address : %s', account_address)
              return data;
            } catch (error) {
              logger.error('ERROR OCCURRED IN QUERY(getAllDepositByAddress): %s', new Error(error))
            }
          }
          else{
            throw new AuthenticationError("Please Login Again!")
          }
        },

        getAllLoanByAddress : async (parent, {account_address}, context) => {
          if(true || context.loggedIn){
            try {
              const data = await db.select('*').from('loans').where({account_address:account_address})
              logger.log('info','SUCCESSFULLY EXECUTED QUERY(getAllLoanByAddress), address : %s', account_address)
              return data;
            } catch (error) {
              logger.error('ERROR OCCURRED IN QUERY(getAllLoanByAddress): %s', new Error(error))
            }
          }
          else{
            throw new AuthenticationError("Please Login Again!")
          } 
        },

        getAllLoansByStatus: async (parent, args, context) => {          
          try {
            const data = await db.select('*').from('loans').join('loan_status_lookup', 'loan_status_lookup.loan_status_id', '=', 'loans.loan_status_id').where({loan_status_description: args.loan_status_description})
            logger.log('info','SUCCESSFULLY EXECUTED QUERY(getAllLoansByStatus)')
            return data;
          } catch (error) {
            logger.error('ERROR OCCURRED IN QUERY(getAllLoansByStatus): %s', new Error(error))
          }
        },

        hello: (_, { name }) => `Hello ${name}!`,
    },

    Mutation : {

        login: async (parent, {signature ,address}, context) => {
          let user = await db.select('address').from('accounts').where({address:address}).first()
          
          if (!user) {
            throw new Error("could not find user");
          }
          const signerAddr = await ethers.utils.verifyMessage("LOGIN_TO_HASHSTACK", signature);
          const valid = signerAddr===address ? true : false
      
          if(valid){
            sendRefreshToken(context.res, createRefreshToken(user));
            return {
              accessToken: getAccessToken(user),
              account_address: user.address
            };
          }
          else{
            throw new Error("Invalid Signature");
          }
        },

        addAccount : async (parent, args, context) => {
          try {
            //check if address already exists
            const existingAccount = await db.select('*').from('accounts').where({address:args.address}).first();
            if(existingAccount){
              logger.log('info','Account already exists with address : %s', args.address)
              return existingAccount
            }
            else{
              const accountDetails = {
                address: args.address,
                whitelist_status_id: 2,
                user_role: "USER",
                created_at: new Date(),
                updated_at: new Date()
              }
              await db.from('accounts').insert(accountDetails)
              logger.log('info','Account added with address : %s', args.address)
              return accountDetails
            }
          } catch (error) {
              logger.error('ERROR OCCURRED IN MUTATION(addAccount): %s', new Error(error))       
          }
        },

        addDeposit : async (parent, args, context) => {
          if(true || context.loggedIn){
            try {
              const address = args.address;
              const depositCommitment = args.commitment;
              const depositMarket = args.market;
              const depositAmount = args.amount;
              //find the deposit-id, if deposit already exist
              const existingDeposit = await db.select('*').from('account_balance').where({address:address ,commitment:depositCommitment, market:depositMarket}).first();
            
              //If deposit already exists
              if(existingDeposit){
                current_net_balance = existingDeposit.net_balance
                updated_net_balance = current_net_balance*1 + depositAmount*1
  
                // check if acquired yield needs to be updated
                // current_net_acquired_yield = db.select('net_balance').from('account_balance').where({id:existingDepositId})
                // updated_net_acquired_yield = current_net_balance + args.amount
                await db.from('account_balance').where({id:existingDeposit.id})
                .update({
                  net_balance: updated_net_balance,
                  updated_at: new Date()
                })
                logger.log('info','updated existing deposit, New Amount: %s', updated_net_balance)
                return await db.select('*').from('account_balance').where({id:existingDeposit.id}).first();
              }
              //else if deposit doesn't exists 
              else{
                const deposit = { 
                  id: uuid.v4(),
                  account_address: address,
                  commitment: depositCommitment,
                  market: depositMarket,
                  net_balance: depositAmount,
                  net_saving_interest:0,
                  created_at: new Date(),
                  updated_at: new Date()
                }
                logger.log('info','Created new Deposit: %s', deposit)
                await db.from('account_balance').insert(deposit)
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
          if(true || context.loggedIn){
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
                account_address: args.account_address,
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
          if(true || context.loggedIn){
            try {
              await db.from('accounts').where({id:args.account_address})
              .update({
                whitelist_status_id: args.whitelist_status_id,
                updated_at: new Date()
              })
              logger.log('info','Updated whitelist status to whitelist_status_id: %s', args.whitelist_status_id)
              //returning the updated whitelist status  
              return await db.select('*').from('accounts').where({id:args.account_address}).first()
            } catch (error) {
              logger.error('ERROR OCCURRED IN MUTATION(updateWhitelistStatus): %s', new Error(error))
            }
          } 
          else{
            throw new AuthenticationError("Please Login Again!")
          }
        },

        requestWhitelist : async (parent, {account_address}, context) => { 
          if(true || context.loggedIn){
            try {
              await db.from('accounts').where({id:account_address})
              .update({
                whitelist_status_id: 10,
                updated_at: new Date(),
                whitelist_requested_timestamp: new Date()
              })
              logger.log('info','Whitelist request for account_address: %s', account_address)
              //returning the updated whitelist status  
              return await db.select('*').from('accounts').where({id:account_address}).first()
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
  
