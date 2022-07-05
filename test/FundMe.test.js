const { assert, expect } = require("chai")
const { deployments, ethers, getNamedAccounts } = require("hardhat")
const { TASK_ETHERSCAN_VERIFY } = require("hardhat-deploy")
const { developmentChains } = require("../helper-hardhat-config")

// Only run unit test on development chain
!developmentChains.includes(network.name) 
? describe.skip
: describe("FundMe", async function () {
    
    let fundMe
    let deployer
    let mockV3Aggregator
    let sendValue

    beforeEach(async function() {
        // deploy our fundMe contract
        // using hardhat-deploy
        // const accounts = await ethers.getSigners()
        deployer = (await getNamedAccounts()).deployer
        await deployments.fixture(["all"])
        fundMe = await ethers.getContract("FundMe", deployer)
        mockV3Aggregator = await ethers.getContract("MockV3Aggregator")
        sendValue = ethers.utils.parseEther("1") //1 eth
    })

    describe("Constructor", async function() {
        it("Sets the aggregator addresses correctly", async function() {
            const response = await fundMe.getPriceFeed()
            assert.equal(response, mockV3Aggregator.address)
        })
    }) 

    describe("Fund", async function() {
        it("Fails if you dont send enough ETH", async function() {
            // Use of expect because fundMe.fund() is a failed and reversed transaction
            await expect(fundMe.fund()).to.be.revertedWith("You need to spend more ETH")
        })

        it("Updated the amount funded data structure", async function() {
            await fundMe.fund({ value: sendValue })
            const response = await fundMe.getAddressToAmountFunded(deployer)
            assert.equal(response.toString(), sendValue.toString())
        })

        it("Adds funder to array of funders", async function() {
            await fundMe.fund({ value: sendValue })
            const funder  = await fundMe.getFunder(0)
            assert.equal(funder, deployer)
        })
    }) 

    describe("Withdraw", async function() { 

        beforeEach(async function() {
            await fundMe.fund({ value: sendValue })
        })

        it("Withdraws ETH from a single founder", async function() {
            // arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)
            
            // // act
            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            // Get the gas used & effective gas price to get the total Gas cost:
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const totalGasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)
            
            // // assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance), 
                endingDeployerBalance.add(totalGasCost).toString()
            )
        })

        it("Allow us to withdraw with multiple funders", async function() {

            const accounts = await ethers.getSigners()
            
            // start from 1 because the 0 one is the deployer
            for(let i = 1; i < 6 ; i++) {
                // Need to connect the contract with each different address that is not the deployer
                const fundMeConnectedContract = await fundMe.connect(accounts[i])

                // Fund the contract with the account:
                await fundMeConnectedContract.fund({ value: sendValue })
            }

            // Get starting balances:  
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

            // act:

            const transactionResponse = await fundMe.withdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const totalGasCost = gasUsed.mul(effectiveGasPrice)

            // assert
            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance), 
                endingDeployerBalance.add(totalGasCost).toString()
            )

            // check if funders array reset is properly
            await expect(fundMe.getFunder(0)).to.be.reverted

            // check if mappings are updated to cero
            for(i = 1; i<6 ; i++) {
                assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address), 0)
            }
        })

        it("Only allows the owner to withdraw", async function() {
            const accounts = await ethers.getSigners()
            const attacker = accounts[1]
            const attackerConnectedContract = await fundMe.connect(attacker)
            await expect(attackerConnectedContract.withdraw()).to.be.revertedWith("FundMe__NotOwner")

            
        })
    })



    // Cheaper withdraw test
    describe("Cheaper Withdraw Testing...", async function() { 

        beforeEach(async function() {
            await fundMe.fund({ value: sendValue })
        })

        it("Withdraws ETH from a single founder", async function() {
            // arrange
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)
            
            // // act
            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait(1)

            // Get the gas used & effective gas price to get the total Gas cost:
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const totalGasCost = gasUsed.mul(effectiveGasPrice)

            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)
            
            // // assert
            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance), 
                endingDeployerBalance.add(totalGasCost).toString()
            )
        })

        it("Allow us to withdraw with multiple funders", async function() {

            const accounts = await ethers.getSigners()
            
            // start from 1 because the 0 one is the deployer
            for(let i = 1; i < 6 ; i++) {
                // Need to connect the contract with each different address that is not the deployer
                const fundMeConnectedContract = await fundMe.connect(accounts[i])

                // Fund the contract with the account:
                await fundMeConnectedContract.fund({ value: sendValue })
            }

            // Get starting balances:  
            const startingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const startingDeployerBalance = await fundMe.provider.getBalance(deployer)

            // act:

            const transactionResponse = await fundMe.cheaperWithdraw()
            const transactionReceipt = await transactionResponse.wait(1)
            const { gasUsed, effectiveGasPrice } = transactionReceipt
            const totalGasCost = gasUsed.mul(effectiveGasPrice)

            // assert
            const endingFundMeBalance = await fundMe.provider.getBalance(fundMe.address)
            const endingDeployerBalance = await fundMe.provider.getBalance(deployer)

            assert.equal(endingFundMeBalance, 0)
            assert.equal(
                startingFundMeBalance.add(startingDeployerBalance), 
                endingDeployerBalance.add(totalGasCost).toString()
            )

            // check if funders array reset is properly
            await expect(fundMe.getFunder(0)).to.be.reverted

            // check if mappings are updated to cero
            for(i = 1; i<6 ; i++) {
                assert.equal(await fundMe.getAddressToAmountFunded(accounts[i].address), 0)
            }
        })

        it("Only allows the owner to withdraw with cheaper withdraw", async function() {
            const accounts = await ethers.getSigners()
            const attacker = accounts[1]
            const attackerConnectedContract = await fundMe.connect(attacker)
            await expect(attackerConnectedContract.cheaperWithdraw()).to.be.revertedWith("FundMe__NotOwner")

            
        })
    })
})