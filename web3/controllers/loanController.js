const db = require('../../src/database/db')
const uuid = require('uuid')
const logger = require("../../src/utils/logger");
const { createNewUserAccount } = require('./accountBalance')

exports.createNewLoan = async (account, loanMarket, commitment, loanAmount, collateralMarket, collateralAmount, debtCategory, cdr, transaction_hash) => {
    try {
        const data = await db.select('*').from('transaction_hash').where({ hash: transaction_hash }).first()
        await createNewUserAccount(account)
        //if transaction hash already present then ignore the event, else store the event in the DB
        if (!data) {
            const loanData = {
                id: uuid.v4(),
                loan_market: loanMarket,
                loan_amount: loanAmount,
                collateral_market: collateralMarket,
                collateral_amount: collateralAmount,
                collateral_current_amount: collateralAmount,
                borrow_interest: 0,
                commitment: commitment,
                cdr: cdr,
                debt_category: debtCategory,
                current_amount: loanAmount,
                current_market: loanMarket,
                is_swapped: false,
                loan_status_id: 2,
                account_address: account,
                loan_liquidation_id: 2,
                created_at: new Date(),
                updated_at: new Date()
            }
            await db.transaction(async trx => {
                await db('loans')
                    .insert(loanData)
                    .transacting(trx);

                await db('transaction_hash')
                    .insert({
                        hash: transaction_hash,
                        created_at: new Date()
                    })
                    .transacting(trx);
            });
            logger.log('info', "createNewLoan Successfully Executed with transaction Hash:%s", transaction_hash);
        }
        else {
            logger.log('info', "transaction hash already exist, Transaction Hash:: %s", transaction_hash)
        }
    } catch (error) {
        console.error(error);
        logger.error('ERROR OCCURRED IN EVENT(createNewLoan): %s', new Error(error))
        throw error;
    }
}

exports.updateSwapLoanEventData = async (account, loanMarket, commitment, currentMarket, amount, isSwapped, transaction_hash) => {
    try {

        const data = await db.select('*').from('transaction_hash').where({ hash: transaction_hash }).first()
        //if transaction hash already present then ignore the event, else store the event in the DB
        if (!data) {
            await db.transaction(async trx => {
                await db.from('loans').where({ account_address: account, commitment: commitment, loan_market: loanMarket })
                    .update({
                        current_market: currentMarket,
                        current_amount: amount * 1,
                        is_swapped: isSwapped,
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
            logger.log('info', "updateSwapLoanEventData Successfully Executed with transaction Hash:%s", transaction_hash);
        }
        else {
            logger.log('info', "transaction hash already exist, Transaction Hash:: %s", transaction_hash)
        }
    } catch (error) {
        logger.log('error', 'updateSwapLoanEventData returned Error : %s', error)
        throw error;
    }
}

exports.createWithdrawalPartialLoan = async (account, amount, market, commitment, transaction_hash) => {
    try {

        const data = await db.select('*').from('transaction_hash').where({ hash: transaction_hash }).first()
        //if transaction hash already present then ignore the event, else store the event in the DB
        if (!data) {
            const loanDetails = await db.from('loans').where({ account_address: account, commitment: commitment, loan_market: market }).first()
            const updatedCurrentAmount = 1 * loanDetails.current_amount - 1 * amount
            await db.transaction(async trx => {
                await db.from('loans').where({ account_address: account, commitment: commitment, loan_market: market })
                    .update({
                        current_amount: updatedCurrentAmount * 1,
                        updated_at: new Date()
                    }).transacting(trx);

                await db('transaction_hash')
                    .insert({
                        hash: transaction_hash,
                        created_at: new Date()
                    })
                    .transacting(trx);
            });
            logger.log('info', "updateSwapLoanEventData Successfully Executed with transaction Hash:%s", transaction_hash);
        }
        else {
            logger.log('info', "transaction hash already exist, Transaction Hash:: %s", transaction_hash)
        }
    } catch (error) {
        logger.log('error', 'createWithdrawalPartialLoan returned Error : %s', error)
        throw error;
    }
}

exports.loanRepaid = async (account, market, commitment, amount, repaidAmount, transaction_hash) => {
    try {
        const data = await db.select('*').from('transaction_hash').where({ hash: transaction_hash }).first()
        //if transaction hash already present then ignore the event, else store the event in the DB
        if (!data) {

            if (commitment === "0x636f6d69745f4e4f4e4500000000000000000000000000000000000000000000") {

                await db.transaction(async trx => {
                    await db.from('loans').where({ account_address: account, commitment: commitment, loan_market: market })
                        .update({
                            collateral_current_amount: 0,
                            current_amount: 0,
                            current_market: market,
                            loan_status_id: 42,
                            updated_at: new Date()
                        }).transacting(trx);

                    await db('transaction_hash')
                        .insert({
                            hash: transaction_hash,
                            created_at: new Date()
                        })
                        .transacting(trx);
                });
            }
            else {
                await db.transaction(async trx => {
                    await db.from('loans').where({ account_address: account, commitment: commitment, loan_market: market })
                        .update({
                            current_amount: 0,
                            current_market: market,
                            loan_status_id: 42,
                            updated_at: new Date()
                        }).transacting(trx);
                    await db('transaction_hash')
                        .insert({
                            hash: transaction_hash,
                            created_at: new Date()
                        })
                        .transacting(trx);
                });
            }
            logger.log('info', "loanRepaid Successfully Executed with transaction Hash:%s", transaction_hash);
        }
        else {
            logger.log('info', "transaction hash already exist, Transaction Hash:: %s", transaction_hash)
        }
    } catch (error) {
        logger.log('error', 'updateLoanRepaid returned Error : %s', error)
        throw error;
    }
}

exports.createAddCollateralDeposit = async (account, market, commitment, amount, transaction_hash) => {
    try {
        const data = await db.select('*').from('transaction_hash').where({ hash: transaction_hash }).first()
        //if transaction hash already present then ignore the event, else store the event in the DB
        if (!data) {
            logger.log('info', 'createAddCollateralDepositDetails Initiated %s %s %s %s', account, market, commitment, transaction_hash)

            const loanDetails = await db.from('loans').where({ account_address: account, commitment: commitment, loan_market: market }).first()
            const updatedCollateralAmount = 1 * loanDetails.collateral_current_amount + 1 * amount

            await db.transaction(async trx => {
                await db.from('loans').where({ account_address: account, commitment: commitment, loan_market: market })
                    .update({
                        collateral_current_amount: updatedCollateralAmount * 1,
                        updated_at: new Date()
                    }).transacting(trx);

                await db('transaction_hash')
                    .insert({
                        hash: transaction_hash,
                        created_at: new Date()
                    })
                    .transacting(trx);
            });
            logger.log('info', "createAddCollateralDeposit Successfully Executed with transaction Hash:%s", transaction_hash);
        }
        else {
            logger.log('info', "transaction hash already exist, Transaction Hash:: %s", transaction_hash)
        }

    } catch (error) {
        logger.log('error', 'createAddCollateralDeposit returned Error : %s', error)
        throw error;
    }
}

exports.createWithdrawCollateralDeposit = async (account, market, commitment, amount, transaction_hash) => {
    try {

        const data = await db.select('*').from('transaction_hash').where({ hash: transaction_hash }).first()
        //if transaction hash already present then ignore the event, else store the event in the DB
        if (!data) {
            logger.log('info', 'createWithdrawCollateralDeposit Initiated')

            const loanDetails = await db.from('loans').where({ account_address: account, commitment: commitment, loan_market: market }).first()
            const updatedCollateralAmount = 1 * loanDetails.collateral_current_amount - 1 * amount

            await db.transaction(async trx => {
                await db.from('loans').where({ account_address: account, commitment: commitment, loan_market: market })
                    .update({
                        collateral_current_amount: updatedCollateralAmount * 1,
                        updated_at: new Date()
                    }).transacting(trx);

                await db('transaction_hash')
                    .insert({
                        hash: transaction_hash,
                        created_at: new Date()
                    })
                    .transacting(trx);
            });
        }
        else {
            logger.log('info', "transaction hash already exist, Transaction Hash:: %s", transaction_hash)
        }

    } catch (error) {
        logger.log('error', 'createWithdrawCollateralDeposit returned Error : %s', error)
        throw error;
    }
}
