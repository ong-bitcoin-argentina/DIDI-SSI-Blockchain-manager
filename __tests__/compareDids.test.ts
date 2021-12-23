import { BlockchainManager } from '../src/BlockchainManager';
import { DIDS } from './constants/Constants';

describe('compareDid', () => {
  // did:ethr:net1:0x123 != did:ethr:net2:0x123
  it('compare with same did and diferent blockchain', async () => {
    expect.assertions(1);
    const result = await BlockchainManager.compareDid(
      DIDS.didWithNetwork,
      DIDS.otherDidOtherNetwork,
    );
    expect(result).toBe(false);
  });

  // did:ethr:net:0x123 != did:ethr:net:0x124
  it('compare with diferent did and same blockchain', async () => {
    expect.assertions(1);
    const result = await BlockchainManager.compareDid(
      DIDS.didWithNetwork,
      DIDS.otherDidSameNetwork,
    );
    expect(result).toBe(false);
  });

  // did:ethr:net1:0x123 != did:ethr:net2:0x124
  it('compare with diferent did and diferent blockchain', async () => {
    expect.assertions(1);
    const result = await BlockchainManager.compareDid(
      DIDS.didWithNetwork,
      DIDS.otherDidOtherNetwork,
    );
    expect(result).toBe(false);
  });

  // did:ethr:0x123 != did:ethr:0x124
  it('compare with diferent did and without blockchain', async () => {
    expect.assertions(1);
    const result = await BlockchainManager.compareDid(
      DIDS.didWithoutNetwork,
      DIDS.otherDidWithoutNetwork,
    );
    expect(result).toBe(false);
  });

  // did:ethr:net:0x123 == did:ethr:0x123
  it('compare with same did, one with blockchain and one without blockchain', async () => {
    expect.assertions(1);
    const result = await BlockchainManager.compareDid(
      DIDS.didWithNetwork,
      DIDS.didWithoutNetwork,
    );
    expect(result).toBe(true);
  });

  // did:ethr:net:0x123 == did:ethr:net:0x123
  it('compare with same did and same blockchain', async () => {
    expect.assertions(1);
    const result = await BlockchainManager.compareDid(
      DIDS.didWithNetwork,
      DIDS.didWithNetwork,
    );
    expect(result).toBe(true);
  });
});
