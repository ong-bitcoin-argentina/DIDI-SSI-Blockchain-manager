////////////////////////////////////////////////////////////////////////////////////
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
////////////////////////////////////////////////////////////////////////////////////


const Constants = require("./constants/Constants");
const { addPrefix } = require("../src/BlockchainManager");
const {
  initializeBlockchainManager,
  createIdentity,
} = require("./utils/utils");

const config = {
  gasPrice: 10000,
  providerConfig: Constants.BLOCKCHAIN.PROVIDER_CONFIG,
};

let identity;
let blockchainManager;

beforeEach(() => {
  identity = createIdentity();
  blockchainManager = initializeBlockchainManager(config);
});

describe("BlockchainManager should", () => {
  it("be an instance containing the config", function () {
    expect(blockchainManager.config).toBe(config);
  });
});

describe("BlockchainManager document DID functions should", () => {
  it("be able to resolve a valid mainnet (did:ethr:) didDocument", async () => {
    const resolvedDid = await blockchainManager.resolveDidDocument(
      identity.did
    );
    expect(resolvedDid).toBeDefined();
  });

  it("be able to resolve a valid RSK (did:ethr:rsk) didDocument", async () => {
    const network = "rsk:";
    const did = identity.did;
    const rskDid = addPrefix(network, did);
    const resolvedDid = await blockchainManager.resolveDidDocument(rskDid);

    expect(resolvedDid).toBeDefined();
  });

  it("be able to resolve a valid Lacchain (did:ethr:lac) didDocument", async () => {
    const network = "lacchain:";
    const did = identity.did;
    const lacDid = addPrefix(network, did);
    const resolvedDid = await blockchainManager.resolveDidDocument(lacDid);
    expect(resolvedDid).toBeDefined();
  });

  it("be able to resolve a valid BFA (did:ethr:bfa) didDocument", async () => {
    const network = "bfa:";
    const did = identity.did;
    const bfaDid = addPrefix(network, did);
    const resolvedDid = await blockchainManager.resolveDidDocument(bfaDid);
    expect(resolvedDid).toBeDefined();
  });

  it("have the same did", function () {
    return blockchainManager.resolveDidDocument(identity.did).then((result) => {
      expect(result.publicKey[0].controller).toEqual(identity.did);
    });
  });

  it("not resolve adulterated did", function () {
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
