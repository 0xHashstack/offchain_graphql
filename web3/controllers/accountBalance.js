const db = require('../../src/database/db')
const uuid = require('uuid')
const logger = require("../../src/utils/logger");

exports.createNewDeposit = async (depositDetails) => {
    logger.log("Initializing createNewDeposit", depositDetails)

    try {
        const accountData = await db.select('*').from('accounts').join('whitelist_status_lookup', 'whitelist_status_lookup.whitelist_status_id', '=', 'accounts.whitelist_status_id').where({ address: depositDetails.account }).first()
        console.log(accountData)
        const newDepositDetails = {
            id: uuid.v4(),
            market: depositDetails.market,
            commitment: depositDetails.commitment,
            net_balance: depositDetails.amount,
            created_at: new Date(),
            updated_at: new Date(),
            account_id: accountData.id,
            net_saving_interest: 0.40404, //fix this later
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
        logger.log("Initializing createWithdrawalDeposit", withdrawalDetails)
        const accountData = await db.select('*').from('accounts').join('whitelist_status_lookup', 'whitelist_status_lookup.whitelist_status_id', '=', 'accounts.whitelist_status_id').where({ address: depositDetails.account }).first()
        const existingDeposit = await db.select('*').from('account_balance').where({account_id: accountData.id ,commitment:depositCommitment, market:depositMarket}).first();

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
        logger.log('info','updated existing deposit, New Amount: %s', updated_net_balance)
        return await db.select('*').from('account_balance').where({id:existingDeposit.id}).first();
    } catch (error) {
        console.error('ERROR OCCURRED IN EVENT(createWithdrawalDeposit): %s', new Error(error))
    }
}

exports.addToDeposit = async (addDepositDetails) => {
    logger.log("Initializing createWithdrawalDeposit", addDepositDetails)

    try {
        const accountData = await db.select('*').from('accounts').join('whitelist_status_lookup', 'whitelist_status_lookup.whitelist_status_id', '=', 'accounts.whitelist_status_id').where({ address: addDepositDetails.account }).first()
        const existingDeposit = await db.select('*').from('account_balance').where({account_id: accountData.id ,commitment:addDepositDetails.commitment, market: addDepositDetails.market}).first();

        current_net_balance = existingDeposit.net_balance
        updated_net_balance = current_net_balance*1 + depositDetails.amount*1
  
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