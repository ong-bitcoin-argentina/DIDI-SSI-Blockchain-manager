import { BlockchainManager } from '../src/BlockchainManager';
import { DIDS } from './constants/Constants';

describe('__tests__/addBlockchainToDid.test.js', () => {
  it('add blokchain to did without network', async () => {
    expect.assertions(1);
    const result = await BlockchainManager.addBlockchainToDid(
      DIDS.didWithoutNetwork,
      DIDS.network,
    );
    expect(result).toBe(DIDS.didWithNetwork);
  });

  it('add blokchain to did with network', async () => {
    expect.assertions(2);
    try {
      expect(false).toBe(true);
    } catch (e) {
      expect(e.message).toMatch('#blockchainManager-didWithNetwork');
    }
  });
});
