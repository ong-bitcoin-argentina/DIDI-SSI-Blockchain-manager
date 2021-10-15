import { BlockchainManager } from "../src/BlockchainManager";
import { DIDS } from "./constants/Constants";

 describe("compareDid ", () => {
   // did:ethr:net1:0x123 != did:ethr:net2:0x123
    test("Compare with same did and diferent blockchain", async() => {
      const result = await BlockchainManager.compareDid(DIDS.didWithNetwork, DIDS.otherDidOtherNetwork);
      expect(result).toBe(false);
    });

    //did:ethr:net:0x123 != did:ethr:net:0x124
    test("Compare with diferent did and same blockchain", async() => {
        const result = await BlockchainManager.compareDid(DIDS.didWithNetwork, DIDS.otherDidSameNetwork);
        expect(result).toBe(false);
      });

      //did:ethr:net1:0x123 != did:ethr:net2:0x124 
      test("Compare with diferent did and diferent blockchain", async() => {
        const result = await BlockchainManager.compareDid(DIDS.didWithNetwork, DIDS.otherDidOtherNetwork);
        expect(result).toBe(false);
      });

      //did:ethr:0x123 != did:ethr:0x124
      test("Compare with diferent did and without blockchain", async() => {
        const result = await BlockchainManager.compareDid(DIDS.didWithoutNetwork, DIDS.otherDidWithoutNetwork);
        expect(result).toBe(false);
      });

      //did:ethr:net:0x123 == did:ethr:0x123
      test("Compare with same did, one with blockchain and one without blockchain", async() => {
        const result = await BlockchainManager.compareDid(DIDS.didWithNetwork, DIDS.didWithoutNetwork);
        expect(result).toBe(true);
      });

      //did:ethr:net:0x123 == did:ethr:net:0x123
      test("Compare with same did and same blockchain", async() => {
        const result = await BlockchainManager.compareDid(DIDS.didWithNetwork, DIDS.didWithNetwork);
        expect(result).toBe(true);
      });
  });