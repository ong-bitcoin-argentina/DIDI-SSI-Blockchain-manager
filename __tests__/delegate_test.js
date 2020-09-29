import {beforeAll, describe, it} from "@jest/globals";

const {BlockchainManager} = require("../BlockchainManager");
const {TESTS} = require("../Constants");
const {Credentials} = require('uport-credentials');


const BLOCK_CHAIN_URL = "http://45.79.211.34:4444"; // RSK
const BLOCK_CHAIN_CONTRACT = "0xdca7ef03e98e0dc2b855be647c39abe984fcf21b";

const config = {
  gasPrice: 10000,
  providerConfig: {rpcUrl: BLOCK_CHAIN_URL, registry: BLOCK_CHAIN_CONTRACT}
}

let blockchainManager;
const issuerIdentity = {
  did: TESTS.ISSUER_IDENTITY.DID,
  privateKey: TESTS.ISSUER_IDENTITY.PRIV_KEY
}

let delegateIdentity;
let delegateTx;


function initializeBlockchainManager() {
  blockchainManager = new BlockchainManager(config);
}

function createIdentities() {
  delegateIdentity = Credentials.createIdentity();
}

async function addDelegation() {
  delegateTx = await blockchainManager.addDelegate(issuerIdentity, delegateIdentity.did, 1000);
}

describe("BlockchainManager delegation", () => {

  beforeAll(async () => {
    initializeBlockchainManager();
    createIdentities();
    await addDelegation();
  });

  describe("Blockchain addDelegation", () => {
    it('should be able to addDelegate', function () {
      expect(delegateTx).toBeDefined()
      expect(delegateTx.status).toBeTruthy()
    });
  })

  describe("Blockchain validateDelegate", () => {
    it('should return true if the delegation exists', async () => {
      return blockchainManager.validateDelegate(issuerIdentity, delegateIdentity.did).then(result => {
        expect(result).toBeTruthy();
      });
    });

    it('should return false if the delegation doesn\'t exist', async () => {
      const otherIdentity = Credentials.createIdentity();
      return blockchainManager.validateDelegate(issuerIdentity, otherIdentity.did).then(result => {
        expect(result).toBeFalsy();
      });
    });
  })

});