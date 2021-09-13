import { BlockchainManager } from "../src/BlockchainManager";
import { DIDS } from "./constants/Constants";

describe("__tests__/addBlockchainToDid.test.js", () => {
  test("Add blokchain to did without network", async() => {
    const result = await BlockchainManager.addBlockchainToDid(DIDS.didWithoutNetwork, DIDS.network);
    expect(result).toBe(DIDS.didWithNwtwork);
  });

  test("Add blokchain to did with network", async() => {
    try {
      const resul = await BlockchainManager.addBlockchainToDid(DIDS.didWithNwtwork, DIDS.network);
      expect(false).toBe(true);
    } catch (e){
      expect(e.message).toMatch('#blockchainManager-didWithNetwork')
    }

  });
});