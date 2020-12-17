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
// - verifyJWT                                                                    //
// - decodeJWT                                                                    //
// - createCertificate                                                            //
// - verifyCertificate                                                            //
//                                                                                //
// To run these tests you must have a DELEGATOR DID address and its private key   //
// with some $$$ in it, to execute the transaction and pay the fee.               //
// This info must be added also in the .env file. (check out README file)         //
////////////////////////////////////////////////////////////////////////////////////


const Constants = require("./constants/Constants");
const { initializeBlockchainManager } = require("./utils/utils");

const config = {
  gasPrice: 10000,
  providerConfig: Constants.BLOCKCHAIN.PROVIDER_CONFIG,
};

let blockchainManager;
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

let aYearFromNow = new Date();
aYearFromNow.setFullYear(aYearFromNow.getFullYear() + 1);

async function createJWT(identity) {
  const signer = blockchainManager.getSigner(identity.privateKey);
  payload = { name: "TEST" };
  jwt = await blockchainManager.createJWT(identity.did, identity.privateKey, {
    ...payload,
  });
  return jwt;
}

describe("Blockchain Manager on MAINNET should", () => {
  let identity = null;
  blockchainManager = initializeBlockchainManager(config);

  it("create a jwt with a MAINNET prefix DID and verify it", async () => {
    identity = blockchainManager.createIdentity();
    const returnedJwt = await createJWT(identity);
    const result = await blockchainManager.verifyJWT(returnedJwt);

    expect(result.jwt).toEqual(returnedJwt);
    expect(result.payload).toEqual(expect.objectContaining(payload));
    expect(result.issuer).toEqual(identity.did);
    expect(result.doc).toBeDefined();
  });

  it("decode the jwt when invoking decodeJWT method from MAINNET", async () => {
    const result = await blockchainManager.decodeJWT(jwt);

    expect(result.signature).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.payload.iss).toBe(identity.did);
  });
});

describe("Blockchain Manager on RSK should", () => {
  let identity = null;
  const prefixToAdd = "rsk";
  blockchainManager = initializeBlockchainManager(config);

  it("create a jwt with a RSK prefix DID and verify it", async () => {
    identity = blockchainManager.createIdentity(prefixToAdd);
    const returnedJwt = await createJWT(identity);
    const result = await blockchainManager.verifyJWT(returnedJwt);

    expect(result.jwt).toEqual(returnedJwt);
    expect(result.payload).toEqual(expect.objectContaining(payload));
    expect(result.issuer).toEqual(identity.did);
    expect(result.doc).toBeDefined();
  });

  it("decode the jwt when invoking decodeJWT method from RSK", async () => {
    const result = await blockchainManager.decodeJWT(jwt);

    expect(result.signature).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.payload.iss).toBe(identity.did);
  });
});

describe("Blockchain Manager on LACCHAIN should", () => {
  let identity = null;
  const prefixToAdd = "lacchain";
  blockchainManager = initializeBlockchainManager(config);

  it("create a jwt with a LACCHAIN prefix DID and verify it", async () => {
    identity = blockchainManager.createIdentity(prefixToAdd);
    const returnedJwt = await createJWT(identity);
    const result = await blockchainManager.verifyJWT(returnedJwt);

    expect(result.jwt).toEqual(returnedJwt);
    expect(result.payload).toEqual(expect.objectContaining(payload));
    expect(result.issuer).toEqual(identity.did);
    expect(result.doc).toBeDefined();
  });

  it("decode the jwt when invoking decodeJWT method from LACCHAIN", async () => {
    const result = await blockchainManager.decodeJWT(jwt);

    expect(result.signature).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.payload.iss).toBe(identity.did);
  });
});

describe("Blockchain Manager on BFA should", () => {
  let identity = null;
  const prefixToAdd = "bfa";
  blockchainManager = initializeBlockchainManager(config);

  it("create a jwt with a BFA prefix DID and verify it", async () => {
    identity = blockchainManager.createIdentity(prefixToAdd);
    const returnedJwt = await createJWT(identity);
    const result = await blockchainManager.verifyJWT(returnedJwt);

    expect(result.jwt).toEqual(returnedJwt);
    expect(result.payload).toEqual(expect.objectContaining(payload));
    expect(result.issuer).toEqual(identity.did);
    expect(result.doc).toBeDefined();
  });

  it("decode the jwt when invoking decodeJWT method from BFA", async () => {
    const result = await blockchainManager.decodeJWT(jwt);

    expect(result.signature).toBeDefined();
    expect(result.data).toBeDefined();
    expect(result.payload.iss).toBe(identity.did);
  });
});

describe("Blockchain Manager Credentials should", () => {
  const prefixToAdd = "invalid";
  blockchainManager = initializeBlockchainManager(config);

  it("FAIL when an invalid prefix is sent", async () => {
    let issuerIdentity = null;
    try {
      issuerIdentity = blockchainManager.createIdentity(prefixToAdd);
    } catch (error) {
      expect(error).toBe(
        "Invalid Prefix - Check Provider Network Configuration"
      );
    }
  });
});

describe("Blockchain Manager Credentials on MAINNET should", () => {
  const prefixToAdd = "";
  blockchainManager = initializeBlockchainManager(config);

  it("create a Credential with mainnet did ", async () => {
    const issuerIdentity = blockchainManager.createIdentity(prefixToAdd);
    const subjectIdentity = blockchainManager.createIdentity();

    const result = await blockchainManager.createCertificate(
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
    const result = await blockchainManager.verifyCertificate(createdCredential);
    expect(result).toBeDefined();
    expect(result.payload.vc.credentialSubject.DatosPersonales.data.dni).toBe(
      personData.dni
    );
  });
});

describe("Blockchain Manager Credentials on RSK should", () => {
  const prefixToAdd = "rsk";
  blockchainManager = initializeBlockchainManager(config);

  it("create a Credential with rsk did ", async () => {
    const issuerIdentity = blockchainManager.createIdentity(prefixToAdd);
    const subjectIdentity = blockchainManager.createIdentity();

    const result = await blockchainManager.createCertificate(
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
    const result = await blockchainManager.verifyCertificate(createdCredential);
    expect(result).toBeDefined();
    expect(result.payload.vc.credentialSubject.DatosPersonales.data.dni).toBe(
      personData.dni
    );
  });
});

describe("Blockchain Manager Credentials on LACCHAIN should", () => {
  const prefixToAdd = "lacchain";
  blockchainManager = initializeBlockchainManager(config);

  it("create a Credential with lacchain did ", async () => {
    const issuerIdentity = blockchainManager.createIdentity(prefixToAdd);
    const subjectIdentity = blockchainManager.createIdentity();

    const result = await blockchainManager.createCertificate(
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
    const result = await blockchainManager.verifyCertificate(createdCredential);
    expect(result).toBeDefined();
    expect(result.payload.vc.credentialSubject.DatosPersonales.data.dni).toBe(
      personData.dni
    );
  });
});

describe("Blockchain Manager Credentials on BFA should", () => {
  const prefixToAdd = "bfa";
  blockchainManager = initializeBlockchainManager(config);

  it("create a Credential with bfa did ", async () => {
    const issuerIdentity = blockchainManager.createIdentity(prefixToAdd);
    const subjectIdentity = blockchainManager.createIdentity();

    const result = await blockchainManager.createCertificate(
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
    const result = await blockchainManager.verifyCertificate(createdCredential);
    expect(result).toBeDefined();
    expect(result.payload.vc.credentialSubject.DatosPersonales.data.dni).toBe(
      personData.dni
    );
  });
});
