import { BlockchainManager } from "../src/BlockchainManager";
import { DIDS } from "./constants/Constants";

describe("__tests__/removeBlockchainFromDid.test.ts", () => {
  test("Remove blokchain from did without network", async() => {
    const result = await BlockchainManager.removeBlockchainFromDid(DIDS.didWithoutNetwork);
    expect(BlockchainManager.getDidBlockchain(result)).toBeNull();
  });

  test("Remove blokchain from did with network", async() => {
    const result = await BlockchainManager.removeBlockchainFromDid(DIDS.didWithNetwork);
    expect(BlockchainManager.getDidBlockchain(result)).toBeNull();
  });
});