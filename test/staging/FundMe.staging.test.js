// const { ethers } = require("ethers")
const { getNamedAccounts, network, ethers } = require("hardhat")
const { developmentChains } = require("../../helper-hardhat-config")
const { assert } = require("chai")
// Only run on testnets not in development:
developmentChains.includes(network.name) ? describe.skip :
describe("FundMe", async function() {

    let fundMe
    let deployer
    const sendValue = ethers.utils.parseEther("1")

    beforeEach(async function() {
        deployer = (await getNamedAccounts()).deployer
        fundMe = await ethers.getContract("FundMe", deployer)
    })

    it("allows people to fund and withdraw", async function() {
        await fundMe.fund({ value: sendValue })
        await fundMe.withdraw()
        const endingBalance = await fundMe.provider.getBalance(fundeMe.address)
        assert.equal(endingBalance.toString(), "0")
        
    })
})