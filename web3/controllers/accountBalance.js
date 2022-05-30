const db = require('../../src/database/db')
const uuid = require('uuid')
const logger = require("../../src/utils/logger");

exports.createNewUserAccount = async (address) => {
    //logger.log("Initializing createNewUserAccount", address)
    try {
        //check if address already exists
        const existingAccount = await db.select('*').from('accounts').where({ address: address }).first();
        if (existingAccount) {
            logger.log('info', 'Account already exists with address : %s', address)
            return existingAccount
        }
        else {
            const accountDetails = {
                address: address,
                whitelist_status_id: 2,
                user_role: "USER",
                created_at: new Date(),
                updated_at: new Date()
            }
            await db.from('accounts').insert(accountDetails)
            logger.log('info', 'Account added with address : %s', address)
            return accountDetails
        }
    } catch (error) {
        logger.error('ERROR OCCURRED IN createNewUserAccount: %s', new Error(error))
    }
}

exports.createNewDeposit = async (account, market, commitment, amount, transaction_hash) => {
    await exports.createNewUserAccount(account)
    logger.log('info', "Initializing createNewDeposit")

    try {
        const data = await db.select('*').from('transaction_hash').where({ hash: transaction_hash }).first()
        if (!data) {
            const newDepositDetails = {
                id: uuid.v4(),
                market: market,
                commitment: commitment,
                net_balance: amount,
                created_at: new Date(),
                updated_at: new Date(),
                account_address: account,
                net_saving_interest: 0,
            }
            logger.log('info', 'createNewDeposit Event with : %s', newDepositDetails)

            await db.transaction(async trx => {
                await db('account_balance')
                    .insert(newDepositDetails)
                    .transacting(trx);

                await db('transaction_hash')
                    .insert({
                        hash: transaction_hash,
                        created_at: new Date()
                    })
                    .transacting(trx);
            });
            logger.log('info', "createNewDeposit Successfully Executed with transaction Hash:%s", transaction_hash);
        }
        else {
            logger.log('info', "transaction hash already exist, Transaction Hash:: %s", transaction_hash)
        }
    } catch (error) {
        logger.log('error', "ERROR OCCURRED IN EVENT(createNewDeposit): %s", new Error(error))
    }
}

exports.createWithdrawalDeposit = async (account, market, commitment, amount, fee, transaction_hash) => {
    try {
        const data = await db.select('*').from('transaction_hash').where({ hash: transaction_hash }).first()
        if (!data) {
            const existingDeposit = await db.select('*').from('account_balance').where({ account_address: account, commitment: commitment, market: market }).first();
            console.log(existingDeposit);
            current_net_balance = existingDeposit.net_balance
            updated_net_balance = current_net_balance * 1 - amount * 1

            // check if acquired yield needs to be updated
            // current_net_acquired_yield = db.select('net_balance').from('account_balance').where({id:existingDepositId})
            // updated_net_acquired_yield = current_net_balance + args.amount

            await db.transaction(async trx => {
                await db('account_balance').where({ id: existingDeposit.id })
                    .update({
                        net_balance: updated_net_balance,
                        updated_at: new Date()
                    })
                    .transacting(trx);
                await db('transaction_hash')
                    .insert({
                        hash: transaction_hash,
                        created_at: new Date()
                    })
                    .transacting(trx);
            });
            await db.select('*').from('account_balance').where({ id: existingDeposit.id }).first();
            logger.log('info', "createWithdrawalDeposit Successfully Executed with transaction Hash:%s", transaction_hash);
        }
        else {
            logger.log('info', "transaction hash already exist, Transaction Hash:: %s", transaction_hash)
        }
    } catch (error) {
        console.error('ERROR OCCURRED IN EVENT(createWithdrawalDeposit): %s', new Error(error))
    }
}

exports.addToDeposit = async (account, market, commitment, amount, transaction_hash) => {
    //logger.log('info',"Initializing createWithdrawalDeposit %s", addDepositDetails)
    try {
        const data = await db.select('*').from('transaction_hash').where({ hash: transaction_hash }).first()
        if (!data) {
            const existingDeposit = await db.select('*').from('account_balance').where({ account_address: account, commitment: commitment, market: market }).first();

            current_net_balance = existingDeposit.net_balance
            updated_net_balance = current_net_balance * 1 + amount * 1

            // check if acquired yield needs to be updated
            // current_net_acquired_yield = db.select('net_balance').from('account_balance').where({id:existingDepositId})
            // updated_net_acquired_yield = current_net_balance + args.amount

            await db.transaction(async trx => {
                await db('account_balance').where({ id: existingDeposit.id })
                    .update({
                        net_balance: updated_net_balance,
                        updated_at: new Date()
                    })
                    .transacting(trx);
                await db('transaction_hash')
                    .insert({
                        hash: transaction_hash,
                        created_at: new Date()
                    })
                    .transacting(trx);
            });

            logger.log('info', 'updated existing deposit, New Amount: %s', updated_net_balance)
            await db.select('*').from('account_balance').where({ id: existingDeposit.id }).first();
            logger.log('info', "addToDeposit Successfully Executed with transaction Hash:%s", transaction_hash);
        }
        else {
            logger.log('info', "transaction hash already exist, Transaction Hash:: %s", transaction_hash)
        }
    } catch (error) {
        console.error('ERROR OCCURRED IN EVENT(AddToDepositEvent): %s', new Error(error))
    }
}