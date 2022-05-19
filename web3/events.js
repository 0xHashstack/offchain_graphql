const { diamondAddress } = require("../constants/constants");
const Deposit = require('../blockchain/abis/Deposit.json');
const Loan1 = require('../blockchain/abis/Loan1.json');
const Loan2 = require('../blockchain/abis/Loan2.json');
const Loan = require('../blockchain/abis/Loan.json');
const Liquidator = require('../blockchain/abis/Liquidator.json');
const { getWeb3 } = require("./transaction");
const { default: BigNumber } = require('bignumber.js');
const { Console } = require("winston/lib/winston/transports");
const { createNewUserAccount, createNewDeposit, addToDeposit, createWithdrawalDeposit } = require('./controllers/accountBalance');
const { addLoan, updateSwapLoanEventData, loanRepaid, createAddCollateralDeposit, createWithdrawCollateralDeposit, createWithdrawalPartialLoan } = require('./controllers/loanController'); 
const logger = require("../src/utils/logger");
const db = require('../src/database/db')

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

    NewDepositEvent(depositContract);
    WithdrawalDepositEvent(depositContract);
    AddToDepositEvent(depositContract);
    NewLoanEvent(loanContract1);
    SwapLoanEvent(partialLoanContract);
    WithdrawPartialLoanDepositEvent(partialLoanContract);
    RepaidLoanEvent(loanContract2);
    AddCollateralEvent(partialLoanContract);
    WithdrawCollateralEvent(partialLoanContract);
    LiquidationEvent(liquidationContract)
    return app
}

////////////////////////////////////////////////////////////////////////
//////////////////////// DEPOSIT EVENTS ////////////////////////////////
////////////////////////////////////////////////////////////////////////

let test1 = {
    account: "0x12bdAC56C03FA27687c6f35E60fC36BecB00850e",
    market: "0x",
    commitment: "0x0000000000000000000000000000000000000000000000000000004508c6f500",
    amount: 100000000000000000000000000,
}

let test2 = {
    "account": "0x18740bf6AbeDB6bA75c00EEF866ACc269E437c7e",
    "loanMarket": "0x555344432e740000000000000000000000000000000000000000000000000000",
    "commitment": "0x636f6d69745f4f4e454d4f4e5448000000000000000000000000000000000000",
    "loanAmount": "300000000000",
    "collateralMarket": "0x555344432e740000000000000000000000000000000000000000000000000000",
    "collateralAmount": "200000000000",
    "loanId": "2",
    "feePaid": "300000000",
    "time": "1652860397",
    "debtCategory": 2,
    "cdr": 0.6666666666666666
}

let test3 = {
    "account":"0x18740bf6AbeDB6bA75c00EEF866ACc269E437c7e",
    "id":2,
    "amount":"1234",
    "market":"0x555344432e740000000000000000000000000000000000000000000000000000",
    "commitment":"0x636f6d69745f4f4e454d4f4e5448000000000000000000000000000000000000"
}

let test4 = {
    "account":"0x18740bf6AbeDB6bA75c00EEF866ACc269E437c7e",
    "loanMarket":"0x555344432e740000000000000000000000000000000000000000000000000000",
    "commitment":"0x636f6d69745f4f4e454d4f4e5448000000000000000000000000000000000000",
    "isSwapped":true,
    "currentMarket":"0x555344542e740000000000000000000000000000000000000000000000000000",
    "amount": 23233
}


const NewDepositEvent = (depositContract) => {
    console.log("Listening to NewDeposit event");
    depositContract.events.NewDeposit({}, async (error, event) => {
        try {
            createNewUserAccount(event.returnValues.account)
            if (!error) {
                console.log("******** NEW DEPOSIT EVENT ********",event.returnValues)
                logger.log('info', 'NewDepositEvent event.returnValues Called with : %s', JSON.stringify(event.returnValues))
                logger.log('info', 'NewDepositEvent Called with : %s', JSON.stringify(event))
                await createNewDeposit(event.returnValues)
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
                logger.log('info','WithdrawalDepositEvent event.returnValues with : %s', JSON.stringify(event.returnValues))
                logger.log('info','WithdrawalDepositEvent event with : %s', JSON.stringify(event))
                await createWithdrawalDeposit(event.returnValues) 
            } else {
                console.error(error);
            }
        }
        catch (err) {
            logger.log('error','WithdrawalDepositEvent event returned Error : %s', JSON.stringify(err))
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
                await addToDeposit(event.returnValues)
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
            await createNewUserAccount(event.returnValues.account)
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
                await addLoan(loanDetails);
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
            const { account, loanMarket, commitment, currentMarket, amount, isSwapped } = event.returnValues;
            
            try {
                await updateSwapLoanEventData(account, loanMarket, commitment, currentMarket, amount, isSwapped);
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
                logger.log('info','WithdrawPartialLoan Called with : %s', JSON.stringify(event.returnValues))
                logger.log('info','WithdrawPartialLoan Called with : %s', JSON.stringify(event))
                await createWithdrawalPartialLoan(event.returnValues)
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
                await loanRepaid(event.returnValues)
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
                
                await createAddCollateralDeposit(event.returnValues) //
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

const WithdrawCollateralEvent = (partialLoanContract) => {
    console.log("Listening to WithdrawCollateralEvent event");
    partialLoanContract.events.WithdrawCollateral({}, async (error, event) => {
        try {
            if (!error) {
                console.log("****** WithdrawCollateralEvent ********")
                logger.log('info','WithdrawCollateralEvent_str Called with : %s', JSON.stringify(event))
                logger.log('info','WithdrawCollateralEvent_str Called with event.returnValues : %s', JSON.stringify(event.returnValues))
                await createWithdrawCollateralDeposit(event.returnValues)
            } else {
                console.error(error);
            }
        }
        catch (err) {
            logger.log('error','WithdrawCollateralEvent returned Error : %s', JSON.stringify(err))
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
                logger.log('info','LiquidationEvent_str Called with : %s', JSON.stringify(event))
                logger.log('info','LiquidationEvent_str Called with event.returnValues : %s', JSON.stringify(event.returnValues))
                // add a event that should be performed on liquidation 
            } else {
                console.error(error);
            }
        }
        catch (err) {
            logger.log('error','WithdrawCollateralEvent returned Error : %s', JSON.stringify(err))
            console.error(err);
        }
    })
}

module.exports = {
    listenToEvents
}