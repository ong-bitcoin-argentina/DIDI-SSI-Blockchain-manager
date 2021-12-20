import Web3 from 'web3';
import { BlockchainManager } from '../src/BlockchainManager';
import { DIDS } from './constants/Constants';

const Constants = require('./constants/Constants');

const options = { from: '0x0d0fa2cd3813412e94597103dbf715c7afb8c038' };
/* eslint-disable no-underscore-dangle */

describe('blockchainManager did getters', () => {
  describe('getDidContract', () => {
    it('get mainnet ethr-did-registry address', async () => {
      expect.assertions(1);
      const web3 = new Web3(
        new Web3.providers.HttpProvider(
          Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[1].rpcUrl,
        ),
      );
      const result = await BlockchainManager.getDidContract(
        options,
        Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[1].registry,
        web3,
      );
      expect(result._address.toLowerCase()).toBe(
        Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[1].registry,
      );
    });

    it('get ropsten ethr-did-registry address', async () => {
      expect.assertions(1);
      const web3 = new Web3(
        new Web3.providers.HttpProvider(
          Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[2].rpcUrl,
        ),
      );
      const result = await BlockchainManager.getDidContract(
        options,
        Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[2].registry,
        web3,
      );
      expect(result._address.toLowerCase()).toBe(
        Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[2].registry,
      );
    });

    it('get rinkeby ethr-did-registry address', async () => {
      expect.assertions(1);
      const web3 = new Web3(
        new Web3.providers.HttpProvider(
          Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[3].rpcUrl,
        ),
      );
      const result = await BlockchainManager.getDidContract(
        options,
        Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[3].registry,
        web3,
      );
      expect(result._address.toLowerCase()).toBe(
        Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[3].registry,
      );
    });

    it('get goerli ethr-did-registry address', async () => {
      expect.assertions(1);
      const web3 = new Web3(
        new Web3.providers.HttpProvider(
          Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[4].rpcUrl,
        ),
      );
      const result = await BlockchainManager.getDidContract(
        options,
        Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[4].registry,
        web3,
      );
      expect(result._address.toLowerCase()).toBe(
        Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[4].registry,
      );
    });

    it('get kovan ethr-did-registry address', async () => {
      expect.assertions(1);
      const web3 = new Web3(
        new Web3.providers.HttpProvider(
          Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[5].rpcUrl,
        ),
      );
      const result = await BlockchainManager.getDidContract(
        options,
        Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[5].registry,
        web3,
      );
      expect(result._address.toLowerCase()).toBe(
        Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[5].registry,
      );
    });

    it('get Lacchain ethr-did-registry address', async () => {
      expect.assertions(1);
      const web3 = new Web3(
        new Web3.providers.HttpProvider(
          Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[6].rpcUrl,
        ),
      );
      const result = await BlockchainManager.getDidContract(
        options,
        Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[6].registry,
        web3,
      );
      expect(result._address).toBe(
        Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[6].registry,
      );
    });

    it('get BFA ethr-did-registry address', async () => {
      expect.assertions(1);
      const web3 = new Web3(
        new Web3.providers.HttpProvider(
          Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[7].rpcUrl,
        ),
      );
      const result = await BlockchainManager.getDidContract(
        options,
        Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[7].registry,
        web3,
      );
      expect(result._address.toLowerCase()).toBe(
        Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[7].registry,
      );
    });
    it.todo('get ethr-did-registry address for all networks');
  });

  describe('getDidAddress', () => {
    it('get address from did with network', async () => {
      expect.assertions(1);
      const result = await BlockchainManager.getDidAddress(DIDS.didWithNetwork);
      expect(result).toBe(DIDS.did);
    });

    it('get address from did without network', async () => {
      expect.assertions(1);
      const result = await BlockchainManager.getDidAddress(
        DIDS.didWithoutNetwork,
      );
      expect(result).toBe(DIDS.did);
    });
  });

  describe('getDidBlockchain', () => {
    it('get blockchain name from did with network', async () => {
      expect.assertions(1);
      const result = await BlockchainManager.getDidBlockchain(
        DIDS.didWithNetwork,
      );
      expect(result).toBe(DIDS.network);
    });

    it('get blockchain name from did without network', async () => {
      expect.assertions(1);
      const result = await BlockchainManager.getDidBlockchain(
        DIDS.didWithoutNetwork,
      );
      expect(result).toBeNull();
    });
  });
});
