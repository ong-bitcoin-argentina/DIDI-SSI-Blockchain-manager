require("dotenv").config();

const GAS_INCREMENT = process.env.GAS_INCREMENT || "1.1";
const DELEGATE_DURATION = process.env.BLOCKCHAIN_DELEGATE_DURATION || "1300000";
const ATTRIBUTE_VALIDITY =
  process.env.BLOCKCHAIN_ATTRIBUTE_VALIDITY || "1300000";

// ======================================================================================================

const { BLOCKCHAIN_URL_RSK, BLOCKCHAIN_URL_LAC, BLOCKCHAIN_URL_BFA } = process.env;

// uPort SC ON
const { BLOCKCHAIN_CONTRACT_MAIN, BLOCKCHAIN_CONTRACT_LAC, BLOCKCHAIN_CONTRACT_BFA } = process.env;

const { INFURA_KEY } = process.env;
// Provider
// MAINNET SHOULD BE THE FIRST NETWORK
// DID ROUTE EXAMPLE PREFIX:
// MAINNET ==> did:ethr:
// RSK ==> did:ethr:rsk:
// LACCHAIN ==> did:ethr:lacchain:
const PROVIDER_CONFIG = {
  networks: [
    {
      name: "",
      rpcUrl: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
      registry: BLOCKCHAIN_CONTRACT_MAIN,
    },
    {
      name: "mainnet",
      rpcUrl: `https://mainnet.infura.io/v3/${INFURA_KEY}`,
      registry: BLOCKCHAIN_CONTRACT_MAIN,
    },
    {
      name: "ropsten",
      rpcUrl: `https://ropsten.infura.io/v3/${INFURA_KEY}`,
      registry: BLOCKCHAIN_CONTRACT_MAIN,
    },
    {
      name: "rinkeby",
      rpcUrl: `https://rinkeby.infura.io/v3/${INFURA_KEY}`,
      registry: BLOCKCHAIN_CONTRACT_MAIN,
    },
    {
      name: "goerli",
      rpcUrl: `https://goerli.infura.io/v3/${INFURA_KEY}`,
      registry: BLOCKCHAIN_CONTRACT_MAIN,
    },
    {
      name: "kovan",
      rpcUrl: `https://kovan.infura.io/v3/${INFURA_KEY}`,
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
      registry: BLOCKCHAIN_CONTRACT_MAIN,
    },
  ],
};

const CREDENTIALS = {
  types: {
    verifiable: "VerifiableCredential"
  },
  context: "https://www.w3.org/2018/credentials/v1"
};

const DIDS = {
  didWithNetwork:"did:ethr:lacchain:0xdca7ef03e98e0dc2b855be647c39abe984fcf21b",
  didWithoutNetwork:"did:ethr:0xdca7ef03e98e0dc2b855be647c39abe984fcf21b",
  did:"0xdca7ef03e98e0dc2b855be647c39abe984fcf21b",
  network:"lacchain"
}

module.exports = {
  BLOCKCHAIN: {
    DELEGATE_DURATION: DELEGATE_DURATION,
    ATTRIBUTE_VALIDITY: ATTRIBUTE_VALIDITY,
    PROVIDER_CONFIG: PROVIDER_CONFIG,
    GAS_INCREMENT: GAS_INCREMENT
  },
  CREDENTIALS: CREDENTIALS,
  DIDS: DIDS
};
