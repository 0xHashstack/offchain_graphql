const db = require('../../src/database/db')
const logger = require("../../src/utils/logger");

exports.addLoan = async (loanDetails) => {
    console.log("addLoan Enter", loanDetails)
    const accountData = await db.select('*').from('accounts').join('whitelist_status_lookup', 'whitelist_status_lookup.whitelist_status_id', '=', 'accounts.whitelist_status_id').where({ address: loanDetails.account }).first()

    try {
        const loanData = {
            id: uuid.v4(),
            loan_market: loanDetails.loanMarket,
            loan_amount: loanDetails.loanAmount,
            collateral_market: loanDetails.collateralMarket,
            collateral_amount: loanDetails.collateralAmount,
            commitment: loanDetails.commitment,
            cdr: loanDetails.cdr,
            debt_category: loanDetails.debtCategory,
            current_amount:  loanDetails.loanAmount,
            current_market: loanDetails.loanMarket,
            is_swapped: false,
            loan_status_id: 2,
            account_id: accountData.account_id,
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

exports.updateSwapLoanEventData = async (loan_id, account, currentMarket, currentAmount, isSwapped) =>{
    try {
        const loan = await db.from('loans').where({id:loan_id})
                .update({
                  current_market: currentMarket,
                  current_amount: currentAmount,
                  is_swapped: isSwapped,
                  updated_at: new Date()
                })
        if (!loan) {
            console.log(`No loan with id: ${loanId} found!`)
            return;
        }
        return loan;
    } catch (error) {
        throw error;
    }
}

exports.createWithdrawalPartialLoan = async (withdrawPartialLoanDetails) => {
    try {
        logger.log('info','addToDeposit with : %s', withdrawPartialLoanDetails)
        withdrawPartialLoanAdded = await WithdrawalPartialLoanDb.create(withdrawPartialLoanDetails);
        return withdrawPartialLoanAdded;
    } catch (error) {
        logger.log('error','createWithdrawalPartialLoan returned Error : %s', error)  
        throw error;
    }
}

exports.loanRepaid = async (loanRepaidDetails) => {
    try {
        logger.log('info','addToDeposit with : %s', loanRepaidDetails)
        
        loanRepaidAdded = await LoanRepaid.create(loanRepaidDetails);
        
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

        const loanDetails = await db.from('loans').where({account_id: accountData.id, commitment:collateralDepositDetails.commitment, loan_market:collateralDepositDetails.market})
        const updatedCollateralAmount = 1*loanDetails.current_collateral_amount + 1*collateralDepositDetails.amount
        const collateralDepositAdded = await db.from('loans').where({account_id: accountData.id, commitment:collateralDepositDetails.commitment, loan_market:collateralDepositDetails.market})
                .update({
                  collateral_current_amount: updatedCollateralAmount,
                  updated_at: new Date()
                })
        return collateralDepositAdded;
    } catch (error) {
        logger.log('error','createAddCollateralDeposit returned Error : %s', error)
        throw error;
    }
}