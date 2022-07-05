const { run } = require("hardhat")

//Verify on etherscan:
async function verify(contractAddress, args) {
    console.log("VERIFIYNG CONTRACT...");
    
    try {
      await run("verify:verify", {
        address: contractAddress,
        constructorArguments: args,
      })  
    } catch(e) {
      if (e.message.toLowerCase().includes("already verified")) {
        console.log("ALready verified")
      } else {
        console.log(e)
      }
    }
  }

  module.exports = { verify }