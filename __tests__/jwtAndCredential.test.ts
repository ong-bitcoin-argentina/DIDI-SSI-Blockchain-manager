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
// - verifyJWT                                                                    //
// - decodeJWT                                                                    //
// - createCredential                                                             //
// - verifyCredential                                                             //
//                                                                                //
// To run these tests you must have a DELEGATOR DID address and its private key   //
// with some $$$ in it, to execute the transaction and pay the fee.               //
// This info must be added also in the .env file. (check out README file)         //
/// /////////////////////////////////////////////////////////////////////////////////
import { BlockchainManager } from "../src";

const Constants = require("./constants/Constants");
const { initializeBlockchainManager } = require("./utils/utils");

const config = {
  gasPrice: 10000,
  providerConfig: Constants.BLOCKCHAIN.PROVIDER_CONFIG,
};

let blockchainManager: BlockchainManager;
let jwt;
let payload;
let createdCredential;

const personData = {
  dni: 12345678,
  names: "Homero",
  lastNames: "Simpson",
  nationality: "Argentina",
};

const subject = {
  DatosPersonales: {
    preview: {
      fields: ["dni", "names", "lastNames", "nationality"],
      type: 2,
    },
    category: "identity",
    data: personData,
  },
};

const aYearFromNow = new Date();
// eslint-disable-next-line jest/require-hook
aYearFromNow.setFullYear(aYearFromNow.getFullYear() + 1);

async function createJWT(identity) {
  payload = { name: "TEST" };
  jwt = await BlockchainManager.createJWT(identity.did, identity.privateKey, {
    ...payload,
  });
  return jwt;
}

describe("blockchain Manager on MAINNET should", () => {
  let identity = null;
  blockchainManager = initializeBlockchainManager(config);

  it("create a jwt with a MAINNET prefix DID and verify it", async () => {
    expect.assertions(4);
    identity = blockchainManager.createIdentity();
    const returnedJwt = await createJWT(identity);
    const result = await blockchainManager.verifyJWT(returnedJwt);

    expect(result.jwt).toStrictEqual(returnedJwt);
    expect(result.payload).toStrictEqual(expect.objectContaining(payload));
    expect(result.issuer).toStrictEqual(identity.did);
    expect(result.doc).toBeDefined();
  });

  it("decode the jwt when invoking decodeJWT method from MAINNET", async () => {
    expect.assertions(3);
    const result = await BlockchainManager.decodeJWT(jwt);

    expect(result.signature).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.payload.iss).toBe(identity.did);
  });
});

describe("blockchain Manager on RSK should", () => {
  let identity = null;
  const prefixToAdd = "rsk";
  blockchainManager = initializeBlockchainManager(config);

  it("create a jwt with a RSK prefix DID and verify it", async () => {
    expect.assertions(4);
    identity = blockchainManager.createIdentity(prefixToAdd);
    const returnedJwt = await createJWT(identity);
    const result = await blockchainManager.verifyJWT(returnedJwt);

    expect(result.jwt).toStrictEqual(returnedJwt);
    expect(result.payload).toStrictEqual(expect.objectContaining(payload));
    expect(result.issuer).toStrictEqual(identity.did);
    expect(result.doc).toBeDefined();
  });

  it("decode the jwt when invoking decodeJWT method from RSK", async () => {
    expect.assertions(3);
    const result = await BlockchainManager.decodeJWT(jwt);

    expect(result.signature).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.payload.iss).toBe(identity.did);
  });
});

describe("blockchain Manager on LACCHAIN should", () => {
  let identity = null;
  const prefixToAdd = "lacchain";
  blockchainManager = initializeBlockchainManager(config);

  it("create a jwt with a LACCHAIN prefix DID and verify it", async () => {
    expect.assertions(4);
    identity = blockchainManager.createIdentity(prefixToAdd);
    const returnedJwt = await createJWT(identity);
    const result = await blockchainManager.verifyJWT(returnedJwt);

    expect(result.jwt).toStrictEqual(returnedJwt);
    expect(result.payload).toStrictEqual(expect.objectContaining(payload));
    expect(result.issuer).toStrictEqual(identity.did);
    expect(result.doc).toBeDefined();
  });

  it("decode the jwt when invoking decodeJWT method from LACCHAIN", async () => {
    expect.assertions(3);
    const result = await BlockchainManager.decodeJWT(jwt);

    expect(result.signature).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.payload.iss).toBe(identity.did);
  });
});

describe("blockchain Manager on BFA should", () => {
  let identity = null;
  const prefixToAdd = "bfa";
  blockchainManager = initializeBlockchainManager(config);

  it("create a jwt with a BFA prefix DID and verify it", async () => {
    expect.assertions(4);
    identity = blockchainManager.createIdentity(prefixToAdd);
    const returnedJwt = await createJWT(identity);
    const result = await blockchainManager.verifyJWT(returnedJwt);

    expect(result.jwt).toStrictEqual(returnedJwt);
    expect(result.payload).toStrictEqual(expect.objectContaining(payload));
    expect(result.issuer).toStrictEqual(identity.did);
    expect(result.doc).toBeDefined();
  });

  it("decode the jwt when invoking decodeJWT method from BFA", async () => {
    expect.assertions(3);
    const result = await BlockchainManager.decodeJWT(jwt);

    expect(result.signature).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.payload.iss).toBe(identity.did);
  });
});

describe("blockchain Manager Credentials should", () => {
  const prefixToAdd = "invalid";
  blockchainManager = initializeBlockchainManager(config);

  it("faIL when an invalid prefix is sent", async () => {
    expect.assertions(1);
    try {
      blockchainManager.createIdentity(prefixToAdd);
    } catch (error) {
      expect(error.message).toMatch(
        "Invalid Prefix - Check Provider Network Configuration"
      );
    }
  });
});

describe("blockchain Manager Credentials on MAINNET should", () => {
  const prefixToAdd = "";
  blockchainManager = initializeBlockchainManager(config);

  it("create a Credential with mainnet did", async () => {
    expect.assertions(1);
    const issuerIdentity = blockchainManager.createIdentity(prefixToAdd);
    const subjectIdentity = blockchainManager.createIdentity();

    const result = await BlockchainManager.createCredential(
      subjectIdentity.did,
      subject,
      aYearFromNow,
      issuerIdentity.did,
      issuerIdentity.privateKey
    );
    createdCredential = result;
    expect(result).toBeDefined();
  });

  it("verify a created Credential with mainnet did", async () => {
    expect.assertions(2);
    const result = await blockchainManager.verifyCredential(createdCredential);
    expect(result).toBeDefined();
    expect(result.payload.vc.credentialSubject.DatosPersonales.data.dni).toBe(
      personData.dni
    );
  });
});

describe("blockchain Manager Credentials on RSK should", () => {
  const prefixToAdd = "rsk";
  blockchainManager = initializeBlockchainManager(config);

  it("create a Credential with rsk did", async () => {
    expect.assertions(1);
    const issuerIdentity = blockchainManager.createIdentity(prefixToAdd);
    const subjectIdentity = blockchainManager.createIdentity();

    const result = await BlockchainManager.createCredential(
      subjectIdentity.did,
      subject,
      aYearFromNow,
      issuerIdentity.did,
      issuerIdentity.privateKey
    );
    createdCredential = result;
    expect(result).toBeDefined();
  });

  it("verify a created Credential with rsk did", async () => {
    expect.assertions(2);
    const result = await blockchainManager.verifyCredential(createdCredential);
    expect(result).toBeDefined();
    expect(result.payload.vc.credentialSubject.DatosPersonales.data.dni).toBe(
      personData.dni
    );
  });
});

describe("blockchain Manager Credentials on LACCHAIN should", () => {
  const prefixToAdd = "lacchain";
  blockchainManager = initializeBlockchainManager(config);

  it("create a Credential with lacchain did", async () => {
    expect.assertions(1);
    const issuerIdentity = blockchainManager.createIdentity(prefixToAdd);
    const subjectIdentity = blockchainManager.createIdentity();

    const result = await BlockchainManager.createCredential(
      subjectIdentity.did,
      subject,
      aYearFromNow,
      issuerIdentity.did,
      issuerIdentity.privateKey
    );
    createdCredential = result;
    expect(result).toBeDefined();
  });

  it("verify a created Credential with lacchain did", async () => {
    expect.assertions(2);
    const result = await blockchainManager.verifyCredential(createdCredential);
    expect(result).toBeDefined();
    expect(result.payload.vc.credentialSubject.DatosPersonales.data.dni).toBe(
      personData.dni
    );
  });
});

describe("blockchain Manager Credentials on BFA should", () => {
  const prefixToAdd = "bfa";
  blockchainManager = initializeBlockchainManager(config);

  it("create a Credential with bfa did", async () => {
    expect.assertions(1);
    const issuerIdentity = blockchainManager.createIdentity(prefixToAdd);
    const subjectIdentity = blockchainManager.createIdentity();

    const result = await BlockchainManager.createCredential(
      subjectIdentity.did,
      subject,
      aYearFromNow,
      issuerIdentity.did,
      issuerIdentity.privateKey
    );
    createdCredential = result;
    expect(result).toBeDefined();
  });

  it("verify a created Credential with bfa did", async () => {
    expect.assertions(2);
    const result = await blockchainManager.verifyCredential(createdCredential);
    expect(result).toBeDefined();
    expect(result.payload.vc.credentialSubject.DatosPersonales.data.dni).toBe(
      personData.dni
    );
  });
});
