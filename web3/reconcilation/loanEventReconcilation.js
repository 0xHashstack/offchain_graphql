const logger = require("../../src/utils/logger");

exports.captureMissedLoanEvent = async () => {
    try {
        var current_timestamp_in_second = new Date().getTime() / 1000;
        var initial_timestamp = current_timestamp_in_second - 300;
        let count = 0;
        let flag = 1;
        let timestamp_start = initial_timestamp;
        while (flag && timestamp_start<=current_timestamp_in_second) {
            loan_response_data = await axios.post(SUBGRAPH_RECONCILIATION_URL, {
                query: `
                    {
                        loans(first: 1000,where: { timestamp_gte: ${timestamp_start}, timestamp_lte: ${current_timestamp_in_second}}, orderBy: timestamp, orderDirection: asc) {
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
                        console.log("New Loan Event Added via subgraph!",count)
                        let { id, address, loanMarket, commitment, loanAmount, collateralMarket, collateralAmount } = loan_past_data[i]
                        // debt category event will be generated from the blockchain end!
                        let debtCategory = 1
                        const cdr = BigNumber(collateralAmount) / BigNumber(loanAmount);
                        if (cdr >= 1) {
                            debtCategory = 1;
                        } else if (cdr >= 0.5 && cdr < 1) {
                            debtCategory = 2;
                        } else if (cdr >= 0.333 && cdr < 0.5) {
                            debtCategory = 3;
                        }
                        createNewLoan(address, loanMarket, commitment, loanAmount, collateralMarket, collateralAmount, debtCategory, cdr, id)
                        break;
                    }
                    case "SwappedLoan": {
                        console.log("Swap Loan Event Added  via subgraph!",count)
                        let { id, address, loanMarket, commitment, amount, currentMarket, isSwapped } = loan_past_data[i]
                        //updateSwapLoanEventData(address, loanMarket, commitment, currentMarket, amount, isSwapped, id)
                        break;
                    }
                    case "WithdrawLoan": {
                        console.log("Withdraw Partial Loan Event Added via subgraph!",count)
                        let { id, address, amount, market, commitment } = loan_past_data[i]
                        //createWithdrawalPartialLoan(address, amount, market, commitment, id)
                        break;
                    }
                    case "LoanRepaid": {
                        console.log("Loan Repaid Event Added via subgraph!",count)
                        let { id, address, market, commitment, amount, repaidAmount } = loan_past_data[i]
                        //loanRepaid(address, market, commitment, amount, repaidAmount, id)
                        break;
                    }
                    case "AddCollateral": {
                        console.log("AddCollateral Event Added via subgraph!",count)
                        let { address, market, commitment, amount, id } = loan_past_data[i]
                        //createAddCollateralDeposit(address, market, commitment, amount, id)
                        break;
                    }
                    case "WithdrawCollateral": {
                        console.log("AddCollateral Event Added via subgraph!",count)
                        let { address, market, commitment, amount, id } = loan_past_data[i]
                        //createWithdrawCollateralDeposit(address, market, commitment, amount, id)
                        break;
                    }
                    default: {
                        logger.log('info', "UNKNOWN_ACTION_IDENTIFIED");
                    }
                }
            }
            timestamp_start = loan_past_data[n - 1].timestamp
        }  
    } catch (error) {
        logger.error('ERROR OCCURRED IN EVENT(createNewLoan): %s', new Error(error))
        throw error;
    }
}
