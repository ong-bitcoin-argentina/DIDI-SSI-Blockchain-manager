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

const blockchainManager = initializeBlockchainManager(config);

const issuerIdentity = {
  did: process.env.DELEGATOR_DID,
  privateKey: process.env.DELEGATOR_PRIV_KEY,
};


async function addDelegation(prefixToAdd, delegateIdentity) {
  const did = delegateIdentity.did;
  const withPrefixDid = addPrefix(prefixToAdd, did);

  const delegateTx = await blockchainManager.addDelegate(
    issuerIdentity,
    withPrefixDid,
    1000
  );
  return delegateTx;
}

describe("BlockchainManager Delegation", () => {
  describe("On ANY blochchain should", () => {
    const delegateIdentity = createIdentity();
    it("be able to addDelegate on all networks", async () => {
      const prefixToAdd = "";
      const delegateTxs = await addDelegation(prefixToAdd, delegateIdentity);
      expect(delegateTxs.some(tx => tx.status = 'fulfilled' && tx.value )).toBeTruthy();
    });

    it("fail when invalid prefix is received", async () => {
      const prefixToAdd = "invalid:";
      try {
        await addDelegation(prefixToAdd, delegateIdentity);
      } catch (error) {
        expect(error).toBe("Invalid Provider Prefix");
      }
    });

    it.skip("verify delegation on all networks", async () => {
      const validatedDelegate = await blockchainManager.validateDelegate(
        issuerIdentity.did,
        delegateIdentity.did
      );
      expect(validatedDelegate).toBeTruthy();
    });

    it("Fail to revoke delegation on Mainnet due to insufficients funds", async () => {
      const revokeDelegate = await blockchainManager.revokeDelegate(
        issuerIdentity,
        delegateIdentity.did
      );
      
      expect(revokeDelegate.some(tx => 
        tx.status === 'rejected' && tx.reason.message.includes('insufficient funds for gas * price + value')
      )).toBeTruthy;
    });

    it("Fail verification due to revoked delegation on all networks", async () => {
      const validatedDelegate = await blockchainManager.validateDelegate(
        issuerIdentity.did,
        delegateIdentity.did
      );
      expect(validatedDelegate).toBeFalsy();
    });

    it("Fail verification when delegation does not exists on all networks", async () => {
      const otherIdentity = createIdentity();
      const validatedDelegate = await blockchainManager.validateDelegate(
        issuerIdentity.did,
        otherIdentity.did
      );
      expect(validatedDelegate).toBeFalsy();
    });
  });

  describe("On MAINNET should", () => {
    const delegateIdentity = createIdentity();

    it("Fail delegation due to insufficient funds for gas on MAINNET", async () => {
      const prefixToAdd = "mainnet:";
      try {
        await addDelegation(prefixToAdd, delegateIdentity);
      } catch (error) {
        expect(error.message.includes("insufficient funds for gas * price + value")).toBeTruthy();
      }
    });

    it("Fail verification on MAINNET", async () => {
      const prefixToAdd = "mainnet:";
      const prefixAddedDid = addPrefix(prefixToAdd, delegateIdentity.did);
      try {
        await blockchainManager.validateDelegate(
          issuerIdentity.did,
          prefixAddedDid
        );
      } catch (error) {
        expect(error.message.includes("All promises were rejected")).toBeTruthy();
      }
    });

    it("Revoke delegation on MAINNET", async () => {
      const prefixToAdd = "mainnet:";
      const prefixAddedDid = addPrefix(prefixToAdd, delegateIdentity.did);

      try {
        await blockchainManager.revokeDelegate(
          issuerIdentity,
          prefixAddedDid
        );
      } catch (error) {
        expect(error.message.includes("insufficient funds for gas * price + value")).toBeTruthy();
      }
    });
  });

  describe("On RSK should", () => {
    const delegateIdentity = createIdentity();

    it("be able to addDelegate on RSK", async () => {
      const prefixToAdd = "rsk:";
      const tx = await addDelegation(prefixToAdd, delegateIdentity);
      expect(tx).toBeDefined();
      expect(tx.status).toBeTruthy();
    });

    it("be able to addDelegate 3 times simultaneously on RSK", async () => {
      const prefixToAdd = "rsk:";
      const delegateTxs = [];
      for (let i = 0; i < 3; i++) {
        delegateTxs[i] = addDelegation(prefixToAdd, createIdentity());
      }

      const delegtions = await Promise.all(delegateTxs);
      for (let i = 0; i < 3; i++) {
        expect(delegtions[i]).toBeDefined();
        expect(delegtions[i].status).toBeTruthy();
      }
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
      const { validTo } = revokeDelegate.events.DIDDelegateChanged.returnValues;
      expect(parseInt(validTo) - Date.now() / 1000).toBeLessThan(500);
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
    const delegateIdentity = createIdentity();

    it("be able to addDelegate on LACCHAIN", async () => {
      const prefixToAdd = "lacchain:";
      const tx = await addDelegation(prefixToAdd, delegateIdentity);
      expect(tx).toBeDefined();
      expect(tx.status).toBeTruthy();
    });

    it("be able to addDelegate 3 times simultaneously on LACCHAIN", async () => {
      const prefixToAdd = "lacchain:";
      const delegateTxs = [];
      for (let i = 0; i < 3; i++) {
        delegateTxs[i] = addDelegation(prefixToAdd, createIdentity());
      }

      const delegtions = await Promise.all(delegateTxs);
      for (let i = 0; i < 3; i++) {
        expect(delegtions[i]).toBeDefined();
        expect(delegtions[i].status).toBeTruthy();
      }
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
      const { validTo } = revokeDelegate.events.DIDDelegateChanged.returnValues;
      expect(parseInt(validTo) - Date.now() / 1000).toBeLessThan(500);
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
    const delegateIdentity = createIdentity();

    it("be able to addDelegate on BFA", async () => {
      const prefixToAdd = "bfa:";
      const tx = await addDelegation(prefixToAdd, delegateIdentity);
      expect(tx).toBeDefined();
      expect(tx.status).toBeTruthy();
    });

    it("be able to addDelegate 3 times simultaneously on BFA", async () => {
      const prefixToAdd = "bfa:";
      const delegateTxs = [];
      for (let i = 0; i < 3; i++) {
        delegateTxs[i] = addDelegation(prefixToAdd, createIdentity());
      }

      const delegtions = await Promise.all(delegateTxs);
      for (let i = 0; i < 3; i++) {
        expect(delegtions[i]).toBeDefined();
        expect(delegtions[i].status).toBeTruthy();
      }
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
      const { validTo } = revokeDelegate.events.DIDDelegateChanged.returnValues;
      expect(parseInt(validTo) - Date.now() / 1000).toBeLessThan(500);
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
