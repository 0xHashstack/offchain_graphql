const db = require('../../src/database/db')
const uuid = require('uuid')
const logger = require("../../src/utils/logger");

exports.createNewUserAccount = async (address) => {
    //logger.log("Initializing createNewUserAccount", address)
    try {
        //check if address already exists
        const existingAccount = await db.select('*').from('accounts').where({address:address}).first();
        if(existingAccount){
          logger.log('info','Account already exists with address : %s', address)
          return existingAccount
        }
        else{
          const accountDetails = {
            address: address,
            whitelist_status_id: 2,
            user_role: "USER",
            created_at: new Date(),
            updated_at: new Date()
          }
          await db.from('accounts').insert(accountDetails)
          logger.log('info','Account added with address : %s', address)
          return accountDetails
        }
      } catch (error) {
          logger.error('ERROR OCCURRED IN createNewUserAccount: %s', new Error(error))       
      }
}

exports.createNewDeposit = async (depositDetails) => {
    logger.log('info',"Initializing createNewDeposit %s", depositDetails)

    try {
        const newDepositDetails = {
            id: uuid.v4(),
            market: depositDetails.market,
            commitment: depositDetails.commitment,
            net_balance: depositDetails.amount,
            created_at: new Date(),
            updated_at: new Date(),
            account_address: depositDetails.account,
            net_saving_interest: 0.40404,
        }
        // console.log('info','createNewDeposit Event with : %s', newDepositDetails)
        const depositAdded = await db.from('account_balance').insert(newDepositDetails)
        logger.log('info', 'createNewDeposit Event with : %s', depositAdded)
    } catch (error) {
        console.error('ERROR OCCURRED IN EVENT(createNewDeposit): %s', new Error(error))
    }
}

exports.createWithdrawalDeposit = async (withdrawalDetails) => {
    try {
        logger.log('info',"Initializing createWithdrawalDeposit %s", withdrawalDetails)
        const existingDeposit = await db.select('*').from('account_balance').where({account_address: withdrawalDetails.account, commitment:withdrawalDetails.commitment, market: withdrawalDetails.market}).first();

        current_net_balance = existingDeposit.net_balance
        updated_net_balance = current_net_balance*1 - withdrawalDetails.amount*1
  
        // check if acquired yield needs to be updated
        // current_net_acquired_yield = db.select('net_balance').from('account_balance').where({id:existingDepositId})
        // updated_net_acquired_yield = current_net_balance + args.amount
        await db.from('account_balance').where({id:existingDeposit.id})
        .update({
            net_balance: updated_net_balance,
            updated_at: new Date()
        })
        logger.log('info','updated existing deposit after withdraw deposit, New Amount: %s', updated_net_balance)
        return await db.select('*').from('account_balance').where({id:existingDeposit.id}).first();
    } catch (error) {
        console.error('ERROR OCCURRED IN EVENT(createWithdrawalDeposit): %s', new Error(error))
    }
}

exports.addToDeposit = async (addDepositDetails) => {
    logger.log('info',"Initializing createWithdrawalDeposit %s", addDepositDetails)

    try {
        const existingDeposit = await db.select('*').from('account_balance').where({account_address: addDepositDetails.account ,commitment:addDepositDetails.commitment, market: addDepositDetails.market}).first();

        current_net_balance = existingDeposit.net_balance
        updated_net_balance = current_net_balance*1 + addDepositDetails.amount*1
  
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
    } catch (error) {
        console.error('ERROR OCCURRED IN EVENT(AddToDepositEvent): %s', new Error(error))
    }
}