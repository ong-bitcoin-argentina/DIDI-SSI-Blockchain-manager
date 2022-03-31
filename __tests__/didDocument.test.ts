/// /////////////////////////////////////////////////////////////////////////////////
// INTEGRATION TESTS:                                                             //
//                                                                                //
// These tests run in real blockchain networks. This feature must be configured   //
// using the PROVIDER_CONFIG object.                                              //
// Each blockchain contract must be already deployed in the belonging network,    //
// and for private networks, the corresponding node must be up and running.       //
// These configuration properties must be added in the .env as described in       //
// the README file of this repository.                                            //
//                                                                                //
// These tests verify the following methods:                                      //
// - resolveDidDocument                                                           //
//                                                                                //
// To run these tests you must have a DELEGATOR DID address and its private key   //
// with some $$$ in it, to execute the transaction and pay the fee.               //
// This info must be added also in the .env file. (check out README file)         //
/// /////////////////////////////////////////////////////////////////////////////////
import { BLOCKCHAIN } from "./constants/Constants";

const { addPrefix } = require("../src/BlockchainManager");
const {
  initializeBlockchainManager,
  createIdentity,
} = require("./utils/utils");

const config = {
  gasPrice: 10000,
  providerConfig: BLOCKCHAIN.PROVIDER_CONFIG,
};

let identity;
let blockchainManager;

/* eslint-disable jest/require-top-level-describe */
/* eslint-disable-next-line jest/no-hooks */
beforeEach(() => {
  identity = createIdentity();
  blockchainManager = initializeBlockchainManager(config);
});

describe("blockchainManager should", () => {
  it("be an instance containing the config", () => {
    expect.assertions(1);
    expect(blockchainManager.config).toBe(config);
  });
});

describe("blockchainManager document DID functions should", () => {
  it("be able to resolve a valid mainnet (did:ethr:) didDocument", async () => {
    expect.assertions(1);
    const resolvedDid = await blockchainManager.resolveDidDocument(
      identity.did
    );
    expect(resolvedDid).toBeDefined();
  });

  it("be able to resolve a valid RSK (did:ethr:rsk) didDocument", async () => {
    expect.assertions(1);
    const network = "rsk:";
    const { did } = identity;
    const rskDid = addPrefix(network, did);
    const resolvedDid = await blockchainManager.resolveDidDocument(rskDid);

    expect(resolvedDid).toBeDefined();
  });

  it("be able to resolve a valid Lacchain (did:ethr:lac) didDocument", async () => {
    expect.assertions(1);
    const network = "lacchain:";
    const { did } = identity;
    const lacDid = addPrefix(network, did);
    const resolvedDid = await blockchainManager.resolveDidDocument(lacDid);
    expect(resolvedDid).toBeDefined();
  });

  it("be able to resolve a valid BFA (did:ethr:bfa) didDocument", async () => {
    expect.assertions(1);
    const network = "bfa:";
    const { did } = identity;
    const bfaDid = addPrefix(network, did);
    const resolvedDid = await blockchainManager.resolveDidDocument(bfaDid);
    expect(resolvedDid).toBeDefined();
  });

  it("have the same did", async () => {
    expect.assertions(1);
    const result = await blockchainManager.resolveDidDocument(identity.did);
    expect(result.publicKey[0].controller).toStrictEqual(identity.did);
  });

  it("not resolve adulterated did", async () => {
    expect.assertions(1);
    const lastColon = identity.did.lastIndexOf(":");
    const didPrefix = identity.did.substring(0, lastColon + 1);
    const didPostfix = identity.did.substring(
      lastColon + 1,
      identity.did.length
    );
    // Shuffle posfix and extract 1 character to make an invalid did
    const adulteratedDid = didPrefix.concat(
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
    try {
      await await blockchainManager.resolveDidDocument(adulteratedDid);
    } catch (e) {
      expect(e.message).toContain("Not a valid ethr DID");
    }
  });
});
