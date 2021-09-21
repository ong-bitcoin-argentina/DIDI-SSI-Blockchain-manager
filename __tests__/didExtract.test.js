import { BlockchainManager } from "../src/BlockchainManager";
import { DIDS } from "./constants/Constants";
import Web3 from "web3";
const Constants = require("./constants/Constants");

const options={ from: "0x0d0fa2cd3813412e94597103dbf715c7afb8c038"};

describe("BlockchainManager did getters", () => {
  // describe("getDidContract", () => {
  //   test.todo("Get ethr-did-registry address for all networks");
  // });
  
  describe("getDidContract", () => {
    test("Get Lacchain ethr-did-registry address", async() => {
      const web3 = new Web3(new Web3.providers.HttpProvider(Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[5].rpcUrl));
      const result = await BlockchainManager.getDidContract(options,Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[5].registry,web3);
      expect(result._address).toBe(Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[5].registry);
    });

    test("Get BFA ethr-did-registry address", async() => {
      const web3 = new Web3(new Web3.providers.HttpProvider(Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[6].rpcUrl));
      const result = await BlockchainManager.getDidContract(options,Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[6].registry,web3);
      expect(result._address.toLowerCase()).toBe(Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[6].registry);
    });

    test("Get mainnet ethr-did-registry address", async() => {
      const web3 = new Web3(new Web3.providers.HttpProvider(Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[0].rpcUrl));
      const result = await BlockchainManager.getDidContract(options,Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[0].registry,web3);
      expect(result._address.toLowerCase()).toBe(Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[0].registry);
    });

    test("Get ropsten ethr-did-registry address", async() => {
      const web3 = new Web3(new Web3.providers.HttpProvider(Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[1].rpcUrl));
      const result = await BlockchainManager.getDidContract(options,Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[1].registry,web3);
      expect(result._address.toLowerCase()).toBe(Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[1].registry);
    });

    test("Get rinkeby ethr-did-registry address", async() => {
      const web3 = new Web3(new Web3.providers.HttpProvider(Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[2].rpcUrl));
      const result = await BlockchainManager.getDidContract(options,Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[2].registry,web3);
      expect(result._address.toLowerCase()).toBe(Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[2].registry);
    });

    test("Get goerli ethr-did-registry address", async() => {
      const web3 = new Web3(new Web3.providers.HttpProvider(Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[3].rpcUrl));
      const result = await BlockchainManager.getDidContract(options,Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[3].registry,web3);
      expect(result._address.toLowerCase()).toBe(Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[3].registry);
    });

    test("Get kovan ethr-did-registry address", async() => {
      const web3 = new Web3(new Web3.providers.HttpProvider(Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[4].rpcUrl));
      const result = await BlockchainManager.getDidContract(options,Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[4].registry,web3);
      expect(result._address.toLowerCase()).toBe(Constants.BLOCKCHAIN.PROVIDER_CONFIG.networks[4].registry);
    });
    
  });

  describe("getDidAddress", () => {
    test("Get address from did with network", async() => {
      const result = await BlockchainManager.getDidAddress(DIDS.didWithNwtwork);
      expect(result).toBe(DIDS.did);
    });
  
    test("Get address from did without network", async() => {
      const result = await BlockchainManager.getDidAddress(DIDS.didWithoutNetwork);
      expect(result).toBe(DIDS.did);
    });
  });
  
  describe("getDidBlockchain", () => {
    test("Get blockchain name from did with network", async() => {
      const result = await BlockchainManager.getDidBlockchain(DIDS.didWithNwtwork);
      expect(result).toBe(DIDS.network);
    });
  
    test("Get blockchain name from did without network", async() => {
      const result = await BlockchainManager.getDidBlockchain(DIDS.didWithoutNetwork);
      expect(result).toBe(null);
   });
  });
});