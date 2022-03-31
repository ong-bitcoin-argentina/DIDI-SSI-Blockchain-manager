import {
  BlockchainManager,
  CredentialVerificationResponse,
} from "../src/BlockchainManager";

const Constants = require("./constants/Constants");
const { initializeBlockchainManager } = require("./utils/utils");

const config = {
  gasPrice: 10000,
  providerConfig: Constants.BLOCKCHAIN.PROVIDER_CONFIG,
};

let blockchainManager: BlockchainManager;
let jwt: string;

const subject = {
  DatosPersonales: {
    preview: {
      fields: ["dni", "names", "lastNames", "nationality"],
      type: 2,
    },
    category: "identity",
    data: {
      dni: 12345678,
      names: "Homero",
      lastNames: "Simpson",
      nationality: "Argentina",
    },
  },
};

const aYearFromNow = new Date();
// eslint-disable-next-line jest/require-hook
aYearFromNow.setFullYear(aYearFromNow.getFullYear() + 1);

/* eslint-disable-next-line no-unused-vars */
async function createJWT(identity): Promise<object> {
  const payload = { name: "TEST" };
  jwt = await BlockchainManager.createJWT(
    identity.did,
    identity.privateKey,
    payload
  );
  return { jwt, payload };
}

// eslint-disable-next-line jest/no-disabled-tests
describe.skip("delegate an issuer, sign a credential and verify the credential an issuer.", () => {
  it("delegate a new Issuer", async () => {
    expect.assertions(2);
    blockchainManager = initializeBlockchainManager(config);
    const didiIdentity = {
      did: process.env.DELEGATOR_DID,
      privateKey: process.env.DELEGATOR_PRIV_KEY,
    };
    const issuerIdentity = blockchainManager.createIdentity();
    const subjectIdentity = blockchainManager.createIdentity();

    // Delegate new Issuer in every Blockchain.
    const delegateResponse = await blockchainManager.addDelegate(
      didiIdentity,
      issuerIdentity.did,
      "8640000"
    );
    delegateResponse.forEach(({ network, status }) => {
      const expectedStatus =
        network === "mainnet" || network === "goerli"
          ? "rejected"
          : "fulfilled";
      expect(status).toBe(expectedStatus);
    });

    // Delegated issuer creates a new credential
    const credential: string = await BlockchainManager.createCredential(
      subjectIdentity.did,
      subject,
      aYearFromNow,
      issuerIdentity.did,
      issuerIdentity.privateKey
    );
    // console.log(credential);

    // The credential is verfie and if a did is providad, delegation is verified too.
    const verificationResponse: CredentialVerificationResponse =
      await blockchainManager.verifyCredential(credential, didiIdentity.did);
    // console.log(verificationResponse);
    expect(verificationResponse).toBe(true);
  });
});
