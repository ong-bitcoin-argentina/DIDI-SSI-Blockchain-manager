const Web3 = require("web3");
const Constants = require("./constants/Constants");
const { initializeBlockchainManager } = require("./utils/utils");

const syncingIsFalse = (() => false);
const syncingIsTrue = (() => ({ startingBlock: 1906617, currentBlock: 1906633, highestBlock: 1910400}));

const config = {
  gasPrice: 10000,
  providerConfig: Constants.BLOCKCHAIN.PROVIDER_CONFIG,
};

describe("isSynced method", () => {
  describe("Mock sincronizando", () => {
    const blockchainManager = initializeBlockchainManager(config);
    const web3 = new Web3( Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[0].rpcUrl);
    web3.eth.isSyncing = jest.fn(syncingIsTrue)
    test("Should throw when node is syncing", async () => {
      try {
        await blockchainManager.onlySynced(web3);
        expect(false).toBeTruthy();
      }catch (e) {
        expect(e.message).toMatch('#blockchainManager-nodeIsSyncing')
      }
    })
  });
  
  describe("Mock sincronizando", () => {
    const blockchainManager = initializeBlockchainManager(config);
    const web3 = new Web3( Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[0].rpcUrl);
    web3.eth.isSyncing = jest.fn(syncingIsFalse);
    test("should not throw when node is synced", async () => {
      try {
        await blockchainManager.onlySynced(web3);
      }catch (e) {
        console.log(e);
        expect(false).toBeTruthy();
      }
    })
  });

});