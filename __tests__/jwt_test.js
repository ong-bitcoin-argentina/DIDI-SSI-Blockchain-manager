const Constants = require('./constants/Constants');
const { BlockchainManager } = require("../src/BlockchainManager");
const { Credentials } = require('uport-credentials');

const config = {
  gasPrice: 10000,
  providerConfig: Constants.BLOCKCHAIN.PROVIDER_CONFIG,
};

let blockchainManager;
let jwt;
let payload;
let signer;
let identity;

function initializeBlockchainManager() {
  blockchainManager = new BlockchainManager(config);
}

async function createJWT() {
  identity = Credentials.createIdentity();
  signer = blockchainManager.getSigner(identity.privateKey);
  payload = { name: 'TEST' };
  jwt = await blockchainManager.createJWT(identity.did, identity.privateKey, { ...payload });
}

beforeEach(async () => {
  initializeBlockchainManager();
  await createJWT();
});

describe('Blockchain JWT', () => {
  it('should match jwt string', async  () => {
    const result = await blockchainManager.verifyJWT(jwt);
    expect(result.jwt).toEqual(jwt);
  });

  it('should contain the payload', async () => {
    const result = await blockchainManager.verifyJWT(jwt);
    expect(result.payload).toEqual(expect.objectContaining(payload));
  });

  it('should have the did as the issuer', async () => {
    const result = await blockchainManager.verifyJWT(jwt);
    expect(result.issuer).toEqual(identity.did);
  });

  it('should have the same payload', async () => {
    const result = await blockchainManager.verifyJWT(jwt);
    expect(result.doc).toBeDefined();    
  });
});
