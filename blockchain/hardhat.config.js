require("@nomiclabs/hardhat-waffle");
require("hardhat-slither");

const ENDPOINT_URL = vars.get("ENDPOINT_URL");
const PRIVATE_KEY = vars.get("PRIVATE_KEY");

module.exports = {
  solidity: "0.8.21",
  networks: {
    amoy: {
      url: ENDPOINT_URL,
      accounts: [PRIVATE_KEY],
    },
  },
};
