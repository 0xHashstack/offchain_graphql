// Delete this later


const logger = require('../../src/utils/logger')

// Return type
function triggerLiquidation(){
    
}

// Return type :: Boolean

price = {
    "USDC":"",
    "BNB":"",
    "BTC":""
}

function isLoanToBeLiquidated(price){
    const {
        id: "16c2ec38-aa8e-4793-bbbb-0d0879cd3eaa",
        loan_market: "0x555344542e740000000000000000000000000000000000000000000000000000",
        loan_amount: 300000000000000000000,
        collateral_market: "0x555344542e740000000000000000000000000000000000000000000000000000",
        collateral_amount: 200000000000000000000,
        collateral_current_amount:200000000000000000002,
        borrow_interest:1.2222,
        commitment: "0x636f6d69745f4e4f4e4500000000000000000000000000000000000000000000",
        cdr: 0.66666,
        debt_category: 2,
        current_amount: 300000000000000000000,
        current_market: "0x555344542e740000000000000000000000000000000000000000000000000000",
        is_swapped: false,
        loan_status_id: 2,
        account_address: "f554c8f6-06e6-4386-88b9-59047adb6365"
    }

    if(debt_category===1){
        liquidation_trigger_point = 
    }
    else if(debt_category===2){

    }
    else if(debt_category===3){

    }
    else{
        logger.log('error',"debt_category out of bound");
    }
}