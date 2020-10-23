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
  payload = { name: "TEST" };
  jwt = await blockchainManager.createJWT(identity.did, { ...payload }, signer);
}

beforeEach(async () => {
  initializeBlockchainManager();
  await createJWT();
});

describe("Blockchain JWT", () => {
  it("should match jwt string", () => {
    return blockchainManager.verifyJWT(jwt).then((result) => {
      expect(result.jwt).toEqual(jwt);
    });
  });

  it("should contain the payload", () => {
    return blockchainManager.verifyJWT(jwt).then((result) => {
      expect(result.payload).toEqual(expect.objectContaining(payload));
    });
  });

  it("should have the did as the issuer", () => {
    return blockchainManager.verifyJWT(jwt).then((result) => {
      expect(result.issuer).toEqual(identity.did);
    });
  });

  it("should have the same payload", async () => {
    return blockchainManager.verifyJWT(jwt).then((result) => {
      expect(result.doc).toBeDefined();
    });
  });
});
