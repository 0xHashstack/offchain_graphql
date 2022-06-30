const logger = require("../../src/utils/logger");
const { default: BigNumber } = require('bignumber.js');
const axios = require('axios');
const { SUBGRAPH_RECONCILIATION_URL } = require('../../constants/constants')
const { createNewDeposit, addToDeposit, createWithdrawalDeposit } = require('../controllers/accountBalance');
const { createNewLoan, updateSwapLoanEventData, loanRepaid, createAddCollateralDeposit, createWithdrawCollateralDeposit, createWithdrawalPartialLoan } = require('../controllers/loanController');
const cron = require('node-cron');
const { captureMissedLoanEvent } = require('./loanEventReconcilation');

exports.ReconcilePastLoanDataInit = async () => {
    try {
        let count = 0;
        let flag = 1;
        let timestamp_start = 0;
        while (flag) {
            loan_response_data = await axios.post(SUBGRAPH_RECONCILIATION_URL, {
                query: `
                    {
                        loans(first: 1000,where: { timestamp_gte: ${timestamp_start}}, orderBy: timestamp, orderDirection: asc) {
                            id
                            address
                            loanMarket
                            commitment
                            loanAmount
                            amount
                            market
                            collateralMarket
                            collateralAmount
                            currentMarket
                            isSwapped
                            repaidAmount
                            feePaid
                            action
                            date
                            timestamp
                        }
                    }          
                `,
            });
  
            //BASED ON THE ACTION RECEIVED PERFORM THE APPROPRIATE ACTION
            let loan_past_data = loan_response_data.data.data.loans
            //length of the array - n
            let n = loan_past_data.length
            if (n < 1000) {
                flag = 0;
            }

            for (let i = 0; i < n; i++) {
                let eventName = loan_past_data[i].action;
                count++;
                switch (eventName) {
                    case "NewLoan": {
                        console.log("New Loan Event Added via subgraph!", count)
                        let { id, address, loanMarket, commitment, loanAmount, collateralMarket, collateralAmount } = loan_past_data[i]
                        // debt category event will be generated from the blockchain end!
                        let debtCategory = 1
                        const cdr = BigNumber(collateralAmount) / BigNumber(loanAmount);
                        console.log(cdr)
                        if (cdr >= 1) {
                            debtCategory = 1;
                        } else if (cdr >= 0.5 && cdr < 1) {
                            debtCategory = 2;
                        } else if (cdr >= 0.333 && cdr < 0.5) {
                            debtCategory = 3;
                        }
                        
                        createNewLoan(address, loanMarket, commitment, loanAmount, collateralMarket, collateralAmount, debtCategory, cdr, id, count)
                        break;
                    }
                    case "SwappedLoan": {
                        console.log("Swap Loan Event Added  via subgraph!", count)
                        let { id, address, loanMarket, commitment, amount, currentMarket, isSwapped } = loan_past_data[i]
                        updateSwapLoanEventData(address, loanMarket, commitment, currentMarket, amount, isSwapped, id)
                        break;
                    }
                    // case "WithdrawLoan": {
                    //     console.log("WithdrawPartial Loan Event Added via subgraph!", count)
                    //     let { id, address, amount, market, commitment } = loan_past_data[i]
                    //     createWithdrawalPartialLoan(address, amount, market, commitment, id)
                    //     break;
                    // }
                    case "LoanRepaid": {
                        console.log("LoanRepaid Event Added via subgraph!", count)
                        let { id, address, market, commitment, amount, repaidAmount } = loan_past_data[i]
                        loanRepaid(address, market, commitment, amount, repaidAmount, id)
                        break;
                    }
                    // case "AddCollateral": {
                    //     console.log("AddCollateral Event Added via subgraph!", count)
                    //     let { address, market, commitment, amount, id } = loan_past_data[i]
                    //     createAddCollateralDeposit(address, market, commitment, amount, id)
                    //     break;
                    // }
                    case "WithdrawCollateral": {
                        console.log("AddCollateral Event Added via subgraph!", count)
                        let { address, market, commitment, amount, id } = loan_past_data[i]
                        //createWithdrawCollateralDeposit(address, market, commitment, amount, id)
                        break;
                    }
                    default: {
                        logger.log('info', "UNKNOWN_LOAN_ACTION_IDENTIFIED Transaction_Hash: %s", loan_past_data[i].id);
                    }
                }
            }
            timestamp_start = loan_past_data[n - 1].timestamp
        }

        // once reconciliation is done, then we can run a cron job every 2 minutes, which can update any event if it is missed 
        cron.schedule('* */4 * * *', () => {
            captureMissedLoanEvent()
        });

    } catch (err) {
        logger.log('info', "ReconcilePastDataInit returned Error:", err)
        throw err;
    }
}



exports.ReconcilePastDepositDataInit = async () => {
    try {
        let count = 0;
        let flag = 1;
        let timestamp_start = 0;
        while (flag) {
            response_data = await axios.post(SUBGRAPH_RECONCILIATION_URL, {
                query: `
                    {
                        deposits(first: 1000,where: { timestamp_gte: ${timestamp_start}}, orderBy:  timestamp, orderDirection: asc) {
                            id
                            address
                            market
                            commitment
                            amount
                            fee
                            action
                            timestamp
                        }
                    }         
                `,
            });
            //BASED ON THE ACTION RECEIVED PERFORM THE APPROPRIATE ACTION
            let deposit_past_data = response_data.data.data.deposits

            //length of the array - n
            let n = deposit_past_data.length
            if (n < 1000) {
                flag = 0;
            }

            for (let i = 0; i < n; i++) {
                let eventName = deposit_past_data[i].action;
                count++;
                switch (eventName) {
                    case "NewDeposit": {
                        console.log("New Deposit Event Added via subgraph!", count)
                        logger.log('info', "Deposit Added Event Added via subgraph!");
                        let { address, market, commitment, amount, id } = deposit_past_data[i]
                        createNewDeposit(address, market, commitment, amount, id)
                        break;
                    }
                    case "DepositWithdrawal": {
                        console.log("Deposit Withdrawal Added  via subgraph!", count)
                        logger.log('info', "Deposit Added Event Added via subgraph!");
                        let { address, market, commitment, amount, fee, id } = deposit_past_data[i]
                        createWithdrawalDeposit(address, market, commitment, amount, fee, id)
                        break;
                    }
                    case "DepositAdded": {
                        console.log("Deposit Added Event Added via subgraph!", count)
                        logger.log('info', "Deposit Added Event Added via subgraph!");
                        let { id, address, amount, market, commitment } = deposit_past_data[i]
                        addToDeposit(address, market, commitment, amount, id)
                        break;
                    }
                    default: {
                        logger.log('info', "UNKNOWN_ACTION_IDENTIFIED %s", eventName);
                    }
                }
            }
            timestamp_start = deposit_past_data[n - 1].timestamp
        }
        cron.schedule('* */4 * * *', () => {
            captureMissedDepositEvent()
        });
    } catch (err) {
        logger.log('info', "ReconcilePastDataInit returned Error:", err)
        throw err;
    }
}