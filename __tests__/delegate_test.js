const Constants = require("./constants/Constants");
const { BlockchainManager } = require("../src/BlockchainManager");
const { Credentials } = require("uport-credentials");

const config = {
  gasPrice: 10000,
  providerConfig: Constants.BLOCKCHAIN.PROVIDER_CONFIG,
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

function addPrefix(prefixToAdd, did) {
  const prefixDid = did.slice(0, 9) + prefixToAdd + did.slice(9, did.length);
  return prefixDid;
}

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
    beforeAll(async () => {
      initializeBlockchainManager();
      createIdentities();
    });

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
    beforeAll(async () => {
      initializeBlockchainManager();
      createIdentities();
    });

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

    it("Fail verification when delegation does not exists on MAINNET", async () => {
      const otherIdentity = Credentials.createIdentity();
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
    beforeAll(async () => {
      initializeBlockchainManager();
      createIdentities();
    });

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

    it("Fail verification when delegation does not exists on RSK", async () => {
      const otherIdentity = Credentials.createIdentity();
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
    beforeAll(async () => {
      initializeBlockchainManager();
      createIdentities();
    });

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

    it("Fail verification when delegation does not exists on LACCHAIN", async () => {
      const otherIdentity = Credentials.createIdentity();
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
    beforeAll(async () => {
      initializeBlockchainManager();
      createIdentities();
    });

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

    it("Fail verification when delegation does not exists on BFA", async () => {
      const otherIdentity = Credentials.createIdentity();
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
