const db = require('../../src/database/db')
const uuid = require('uuid')
const logger = require("../../src/utils/logger");

exports.addLoan = async (loanDetails) => {
    //console.log("addLoan Enter", loanDetails)
    const accountData = await db.select('*').from('accounts').join('whitelist_status_lookup', 'whitelist_status_lookup.whitelist_status_id', '=', 'accounts.whitelist_status_id').where({ address: loanDetails.account }).first()
    //console.log(accountData)
    try {
        const loanData = {
            id: uuid.v4(),
            loan_market: loanDetails.loanMarket,
            loan_amount: loanDetails.loanAmount,
            collateral_market: loanDetails.collateralMarket,
            collateral_amount: loanDetails.collateralAmount,
            collateral_current_amount: loanDetails.collateralAmount,
            borrow_interest: 0,
            commitment: loanDetails.commitment,
            cdr: loanDetails.cdr,
            debt_category: loanDetails.debtCategory,
            current_amount:  loanDetails.loanAmount,
            current_market: loanDetails.loanMarket,
            is_swapped: false,
            loan_status_id: 2,
            account_id: accountData.id,
            created_at: new Date(),
            updated_at: new Date()
        }
        await db.from('loans').insert(loanData)
        logger.log('info','Created new loan: %s', loanData)
        return loanData
    } catch (error) {
        console.error(error);
        if (error.name === 'ValidationError') {
            logger.error('ERROR OCCURRED IN EVENT(addLoan): ValidationError: %s', new Error(error))
            const messages = Object.values(error.errors).map(val => val.message);
            throw new Error(messages)
        } else {
            logger.error('ERROR OCCURRED IN EVENT(addLoan): %s', new Error(error))
            throw error;
        }
    }
}

exports.updateSwapLoanEventData = async (account, loanMarket, commitment, currentMarket, amount, isSwapped) =>{
    try {
        const accountData = await db.select('*').from('accounts').join('whitelist_status_lookup', 'whitelist_status_lookup.whitelist_status_id', '=', 'accounts.whitelist_status_id').where({ address: account }).first()

        const loan = await db.from('loans').where({account_id: accountData.id, commitment:commitment, loan_market:loanMarket})
                .update({
                  current_market: currentMarket,
                  current_amount: amount*1,
                  is_swapped: isSwapped,
                  updated_at: new Date()
                })
        console.log(amount)
        if (!loan) {
            console.log(`No loan with id: ${account} ${loanMarket} ${commitment} found!`)
            return;
        }
        return loan;
    } catch (error) {
        throw error;
    }
}

exports.createWithdrawalPartialLoan = async (withdrawPartialLoanDetails) => {
    try {
        logger.log('info','createWithdrawalPartialLoan with : %s', withdrawPartialLoanDetails)
        const accountData = await db.select('*').from('accounts').join('whitelist_status_lookup', 'whitelist_status_lookup.whitelist_status_id', '=', 'accounts.whitelist_status_id').where({ address: withdrawPartialLoanDetails.account }).first()
        
        const loanDetails = await db.from('loans').where({account_id: accountData.id, commitment:withdrawPartialLoanDetails.commitment, loan_market:withdrawPartialLoanDetails.market}).first()
        const updatedCurrentAmount = 1*loanDetails.current_amount - 1*withdrawPartialLoanDetails.amount
        await db.from('loans').where({account_id: accountData.id, commitment:withdrawPartialLoanDetails.commitment, loan_market:withdrawPartialLoanDetails.market})
            .update({
                current_amount: updatedCurrentAmount*1,
                updated_at: new Date()
            })
        return withdrawPartialLoanAdded;
    } catch (error) {
        logger.log('error','createWithdrawalPartialLoan returned Error : %s', error)  
        throw error;
    }
}

exports.loanRepaid = async (loanRepaidDetails) => {
    try {
        logger.log('info','loanRepaidDetails with : %s', loanRepaidDetails)
        const accountData = await db.select('*').from('accounts').join('whitelist_status_lookup', 'whitelist_status_lookup.whitelist_status_id', '=', 'accounts.whitelist_status_id').where({ address: loanRepaidDetails.account }).first()

        if(loanRepaidDetails.commitment === NONE){
            await db.from('loans').where({account_id: accountData.id, commitment:loanRepaidDetails.commitment, loan_market:loanRepaidDetails.market})
            .update({
                collateral_current_amount: 0,
                current_amount: 0,
                current_market: market,
                loan_status_id: 42,
                updated_at: new Date()
            })
        }
        else{
            await db.from('loans').where({account_id: accountData.id, commitment:loanRepaidDetails.commitment, market:loanRepaidDetails.market})
            .update({
                current_amount: 0,
                current_market: market,
                loan_status_id: 42,
                updated_at: new Date()
            })
        }
        return loanRepaidAdded;
    } catch (error) {
        logger.log('error','updateLoanRepaid returned Error : %s', error)
        throw error;
    }
}

exports.createAddCollateralDeposit = async (collateralDepositDetails) => {
    try {
        logger.log('info','createAddCollateralDepositDetails with : %s', collateralDepositDetails)
        const accountData = await db.select('*').from('accounts').join('whitelist_status_lookup', 'whitelist_status_lookup.whitelist_status_id', '=', 'accounts.whitelist_status_id').where({ address: collateralDepositDetails.account }).first()

        const loanDetails = await db.from('loans').where({account_id: accountData.id, commitment:collateralDepositDetails.commitment, loan_market:collateralDepositDetails.market}).first()
        const updatedCollateralAmount = 1*loanDetails.collateral_current_amount + 1*collateralDepositDetails.amount
        const collateralDepositAdded = await db.from('loans').where({account_id: accountData.id, commitment:collateralDepositDetails.commitment, loan_market:collateralDepositDetails.market})
                .update({
                  collateral_current_amount: updatedCollateralAmount*1,
                  updated_at: new Date()
                })
                console.log(updatedCollateralAmount)
        //return collateralDepositAdded;
    } catch (error) {
        logger.log('error','createAddCollateralDeposit returned Error : %s', error)
        throw error;
    }
}

exports.createWithdrawCollateralDeposit = async (collateralWithdrawDetails) => {
    try {
        logger.log('info','createWithdrawCollateralDeposit with : %s', collateralWithdrawDetails)
        const accountData = await db.select('*').from('accounts').join('whitelist_status_lookup', 'whitelist_status_lookup.whitelist_status_id', '=', 'accounts.whitelist_status_id').where({ address: collateralWithdrawDetails.account }).first()

        const loanDetails = await db.from('loans').where({account_id: accountData.id, commitment:collateralWithdrawDetails.commitment, loan_market:collateralWithdrawDetails.market}).first()
        const updatedCollateralAmount = 1*loanDetails.collateral_current_amount - 1*collateralWithdrawDetails.amount
        const collateralDepositAdded = await db.from('loans').where({account_id: accountData.id, commitment:collateralWithdrawDetails.commitment, loan_market:collateralWithdrawDetails.market})
                .update({
                  collateral_current_amount: updatedCollateralAmount*1,
                  updated_at: new Date()
                })
        return collateralDepositAdded;
    } catch (error) {
        logger.log('error','createAddCollateralDeposit returned Error : %s', error)
        throw error;
    }
}