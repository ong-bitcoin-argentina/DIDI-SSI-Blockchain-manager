import { BlockchainManager } from '../src/BlockchainManager';
import { DIDS } from './constants/Constants';

describe('__tests__/removeBlockchainFromDid.test.ts', () => {
  it('remove blokchain from did without network', async () => {
    expect.assertions(1);
    const result = await BlockchainManager.removeBlockchainFromDid(
      DIDS.didWithoutNetwork,
    );
    expect(BlockchainManager.getDidBlockchain(result)).toBeNull();
  });

  it('remove blokchain from did with network', async () => {
    expect.hasAssertions();
    const result = await BlockchainManager.removeBlockchainFromDid(
      DIDS.didWithNetwork,
    );
    expect(BlockchainManager.getDidBlockchain(result)).toBeNull();
  });
});
