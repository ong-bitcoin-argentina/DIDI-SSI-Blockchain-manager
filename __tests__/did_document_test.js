import { beforeEach, describe, it } from "@jest/globals";

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
let identity;

function initializeBlockchainManager() {
  blockchainManager = new BlockchainManager(config);
}

function createIdentity() {
  identity = Credentials.createIdentity();
}

beforeEach(() => {
  initializeBlockchainManager();
  createIdentity();
});

describe("BlockchainManager's did document functions", () => {
  it("should be able to resolve a valid didDocument", function () {
    return blockchainManager.resolveDidDocument(identity.did).then((result) => {
      expect(result).toBeDefined();
    });
  });

  it("should have the same did", function () {
    return blockchainManager.resolveDidDocument(identity.did).then((result) => {
      expect(result.publicKey[0].controller).toEqual(identity.did);
    });
  });

  it("shouldn't resolve adulterated did", function () {
    const lastColon = identity.did.lastIndexOf(":");
    const didPrefix = identity.did.substring(0, lastColon + 1);
    const didPostfix = identity.did.substring(
      lastColon + 1,
      identity.did.length
    );
    // Shuffle posfix and extract 1 character to make an invalid did
    let adulteratedDid = didPrefix.concat(
      "0x",
      didPostfix
        .substring(2)
        .split("")
        .sort(() => {
          return 0.5 - Math.random();
        })
        .join("")
        .substring(1)
    );
    expect.assertions(1);
    return blockchainManager.resolveDidDocument(adulteratedDid).catch((e) => {
      expect(e.message).toContain("Not a valid ethr DID");
    });
  });
});
