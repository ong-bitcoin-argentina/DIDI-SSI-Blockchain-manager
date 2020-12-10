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
// - addDelegate                                                                  //
// - validateDelegate                                                             //
// - revokeDelegate                                                               //
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

let blockchainManager;
const issuerIdentity = {
  did: process.env.DELEGATOR_DID,
  privateKey: process.env.DELEGATOR_PRIV_KEY,
};

let delegateIdentity;
let delegateTx;

async function addDelegation(prefixToAdd) {
  const did = delegateIdentity.did;
  const withPrefixDid = addPrefix(prefixToAdd, did);

  delegateTx = await blockchainManager.addDelegate(
    issuerIdentity,
    withPrefixDid,
    1000
  );
  return delegateTx;
}

describe("BlockchainManager Delegation", () => {
  describe("On ANY blochchain should", () => {
    blockchainManager = initializeBlockchainManager(config);
    delegateIdentity = createIdentity();

    it("fail when invalid prefix is received", async () => {
      const prefixToAdd = "invalid:";
      try {
        await addDelegation(prefixToAdd);
      } catch (error) {
        expect(error).toBe("Invalid Provider Prefix");
      }
    });
  });

  describe("On MAINNET should", () => {
    blockchainManager = initializeBlockchainManager(config);
    delegateIdentity = createIdentity();

    it("be able to addDelegate on MAINNET", async () => {
      const prefixToAdd = "";
      await addDelegation(prefixToAdd);

      expect(delegateTx).toBeDefined();
      expect(delegateTx.status).toBeTruthy();
    });

    it("verify delegation on MAINNET", async () => {
      const prefixToAdd = "";
      const prefixAddedDid = addPrefix(prefixToAdd, delegateIdentity.did);
      const validatedDelegate = await blockchainManager.validateDelegate(
        issuerIdentity.did,
        prefixAddedDid
      );
      expect(validatedDelegate).toBeTruthy();
    });

    it("Revoke delegation on MAINNET", async () => {
      const prefixToAdd = "";
      const prefixAddedDid = addPrefix(prefixToAdd, delegateIdentity.did);
      const revokeDelegate = await blockchainManager.revokeDelegate(
        issuerIdentity,
        prefixAddedDid
      );

      expect(revokeDelegate).toBeTruthy();
    });

    it("Fail verification due to revoked delegation on MAINNET", async () => {
      const prefixToAdd = "";
      const prefixAddedDid = addPrefix(prefixToAdd, delegateIdentity.did);
      const validatedDelegate = await blockchainManager.validateDelegate(
        issuerIdentity.did,
        prefixAddedDid
      );

      expect(validatedDelegate).toBeFalsy();
    });

    it("Fail verification when delegation does not exists on MAINNET", async () => {
      const otherIdentity = createIdentity();
      const prefixToAdd = "";
      const prefixAddedDid = addPrefix(prefixToAdd, otherIdentity.did);
      const validatedDelegate = await blockchainManager.validateDelegate(
        issuerIdentity.did,
        prefixAddedDid
      );
      expect(validatedDelegate).toBeFalsy();
    });

    
  });

  describe("On RSK should", () => {
    blockchainManager = initializeBlockchainManager(config);
    delegateIdentity = createIdentity();

    it("be able to addDelegate on RSK", async () => {
      const prefixToAdd = "rsk:";
      const tx = await addDelegation(prefixToAdd);
      expect(delegateTx).toBeDefined();
      expect(delegateTx.status).toBeTruthy();
    });

    it("verify delegation on RSK", async () => {
      const prefixToAdd = "rsk:";
      const prefixAddedDid = addPrefix(prefixToAdd, delegateIdentity.did);
      const validatedDelegate = await blockchainManager.validateDelegate(
        issuerIdentity.did,
        prefixAddedDid
      );
      expect(validatedDelegate).toBeTruthy();
    });

    it("Revoke delegation on RSK", async () => {
      const prefixToAdd = "rsk:";
      const prefixAddedDid = addPrefix(prefixToAdd, delegateIdentity.did);
      const revokeDelegate = await blockchainManager.revokeDelegate(
        issuerIdentity,
        prefixAddedDid
      );

      expect(revokeDelegate).toBeTruthy();
    });

    it("Fail verification due to revoked delegation on RSK", async () => {
      const prefixToAdd = "rsk:";
      const prefixAddedDid = addPrefix(prefixToAdd, delegateIdentity.did);
      const validatedDelegate = await blockchainManager.validateDelegate(
        issuerIdentity.did,
        prefixAddedDid
      );

      expect(validatedDelegate).toBeFalsy();
    });

    it("Fail verification when delegation does not exists on RSK", async () => {
      const otherIdentity = createIdentity();
      const prefixToAdd = "rsk:";
      const prefixAddedDid = addPrefix(prefixToAdd, otherIdentity.did);
      const validatedDelegate = await blockchainManager.validateDelegate(
        issuerIdentity.did,
        prefixAddedDid
      );
      expect(validatedDelegate).toBeFalsy();
    });
  });

  describe("On LACCHAIN should", () => {
    blockchainManager = initializeBlockchainManager(config);
    delegateIdentity = createIdentity();

    it("be able to addDelegate on LACCHAIN", async () => {
      const prefixToAdd = "lacchain:";
      const tx = await addDelegation(prefixToAdd);
      expect(delegateTx).toBeDefined();
      expect(delegateTx.status).toBeTruthy();
    });

    it("verify delegation on LACCHAIN", async () => {
      const prefixToAdd = "lacchain:";
      const prefixAddedDid = addPrefix(prefixToAdd, delegateIdentity.did);
      const validatedDelegate = await blockchainManager.validateDelegate(
        issuerIdentity.did,
        prefixAddedDid
      );
      expect(validatedDelegate).toBeTruthy();
    });

    it("Revoke delegation on LACCHAIN", async () => {
      const prefixToAdd = "lacchain:";
      const prefixAddedDid = addPrefix(prefixToAdd, delegateIdentity.did);
      const revokeDelegate = await blockchainManager.revokeDelegate(
        issuerIdentity,
        prefixAddedDid
      );

      expect(revokeDelegate).toBeTruthy();
    });

    it("Fail verification due to revoked delegation on LACCHAIN", async () => {
      const prefixToAdd = "lacchain:";
      const prefixAddedDid = addPrefix(prefixToAdd, delegateIdentity.did);
      const validatedDelegate = await blockchainManager.validateDelegate(
        issuerIdentity.did,
        prefixAddedDid
      );

      expect(validatedDelegate).toBeFalsy();
    });

    it("Fail verification when delegation does not exists on LACCHAIN", async () => {
      const otherIdentity = createIdentity();
      const prefixToAdd = "lacchain:";
      const prefixAddedDid = addPrefix(prefixToAdd, otherIdentity.did);
      const validatedDelegate = await blockchainManager.validateDelegate(
        issuerIdentity.did,
        prefixAddedDid
      );
      expect(validatedDelegate).toBeFalsy();
    });
  });

  describe("On BFA should", () => {
    blockchainManager = initializeBlockchainManager(config);
    delegateIdentity = createIdentity();

    it("be able to addDelegate on BFA", async () => {
      const prefixToAdd = "bfa:";
      const tx = await addDelegation(prefixToAdd);
      expect(delegateTx).toBeDefined();
      expect(delegateTx.status).toBeTruthy();
    });

    it("verify delegation on BFA", async () => {
      const prefixToAdd = "bfa:";
      const prefixAddedDid = addPrefix(prefixToAdd, delegateIdentity.did);
      const validatedDelegate = await blockchainManager.validateDelegate(
        issuerIdentity.did,
        prefixAddedDid
      );
      expect(validatedDelegate).toBeTruthy();
    });

    it("Revoke delegation on BFA", async () => {
      const prefixToAdd = "bfa:";
      const prefixAddedDid = addPrefix(prefixToAdd, delegateIdentity.did);
      const revokeDelegate = await blockchainManager.revokeDelegate(
        issuerIdentity,
        prefixAddedDid
      );

      expect(revokeDelegate).toBeTruthy();
    });

    it("Fail verification due to revoked delegation on BFA", async () => {
      const prefixToAdd = "bfa:";
      const prefixAddedDid = addPrefix(prefixToAdd, delegateIdentity.did);
      const validatedDelegate = await blockchainManager.validateDelegate(
        issuerIdentity.did,
        prefixAddedDid
      );

      expect(validatedDelegate).toBeFalsy();
    });

    it("Fail verification when delegation does not exists on BFA", async () => {
      const otherIdentity = createIdentity();
      const prefixToAdd = "bfa:";
      const prefixAddedDid = addPrefix(prefixToAdd, otherIdentity.did);
      const validatedDelegate = await blockchainManager.validateDelegate(
        issuerIdentity.did,
        prefixAddedDid
      );
      expect(validatedDelegate).toBeFalsy();
    });
  });
});
