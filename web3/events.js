const { diamondAddress } = require("../constants/constants");
const Deposit = require('../blockchain/abis/Deposit.json');
const Loan1 = require('../blockchain/abis/Loan1.json');
const Loan2 = require('../blockchain/abis/Loan2.json');
const Loan = require('../blockchain/abis/Loan.json');
const Liquidator = require('../blockchain/abis/Liquidator.json');
const { getWeb3 } = require("./transaction");
const { default: BigNumber } = require('bignumber.js');
const { createNewUserAccount, createNewDeposit, addToDeposit, createWithdrawalDeposit } = require('./controllers/accountBalance');
const { createNewLoan, updateSwapLoanEventData, loanRepaid, createAddCollateralDeposit, createWithdrawCollateralDeposit, createWithdrawalPartialLoan } = require('./controllers/loanController');
const logger = require("../src/utils/logger");
const db = require('../src/database/db')
const { ReconcilePastDepositDataInit, ReconcilePastLoanDataInit } = require('./reconcilation/index')

const listenToEvents = (app) => {
    const web3 = getWeb3();    
    let depositContract = new web3.eth.Contract(
        Deposit,
        diamondAddress
    )
    let loanContract1 = new web3.eth.Contract(
        Loan1,
        diamondAddress
    )
    let loanContract2 = new web3.eth.Contract(
        Loan2,
        diamondAddress
    )
    let partialLoanContract = new web3.eth.Contract(
        Loan,
        diamondAddress
    )
    let liquidationContract = new web3.eth.Contract(
        Liquidator,
        diamondAddress
    )


    // TO DO: Once CDR is fixed from blockchain side, uncomment this code

   // ReconcilePastLoanDataInit();
    // ReconcilePastDepositDataInit();

    NewDepositEvent(depositContract);
    WithdrawalDepositEvent(depositContract);
    AddToDepositEvent(depositContract);
    NewLoanEvent(loanContract1);
    SwapLoanEvent(partialLoanContract);
    WithdrawPartialLoanDepositEvent(partialLoanContract);
    RepaidLoanEvent(loanContract2);
    AddCollateralEvent(partialLoanContract);
    WithdrawCollateralEvent(partialLoanContract);
    // LiquidationEvent(liquidationContract)

    return app
}

////////////////////////////////////////////////////////////////////////
//////////////////////// DEPOSIT EVENTS ////////////////////////////////
////////////////////////////////////////////////////////////////////////

const NewDepositEvent = (depositContract) => {
    console.log("Listening to NewDeposit event");
    depositContract.events.NewDeposit({}, async (error, event) => {
        try {
            console.log("******** NEW DEPOSIT EVENT ********")
            //createNewUserAccount(event.returnValues.account)
            if (!error) {
                console.log("******** NEW DEPOSIT EVENT ********")
                logger.log('info', 'NewDeposit event event.returnValues Called with : %s', JSON.stringify(event.returnValues))
                logger.log('info', 'NewDeposit event Called with : %s', JSON.stringify(event))

                const { account, market, commitment, amount } = event.returnValues;
                const transaction_hash = event.transactionHash;
                await createNewDeposit(account, market, commitment, amount, transaction_hash)
            } else {
                console.error(error);
            }
        }
        catch (err) {
            logger.log('error', 'NewDepositEvent returned Error : %s', JSON.stringify(err))
            console.error(err);
        }
    })
}

const WithdrawalDepositEvent = (depositContract) => {
    console.log("Listening to WithdrawalDepositEvent event");
    depositContract.events.DepositWithdrawal({}, async (error, event) => {
        try {
            if (!error) {
                console.log("****** WITHDRAW DEPOSIT EVENT ********")
                console.log(event.returnValues)
                logger.log('info', 'WithdrawalDepositEvent event.returnValues with : %s', JSON.stringify(event.returnValues))
                logger.log('info', 'WithdrawalDepositEvent event with : %s', JSON.stringify(event))
                const { account, market, commitment, depositId, amount, fee } = event.returnValues;
                const transaction_hash = event.transactionHash;
                await createWithdrawalDeposit(account, market, commitment, amount, fee, transaction_hash)
            } else {
                console.error(error);
            }
        }
        catch (err) {
            logger.log('error', 'WithdrawalDepositEvent event returned Error : %s', JSON.stringify(err))
            console.error(err);
        }
    })
}

const AddToDepositEvent = (depositContract) => {
    console.log("Listening to AddToDepositEvent event");
    depositContract.events.DepositAdded({}, async (error, event) => {
        try {
            if (!error) {
                console.log("****** DEPOSIT ADDED EVENT ********")
                console.log(event.returnValues)
                logger.log('info', 'AddToDepositEvent Called with : %s', JSON.stringify(event))
                const { account, market, commitment, amount, depositId } = event.returnValues;
                const transaction_hash = event.transactionHash;
                await addToDeposit(account, market, commitment, amount, transaction_hash)
            } else {
                console.error(error);
            }
        }
        catch (err) {
            logger.log('error', 'AddToDepositEvent returned Error : %s', JSON.stringify(err))
            console.error(err);
        }
    })
}

////////////////////////////////////////////////////////////////////////
/////////////////////////// LOAN EVENTS ////////////////////////////////
////////////////////////////////////////////////////////////////////////

const NewLoanEvent = (loanContract) => {
    console.log("Listening to NewLoanEvent")
    loanContract.events.NewLoan({}, async (error, event) => {

        try {
            logger.log('info', 'NewLoanEvent Called with : %s', JSON.stringify(event.returnValues))
            console.log( 'NewLoanEvent Called with : %s', JSON.stringify(event.returnValues))
            await createNewUserAccount(event.returnValues.account)
            if (!error) {
                console.log(event.returnValues)
                let loanDetails = event.returnValues;
                const cdr = BigNumber(loanDetails.collateralAmount) / BigNumber(loanDetails.loanAmount);
                if (cdr >= 1) {
                    loanDetails["debtCategory"] = 1;
                } else if (cdr >= 0.5 && cdr < 1) {
                    loanDetails["debtCategory"] = 2;
                } else if (cdr >= 0.333 && cdr < 0.5) {
                    loanDetails["debtCategory"] = 3;
                }
                loanDetails["cdr"] = cdr;
                const { account, loanMarket, commitment, loanAmount, collateralMarket, collateralAmount, debtCategory } = loanDetails;
                const transaction_hash = event.transactionHash;
                await createNewLoan(account, loanMarket, commitment, loanAmount, collateralMarket, collateralAmount, debtCategory, cdr, transaction_hash);
                logger.log('info', 'NewLoanEvent success with : %s', JSON.stringify(loanDetails))
            } else {
                console.error(error);
            }
        }
        catch (err) {
            console.error(err);
            logger.log('error', 'NewLoanEvent returned Error : %s', JSON.stringify(err))
        }
    })
}


const SwapLoanEvent = (libOpenContract) => {
    console.log("Listening to SwapLoan event")
    libOpenContract.events.MarketSwapped({}, async (error, event) => {
        logger.log('info', 'SwapLoanEvent Called with : %s', JSON.stringify(event))

        if (!error) {
            const { account, loanMarket, commitment, currentMarket, amount, isSwapped } = event.returnValues;
            const transaction_hash = event.transactionHash;
            try {
                await updateSwapLoanEventData(account, loanMarket, commitment, currentMarket, amount, isSwapped, transaction_hash);
                logger.log('info', 'updateswaploandata success with : %s', JSON.stringify(event.returnValues))
            } catch (error) {
                console.error(error);
            }
        } else {
            console.error(error);
            logger.log('error', 'SwapLoanEvent returned Error : %s', JSON.stringify(err))
        }
    })
}

const WithdrawPartialLoanDepositEvent = (loanContract) => {
    console.log("Listening to WithdrawPartialLoanDepositEvent event");
    loanContract.events.WithdrawPartialLoan({}, async (error, event) => {
        try {
            if (!error) {
                console.log("****** WithdrawPartialLoan ********")
                logger.log('info', 'WithdrawPartialLoan Called with : %s', JSON.stringify(event.returnValues))
                logger.log('info', 'WithdrawPartialLoan Called with : %s', JSON.stringify(event))

                const { account, amount, market, commitment } = event.returnValues;
                const transaction_hash = event.transactionHash;
                //await createWithdrawalPartialLoan(account, amount, market, commitment, transaction_hash)
            } else {
                console.error(error);
            }
        }
        catch (err) {
            logger.log('error', 'WithdrawPartialLoanDepositEvent returned Error : %s', JSON.stringify(err))
            console.error(err);
        }
    })
}

const RepaidLoanEvent = (loanExtContract) => {
    console.log("Listening to RepaidLoanEvent event");
    loanExtContract.events.LoanRepaid({}, async (error, event) => {
        try {
            if (!error) {
                console.log("****** RepaidLoanEvent ********")
                logger.log('info', 'RepaidLoanEvent Called with : %s', JSON.stringify(event))
                logger.log('info', 'RepaidLoanEvent Called with event.returnValues : %s', JSON.stringify(event.returnValues))
                const { account, market, commitment, amount, repaidAmount } = event.returnValues
                const transaction_hash = event.transactionHash;
                await loanRepaid(account, market, commitment, amount, repaidAmount, transaction_hash)
            } else {
                console.error(error);
            }
        }
        catch (err) {
            logger.log('error', 'RepaidLoanEvent returned Error : %s', JSON.stringify(err))
            console.error(err);
        }
    })
}

const AddCollateralEvent = (partialLoanContract) => {
    console.log("Listening to AddCollateralEvent event");
    partialLoanContract.events.AddCollateral({}, async (error, event) => {
        try {
            if (!error) {
                console.log("****** AddCollateralEvent ********")
                logger.log('info', 'AddCollateralEvent_str Called with : %s', JSON.stringify(event))
                logger.log('info', 'AddCollateralEvent_str Called with event.returnValues : %s', JSON.stringify(event.returnValues))

                const { account, market, commitment, amount } = event.returnValues;
                const transaction_hash = event.transactionHash;
                await createAddCollateralDeposit(account, market, commitment, amount, transaction_hash)
            } else {
                console.error(error);
            }
        }
        catch (err) {
            logger.log('error', 'AddCollateralEvent returned Error : %s', JSON.stringify(err))
            console.error(err);
        }
    })
}

const WithdrawCollateralEvent = (partialLoanContract) => {
    console.log("Listening to WithdrawCollateralEvent event");
    partialLoanContract.events.WithdrawCollateral({}, async (error, event) => {
        try {
            if (!error) {
                console.log("****** WithdrawCollateralEvent ********")
                logger.log('info', 'WithdrawCollateralEvent_str Called with : %s', JSON.stringify(event))
                logger.log('info', 'WithdrawCollateralEvent_str Called with event.returnValues : %s', JSON.stringify(event.returnValues))

                const { account, market, commitment, amount } = event.returnValues;
                const transaction_hash = event.transactionHash;
                //await createWithdrawCollateralDeposit(account, market, commitment, amount, transaction_hash)
            } else {
                console.error(error);
            }
        }
        catch (err) {
            logger.log('error', 'WithdrawCollateralEvent returned Error : %s', JSON.stringify(err))
            console.error(err);
        }
    })
}

const LiquidationEvent = (liquidationContract) => {
    console.log("Listening to LiquidationEvent event");
    liquidationContract.events.Liquidation({}, async (error, event) => {
        try {
            if (!error) {
                console.log("****** LiquidationEvent ********")
                logger.log('info', 'LiquidationEvent Called with : %s', JSON.stringify(event))
                logger.log('info', 'LiquidationEvent Called with event.returnValues : %s', JSON.stringify(event.returnValues))
                const transaction_hash = event.transactionHash;
                // add a event that should be performed on liquidation 
            } else {
                console.error(error);
            }
        }
        catch (err) {
            logger.log('error', 'LiquidationEvent returned Error : %s', JSON.stringify(err))
            console.error(err);
        }
    })
}

module.exports = {
    listenToEvents
}