require("dotenv").config();
require("@nomiclabs/hardhat-ethers");
require("@nomiclabs/hardhat-etherscan");
require("@nomiclabs/hardhat-waffle");
require("hardhat-gas-reporter");
require("solidity-coverage");
require("hardhat-deploy");

// This is a sample Hardhat task. To learn how to create your own go to
// https://hardhat.org/guides/create-task.html
task("accounts", "Prints the list of accounts", async (taskArgs, hre) => {
  const accounts = await hre.ethers.getSigners();

  for (const account of accounts) {
    console.log(account.address);
  }
});

const RINKEBY_URL = process.env.RINKEBY_RPC_URL

module.exports = {
  solidity: {
    compilers: [{ version: "0.8.8"}, { version: "0.6.6" }],
  },
  networks: {
    rinkeby: {
      url: RINKEBY_URL,
      blockConfirmations: 6,
      chainId: 4,
      accounts: [process.env.PRIVATE_KEY],
    },
  },
  etherscan: {
    apiKey: process.env.ETHERSCAN_API_KEY,
  },
  gasReporter: {
    enabled: true,
    outPutFile: "gas-report.txt",
    noColors: true,
    currency: "USD",
    coinmarketcap: process.env.COINMARKET_CAP_KEY || "key",
    token: "ETH",
  },
  namedAccounts: {
    deployer: {
      default: 0
    },
  },
};
