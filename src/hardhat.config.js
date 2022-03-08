require("@nomiclabs/hardhat-waffle")
require('solidity-coverage')
const fs = require('fs')
const privateKey = fs.readFileSync(".secret").toString().trim() // || "01234567890123456789"

module.exports = {
  defaultNetwork: "hardhat",
  networks: {
      hardhat: {
        chainId: 1337
      },
      mumbai: {
        // local infura
        url: "https://polygon-mumbai.infura.io/v3/ad10f433b3fd4f84a55260f7cf5f97fd",
        accounts: ['8246208bf7f17d75728635eac1d57c52b3506c1ab222c23427339ecd48c6f929']

        // polygon mumbai testnet
        // url: "https://rpc-mumbai.maticvigil.com",
        // accounts: [privateKey]
      }
      },
  solidity: {
    version: "0.8.4",
    settings: {
      optimizer: {
        enabled: true,
        runs: 200
      }
    }
  }
}
