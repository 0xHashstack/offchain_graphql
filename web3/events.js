const { diamondAddress } = require("./constants/constant");
const Diamond = require('../blockchain/abis/LibDiamond.json');
const Deposit = require('../blockchain/abis/Deposit.json');
const LoanExt = require('../blockchain/abis/LoanExt.json');
const Loan = require('../blockchain/abis/Loan.json');
const LibOpen = require('../blockchain/abis/LibOpen.json');
const { getWeb3 } = require("./transaction");
const { default: BigNumber } = require('bignumber.js');
const { Console } = require("winston/lib/winston/transports");
const { createNewDeposit, addToDeposit, createWithdrawalDeposit } = require('./controllers/accountBalance');
const { addLoan, updateSwapLoanEventData, loanRepaid, createAddCollateralDeposit, createWithdrawalPartialLoan } = require('./controllers/loanController');
const logger = require("../src/utils/logger");

const listenToEvents = (app) => {
    const web3 = getWeb3();
    let depositContract = new web3.eth.Contract(
        Deposit,
        diamondAddress
    )
    let loanContract = new web3.eth.Contract(
        LoanExt,
        diamondAddress
    )
    let libOpenContract = new  web3.eth.Contract(
        LibOpen,
        diamondAddress
    )
    let partialLoanContract = new web3.eth.Contract(
        Loan,
        diamondAddress
    )

    NewDepositEvent(depositContract);
    WithdrawalDepositEvent(depositContract);
    AddToDepositEvent(depositContract);
    NewLoanEvent(loanContract);
    SwapLoanEvent(libOpenContract);
    WithdrawPartialLoanDepositEvent(partialLoanContract);
    RepaidLoanEvent(loanContract);
    AddCollateralEvent(partialLoanContract);
    return app
}

////////////////////////////////////////////////////////////////////////
//////////////////////// DEPOSIT EVENTS ////////////////////////////////
////////////////////////////////////////////////////////////////////////

const NewDepositEvent = (depositContract) => {
    console.log("Listening to NewDeposit event");
    depositContract.events.NewDeposit({}, async (error, event) => {
        try {
            if (!error) {
                console.log("******** NEW DEPOSIT EVENT ********",event.returnValues)
                logger.log('info', 'NewDepositEvent_str Called with : %s', JSON.stringify(event))
                //await createNewDeposit(event.returnValues)
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
    depositContract.events.Withdrawal({}, async (error, event) => {
        try {
            if (!error) {
                console.log("****** WITHDRAW DEPOSIT EVENT ********")
                console.log(event.returnValues)
                logger.log('info','NewDepositEvent_str Called with : %s', JSON.stringify(event))
                //await createWithdrawalDeposit(event.returnValues) //
            } else {
                console.error(error);
            }
        }
        catch (err) {
            logger.log('error','NewDepositEvent returned Error : %s', JSON.stringify(err))
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
                logger.log('info','AddToDepositEvent Called with : %s', JSON.stringify(event))
                //await addToDeposit(event.returnValues)
            } else {
                console.error(error);
            }
        }
        catch (err) {
            logger.log('error','AddToDepositEvent returned Error : %s', JSON.stringify(err))
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
            logger.log('info','NewLoanEvent Called with : %s', JSON.stringify(event.returnValues))
            if (!error) {
                console.log(event.returnValues)
                let loanDetails = event.returnValues;
                let cdr = BigNumber(loanDetails.collateralAmount) / BigNumber(loanDetails.loanAmount);
                if (cdr >= 1) {
                    loanDetails["debtCategory"] = 1;
                } else if (cdr >= 0.5 && cdr < 1) {
                    loanDetails["debtCategory"] = 2;
                } else if (cdr >= 0.333 && cdr < 0.5) {
                    loanDetails["debtCategory"] = 3;
                }
                loanDetails["cdr"] = cdr;
                //await addLoan(loanDetails);
                logger.log('info','NewLoanEvent success with : %s', JSON.stringify(loanDetails))
            } else {
                console.error(error);
            }
        }
        catch (err) {
            console.error(err);
            logger.log('error','NewLoanEvent returned Error : %s', JSON.stringify(err))
        }
    })
}


const SwapLoanEvent = (libOpenContract) => {
    console.log("Listening to SwapLoan event")
    libOpenContract.events.MarketSwapped({}, async (error, event) => {
        logger.log('info','SwapLoanEvent Called with : %s', JSON.stringify(event))

        if (!error) {
            const { account, loanMarket, commitment, currentMarket, currentAmount, isSwapped } = event.returnValues;
            
            try {
                const accountData = await db.select('*').from('accounts').join('whitelist_status_lookup', 'whitelist_status_lookup.whitelist_status_id', '=', 'accounts.whitelist_status_id').where({ address: account }).first()
                const loan = await db.select('*').from('loans').where({account_id: accountData.account_id, loan_market:loanMarket, commitment:commitment})
                //await updateSwapLoanEventData(loan.loan_id, account, currentMarket, currentAmount, isSwapped);
            } catch (error) {
                console.error(error);
            }
        } else {
            console.error(error);
            logger.log('error','SwapLoanEvent returned Error : %s', JSON.stringify(err))
        }
    })
}

const WithdrawPartialLoanDepositEvent = (loanContract) => {
    console.log("Listening to WithdrawPartialLoanDepositEvent event"); 
    loanContract.events.WithdrawPartialLoan({}, async (error, event) => {
        try {
            if (!error) {
                console.log("****** WithdrawPartialLoan ********")
                console.log(event.returnValues)
                logger.log('info','WithdrawPartialLoan Called with : %s', JSON.stringify(event))
                //await createWithdrawalPartialLoan(event.returnValues)
            } else {
                console.error(error);
            }
        }
        catch (err) {
            logger.log('error','WithdrawPartialLoanDepositEvent returned Error : %s', JSON.stringify(err))
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
                logger.log('info','RepaidLoanEvent Called with : %s', JSON.stringify(event))
                logger.log('info','RepaidLoanEvent Called with event.returnValues : %s', JSON.stringify(event.returnValues))
                //await loanRepaid(event.returnValues)
            } else {
                console.error(error);
            }
        }
        catch (err) {
            logger.log('error','RepaidLoanEvent returned Error : %s', JSON.stringify(err))
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
                logger.log('info','AddCollateralEvent_str Called with : %s', JSON.stringify(event))
                logger.log('info','AddCollateralEvent_str Called with event.returnValues : %s', JSON.stringify(event.returnValues))
                
                //await createAddCollateralDeposit(event.returnValues) //
            } else {
                console.error(error);
            }
        }
        catch (err) {
            logger.log('error','AddCollateralEvent returned Error : %s', JSON.stringify(err))
            console.error(err);
        }
    })
}

module.exports = {
    listenToEvents
}