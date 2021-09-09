import { BlockchainManager } from "../src/BlockchainManager";
import { DIDS } from "./constants/Constants";
const Constants = require("./constants/Constants");


describe("BlockchainManager did getters", () => {
  describe("getDidContract", () => {
    test.todo("Get Lacchain ethr-did-registry address");
    test.todo("Get BFA ethr-did-registry address");
    test.todo("Get mainnet ethr-did-registry address");
    test.todo("Get ropsten ethr-did-registry address");
    test.todo("Get rinkeby ethr-did-registry address");
    test.todo("Get goerli ethr-did-registry address");
    test.todo("Get kovan ethr-did-registry address");
    test.todo("Get ethr-did-registry address for all networks");
  });

  describe("getDidAddress", () => {
    test("Get address from did with network", async() => {
      const resul = await BlockchainManager.getDidAddress(DIDS.didWithNwtwork);
      expect(resul).toBe(DIDS.did);
    });
  
    test("Get address from did without network", async() => {
      const resul = await BlockchainManager.getDidAddress(DIDS.didWithoutNetwork);
      expect(resul).toBe(DIDS.did);
    });
  });
  
  describe("getDidBlockchain", () => {
    test("Get blockchain name from did with network", async() => {
      const resul = await BlockchainManager.getDidBlockchain(DIDS.didWithNwtwork);
      expect(resul).toBe(DIDS.network);
    });
  
    test("Get blockchain name from did without network", async() => {
      const resul = await BlockchainManager.getDidBlockchain(DIDS.didWithoutNetwork);
      expect(resul).toBe(null);
   });
  });
});