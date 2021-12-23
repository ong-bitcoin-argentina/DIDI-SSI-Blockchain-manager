const Web3 = require('web3');
const Constants = require('./constants/Constants');
const { initializeBlockchainManager } = require('./utils/utils');

const syncingIsFalse = () => false;
const syncingIsTrue = () => ({
  startingBlock: 1906617,
  currentBlock: 1906633,
  highestBlock: 1910400,
});

const config = {
  gasPrice: 10000,
  providerConfig: Constants.BLOCKCHAIN.PROVIDER_CONFIG,
};

describe('isSynced method', () => {
  describe('mock sincronizando', () => {
    const blockchainManager = initializeBlockchainManager(config);
    const web3 = new Web3(
      Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[0].rpcUrl,
    );
    jest.spyOn(web3.eth, 'isSyncing').mockImplementation(syncingIsTrue);
    it('should throw when node is syncing', async () => {
      expect.assertions(2);
      try {
        await blockchainManager.onlySynced(web3);
        expect(false).toBeTruthy();
      } catch (e) {
        expect(e.message).toMatch('#blockchainManager-nodeIsSyncing');
      }
    });
  });

  describe('mock sincronizando v2', () => {
    const blockchainManager = initializeBlockchainManager(config);
    const web3 = new Web3(
      Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[0].rpcUrl,
    );
    jest.spyOn(web3.eth, 'isSyncing').mockImplementation(syncingIsFalse);
    it('should not throw when node is synced', async () => {
      expect.assertions(1);
      try {
        await blockchainManager.onlySynced(web3);
      } catch (e) {
        expect(false).toBeTruthy();
      }
    });
  });
});
