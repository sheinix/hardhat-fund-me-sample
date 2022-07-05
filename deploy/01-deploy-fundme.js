//imports
//main function
//calling of main function

const { deployments, network } = require("hardhat")
const { networkConfig, developmentChains } = require("../helper-hardhat-config")
const { verify } = require("../utils/verify")

// function deployFunc() {
//     console.log("Hi")
// }

// module.exports.defauls = deployFunc()

module.exports = async ({ getNamedAccounts, deployment }) => {
    const { deploy, log } = deployments
    const { deployer } = await getNamedAccounts()
    const chainId = network.config.chainId

    // Get the eth/usd price feed address from the corresponding chain:
    // const ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    let ethUsdPriceFeedAddress
    if (developmentChains.includes(network.name)) {
        const ethUsdAggregator = await deployments.get("MockV3Aggregator")
        ethUsdPriceFeedAddress = ethUsdAggregator.address
    } else {
        ethUsdPriceFeedAddress = networkConfig[chainId]["ethUsdPriceFeed"]
    }

    console.log(`eth usd price feed: ${ethUsdPriceFeedAddress}`)
    // if contract doesnt existe deploy minimal version of it for our local testing

    // going for locahost or hardhat network we want to use a mock

    // what happen when we want to change chains?
    const fundMe = await deploy("FundMe", {
        from: deployer,
        args: [ethUsdPriceFeedAddress], // put price feed address
        log: true,
        waitConfirmations: network.config.blockConfirmations || 1,
    })

    const args = [ethUsdPriceFeedAddress]

    // if(!developmentChains.includes(network.name) && process.env.ETHERSCAN_API_KEY) {
    //     await verify(fundMe.address, args)
    // }

    log("----------------")
}

module.exports.tags = ["all", "fundme"]