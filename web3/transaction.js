const Web3 = require("web3");
const { rpcURLs } = require("../constants/constants");

//change web3 to sockets
const getWeb3 = () => {
  var Web3 = require("web3");
  // const web3provider = new Web3(new Web3.providers.WebsocketProvider(rpcURLs["localhost"]));
  const web3provider = new Web3(
    new Web3.providers.WebsocketProvider(rpcURLs["binanceTestnet"])
  );
  return web3provider;
};

const watchEtherTransfers = () => {
  // Instantiate web3 with WebSocket provider
  const web3 = new Web3(
    new Web3.providers.WebsocketProvider(rpcURLs["localhost"])
  );

  // Instantiate subscription object
  const subscription = web3.eth.subscribe("pendingTransactions");

  console.log(subscription, "suscription");
  // Subscribe to pending transactions
  subscription
    .subscribe((error, result) => {
      if (error) console.log(error);
    })
    .on("data", async (txHash) => {
      console.log("txhash", txHash);
      try {
        // Instantiate web3 with HttpProvider
        const web3Http = new Web3(rpcURLs["localhost"]);

        // Get transaction details
        const trx = await web3Http.eth.getTransaction(txHash);
        console.log(trx, "gettransaction");
        const valid = validateTransaction(trx);
        // If transaction is not valid, simply return
        if (!valid) return;

        console.log(
          "Found incoming Ether transaction from " +
            process.env.WALLET_FROM +
            " to " +
            process.env.WALLET_TO
        );
        console.log("Transaction value is: " + process.env.AMOUNT);
        console.log("Transaction hash is: " + txHash + "\n");

        // Initiate transaction confirmation
        confirmEtherTransaction(txHash);

        // Unsubscribe from pending transactions.
        subscription.unsubscribe();
      } catch (error) {
        console.log(error);
      }
    });
};

const estimateGas = (contractObject, method, options, params) => {
  return contractObject.methods[method](...params).estimateGas(options);
};

const sendTransaction = async (diamondAddress, contract, method, ...params) => {
  const address = process.env.ADDRESS;
  const privateKey = process.env.PRIVATEKEY;

  if (!address || !privateKey) {
    throw new Error("Address/Private key not available in environment");
  }

  const web3 = getWeb3();
  web3.eth.accounts.wallet.add(privateKey);
  let tx = contract.methods[method](...params);

  try {
    let gas = await estimateGas(contract, method, { from: address }, params);
    let gasPrice = await web3.eth.getGasPrice();
    let nonce = await web3.eth.getTransactionCount(address);
    let data = tx.encodeABI();
    let txData = {
      from: address,
      to: diamondAddress,
      data: data,
      gas,
      gasPrice,
      nonce,
    };
    const receipt = await web3.eth.sendTransaction(txData);
    return receipt.transactionHash;
  } catch (err) {
    throw err;
  }
};

const getValue = async (contract, method, ...params) => {
  const web3 = getWeb3();
  try {
    let callData = await contract.methods[method](...params).call();
    return callData;
  } catch (err) {
    throw err;
  }
};

module.exports = {
  sendTransaction,
  getWeb3,
  getValue
};
