const logger = require("../../src/utils/logger");

exports.captureMissedDepositEvent = async () => {
    try {
        var current_timestamp_in_second = new Date().getTime() / 1000;
        var initial_timestamp = current_timestamp_in_second - 300;

        let count = 0;
        let flag = 1;
        let timestamp_start = initial_timestamp;
        while (flag && timestamp_start<=current_timestamp_in_second) {
            response_data = await axios.post(SUBGRAPH_RECONCILIATION_URL, {
                query: `
                    {
                        deposits(first: 1000,where: {timestamp_gte: ${timestamp_start}, timestamp_lte: ${current_timestamp_in_second}}, orderBy:  timestamp, orderDirection: asc) {
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
    } catch (error) {
        logger.error('ERROR OCCURRED IN EVENT(createNewLoan): %s', new Error(error))
        throw error;
    }
}
