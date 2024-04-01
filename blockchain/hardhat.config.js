require("@nomiclabs/hardhat-waffle");

const MAINNET_ENDPOINT_URL = vars.has("MAINNET_ENDPOINT_URL") ? vars.get("MAINNET_ENDPOINT_URL") : "";
const MUMBAI_ENDPOINT_URL = vars.has("MUMBAI_ENDPOINT_URL") ? vars.get("MUMBAI_ENDPOINT_URL") : "";
const PRIVATE_KEY = vars.get("PRIVATE_KEY");

module.exports = {
  solidity: "0.8.21",
  networks: {
    mainnet: {
      url: MAINNET_ENDPOINT_URL,
      accounts: [PRIVATE_KEY],
    },
    mumbai: {
      url: MUMBAI_ENDPOINT_URL,
      accounts: [PRIVATE_KEY],
    },
  },
};