const logger = require("../src/utils/logger");

//////////////////////////////////////////////////////////////////////////
///////////////////// CALL LIQUIDABLE LOANS METHOD ///////////////////////
//////////////////////////////////////////////////////////////////////////

exports.getLiquidadableLoan = async (liquidationContract) => {
  let liquidations = [];
  const INITIAL_INDEX = 1;
  const FINAL_INDEX = 1200;
  for (let i = INITIAL_INDEX; i < FINAL_INDEX; i = i + 10) {
    await liquidationContract.methods.liquidableLoans(i).call((err, result) => {
      console.log("result", result);
      if (result) {
        for (let j = 0; j < 100; j++) {
          if (
            result.loanOwner[j] != "0x0000000000000000000000000000000000000000"
          ) {
            var loanDetail = {
              loan_market: result.loanMarket[j],
              loan_amount: result.loanAmount[j],
              collateral_market: result.collateralMarket[j],
              collateral_amount: result.collateralAmount[j],
              owner_address: result.loanOwner[j],
              commitment: result.loanCommitment[j],
            };
            liquidations.push(loanDetail);
          }
        }

        // getting the unique liquidable loans by filtering laonMarket and Commitment
        const uniqueLiquidableLoans = liquidations.filter(
          (loan, index, self) =>
            index ===
            self.findIndex(
              (t) =>
                t.loanMarket === loan.loanMarket &&
                t.commitment === loan.commitment
            )
        );

        liquidadableLoanData.push(uniqueLiquidableLoans);
      } else {
        logger(
          "info",
          "liquidableLoans returned null value for _indexFrom: %s",
          i
        );
      }
    });
  }
  return liquidadableLoanData;
};
