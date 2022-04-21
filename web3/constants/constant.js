const rpcURLs = {
    "localhost":"ws://localhost:8545",
    "infuraKovan": "https://kovan.infura.io/v3/99b8947af7e14278ae235bb21eb81f53",
    "infuraRopsten": "wss://ropsten.infura.io/ws/v3/84787fdf8ce842f0a2c41131de1ef5e9",
    "binanceTestnet": "wss://ws-nd-400-266-190.p2pify.com/1efac602169fba8d5bf0589315ec436a"
}

const diamondAddress = "0x182ba4ad94140fa1fc0778a86f39c9d9d6682dce";

const chain = "0x61"

const symbols = {
    "0x555344542e740000000000000000000000000000000000000000000000000000": "USDT.t",
    "0x555344432e740000000000000000000000000000000000000000000000000000": "USDC.t",
    "0x4254432e74000000000000000000000000000000000000000000000000000000": "BTC.t",
    "0x57424e4200000000000000000000000000000000000000000000000000000000": "BNB",
}

const commitmentHash = {
    "0x636f6d69745f4e4f4e4500000000000000000000000000000000000000000000": "NONE",
    "0x636f6d69745f54574f5745454b53000000000000000000000000000000000000": "TWOWEEKS",
    "0x636f6d69745f4f4e454d4f4e5448000000000000000000000000000000000000": "ONEMONTH",
    "0x636f6d69745f54485245454d4f4e544853000000000000000000000000000000": "THREEMONTHS"
}

const APYFromHash = {
    "0x636f6d69745f4e4f4e4500000000000000000000000000000000000000000000": 7.8,
    "0x636f6d69745f54574f5745454b53000000000000000000000000000000000000": 10,
    "0x636f6d69745f4f4e454d4f4e5448000000000000000000000000000000000000": 15,
    "0x636f6d69745f54485245454d4f4e544853000000000000000000000000000000": 18
}

const APYFromString = {
    "NONE": 7.8,
    "TWOWEEKS": 10,
    "ONEMONTH": 15,
    "THREEMONTHS": 18
}

const decimalBasedOnMarket = {
    "USDT.t": 18,
    "USDC.t": 18,
    "BTC.t": 8,
    "BNB": 18
}

const decimalBasedOnMarketHash = {
    "0x555344542e740000000000000000000000000000000000000000000000000000": 18,
    "0x555344432e740000000000000000000000000000000000000000000000000000": 18,
    "0x4254432e74000000000000000000000000000000000000000000000000000000": 8,
    "0x57424e4200000000000000000000000000000000000000000000000000000000": 18
}

const epochLength = 3

// const CT_WHITELISTING=259200000

const CT_WHITELISTING=604800000

module.exports = {
    rpcURLs,
    diamondAddress,
    chain,
    symbols,
    commitmentHash,
    APYFromHash,
    APYFromString,
    epochLength,
    decimalBasedOnMarket,
    decimalBasedOnMarketHash,
    CT_WHITELISTING
}
