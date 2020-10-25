require("dotenv").config();

const GAS_INCREMENT = process.env.GAS_INCREMENT || "1.1";
const DELEGATE_DURATION = process.env.BLOCKCHAIN_DELEGATE_DURATION || "1300000";
const ATTRIBUTE_VALIDITY =
  process.env.BLOCKCHAIN_ATTRIBUTE_VALIDITY || "1300000";

// ======================================================================================================

const BLOCKCHAIN_URL_MAIN = process.env.BLOCKCHAIN_URL_MAIN; // ETH Rinkeby
const BLOCKCHAIN_URL_RSK = process.env.BLOCKCHAIN_URL_RSK; // RSK
const BLOCKCHAIN_URL_LAC = process.env.BLOCKCHAIN_URL_LAC; // Lacchain
const BLOCKCHAIN_URL_BFA = process.env.BLOCKCHAIN_URL_BFA; // BFA testnet

// uPort SC ON
const BLOCKCHAIN_CONTRACT_MAIN = process.env.BLOCKCHAIN_CONTRACT_MAIN; // MAINNET
const BLOCKCHAIN_CONTRACT_RSK = process.env.BLOCKCHAIN_CONTRACT_RSK; // RSK and Eth
const BLOCKCHAIN_CONTRACT_LAC = process.env.BLOCKCHAIN_CONTRACT_LAC; // Lacchain
const BLOCKCHAIN_CONTRACT_BFA = process.env.BLOCKCHAIN_CONTRACT_BFA; // BFA

// Provider
// MAINNET SHOULD BE THE FIRST NETWORK
// DID ROUTE EXAMPLE PREFIX:
// MAINNET ==> did:ethr:
// RSK ==> did:ethr:rsk:
// LACCHAIN ==> did:ethr:lacchain:
const PROVIDER_CONFIG = {
  networks: [
    {
      name: "mainnet",
      rpcUrl: BLOCKCHAIN_URL_MAIN,
      registry: BLOCKCHAIN_CONTRACT_MAIN,
    },
    {
      name: "lacchain",
      rpcUrl: BLOCKCHAIN_URL_LAC,
      registry: BLOCKCHAIN_CONTRACT_LAC,
    },
    {
      name: "bfa",
      rpcUrl: BLOCKCHAIN_URL_BFA,
      registry: BLOCKCHAIN_CONTRACT_BFA,
    },
    {
      name: "rsk",
      rpcUrl: BLOCKCHAIN_URL_RSK,
      registry: BLOCKCHAIN_CONTRACT_RSK,
    },
  ],
};

module.exports = {
  BLOCKCHAIN: {
    DELEGATE_DURATION: DELEGATE_DURATION,
    ATTRIBUTE_VALIDITY: ATTRIBUTE_VALIDITY,
    PROVIDER_CONFIG: PROVIDER_CONFIG,
    GAS_INCREMENT: GAS_INCREMENT
  },
};
