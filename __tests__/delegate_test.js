import { beforeAll, describe, it } from "@jest/globals";

require("dotenv").config();

const { BlockchainManager } = require("../BlockchainManager");
const { Credentials } = require("uport-credentials");

const BLOCK_CHAIN_URL = process.env.BLOCK_CHAIN_URL; // RSK
const BLOCK_CHAIN_CONTRACT = process.env.BLOCK_CHAIN_CONTRACT;

const config = {
  gasPrice: 10000,
  providerConfig: { rpcUrl: BLOCK_CHAIN_URL, registry: BLOCK_CHAIN_CONTRACT },
};

let blockchainManager;
const issuerIdentity = {
  did: process.env.TEST_ISSUER_DID,
  privateKey: process.env.TEST_ISSUER_PRIV_KEY,
};

let delegateIdentity;
let delegateTx;

function initializeBlockchainManager() {
  blockchainManager = new BlockchainManager(config);
}

function createIdentities() {
  delegateIdentity = Credentials.createIdentity();
}

async function addDelegation() {
  delegateTx = await blockchainManager.addDelegate(
    issuerIdentity,
    delegateIdentity.did,
    1000
  );
}

describe("BlockchainManager delegation", () => {
  beforeAll(async () => {
    initializeBlockchainManager();
    createIdentities();
    await addDelegation();
  });

  describe("Blockchain addDelegation", () => {
    it("should be able to addDelegate", function () {
      expect(delegateTx).toBeDefined();
      expect(delegateTx.status).toBeTruthy();
    });
  });

  describe("Blockchain validateDelegate", () => {
    it("should return true if the delegation exists", async () => {
      return blockchainManager
        .validateDelegate(issuerIdentity, delegateIdentity.did)
        .then((result) => {
          expect(result).toBeTruthy();
        });
    });

    it("should return false if the delegation doesn't exist", async () => {
      const otherIdentity = Credentials.createIdentity();
      return blockchainManager
        .validateDelegate(issuerIdentity, otherIdentity.did)
        .then((result) => {
          expect(result).toBeFalsy();
        });
    });
  });
});
