import { Resolver } from "did-resolver";
import Web3 from "web3";

const { Credentials } = require("uport-credentials");
const { createVerifiableCredential, verifyCredential } = require("did-jwt-vc");
const DidRegistryContract = require("ethr-did-registry");
const didJWT = require("did-jwt");
const { delegateTypes, getResolver } = require("ethr-did-resolver");
const EthrDID = require("ethr-did");

const blockChainSelector = (
  networkConfig: { name: string; rpcUrl: string; registry: string }[],
  did: string
) => {
  let routerCharPos = -1,
    index = -1,
    i = 1;
  let searchArray = true;
  const noUportPrefixDid = did.slice(9, did.length);
  routerCharPos = noUportPrefixDid.search(":"); // if routerCharPos > 0 there's another prefix, should search the provider array
  if (routerCharPos === -1) {
    // if not, connect directly to mainnet
    searchArray = false;
    index = 0;
  }
  while (i < networkConfig.length && searchArray) {
    routerCharPos = did.search(networkConfig[i].name);
    if (routerCharPos > 0) {
      index = i; // saves index for connection later
      searchArray = false;
    } else {
      i++; // provider not found, keep going through array
    }
  }

  let blockchainToConnect = {
    provider: null,
    address: null,
  };

  if (index >= 0) {
    blockchainToConnect.provider = networkConfig[index].rpcUrl;
    blockchainToConnect.address = networkConfig[index].registry;
    return blockchainToConnect;
  } else {
    throw "Invalid Provider Prefix";
  }
};

export function addPrefix(prefixToAdd, did) {
  const prefixedDid = did.slice(0, 9) + prefixToAdd + did.slice(9, did.length);
  return prefixedDid;
}

const checkPrefix = function (prefix, networkArray) {
  let i = 0,
    notFounded = true;
  while (i < networkArray.length && notFounded) {
    if (prefix === networkArray[i].name) {
      notFounded = false;
    } else {
      i++;
    }
  }
  return !notFounded;
};

interface BlockchainManagerConfig {
  gasPrice: number;
  providerConfig: any;
}

interface Options {
  from: string;
  gasPrice?: number;
  gas?: number;
}

interface Identity {
  did: string;
  privateKey: string;
}
export class BlockchainManager {
  config: BlockchainManagerConfig;
  didResolver: Resolver;
  gasIncrement: number;

  constructor(config: BlockchainManagerConfig, gasIncrement: number) {
    this.config = config;
    this.didResolver = new Resolver(getResolver(config.providerConfig));
    this.gasIncrement = gasIncrement;
  }

  static delegateType = delegateTypes.Secp256k1SignatureAuthentication2018;

  /**
   * Get the minimum gas price for the given method and options
   * @returns {number}
   */
  async getGasPrice(web3) {
    const gasPrice = await web3.eth.getGasPrice();
    return Math.round(parseInt(gasPrice) * this.gasIncrement);
  }

  /**
   * Get gas limit given the method and options
   * @returns {number}
   */
  async getGasLimit(method, options) {
    // 21000 is a recommended number
    return Math.max(await method.estimateGas(options), 21000);
  }

  /**
   * Obtains the ethr-did-registry contract
   * @param options
   * @returns {Contract}
   */
  static getDidContract(options, contractAddress, web3) {
    return new web3.eth.Contract(DidRegistryContract.abi, contractAddress, {
      from: options.from,
    });
  }

  /**
   * Returns the address of the DID
   * @param {string}  did  Did to extract the address from
   * @returns {string}
   */
  static getDidAddress(did: string) {
    const cleanDid = did.split(":");
    return cleanDid[cleanDid.length - 1];
  }

  /**
   * Add delegateDID as a delegate of identity
   * @param {Identity}  identity
   * @param {string}  delegateDID
   * @param {string}  validity
   */
  async addDelegate(identity: Identity, delegateDID: string, validity: string) {
    const blockchainToConnect = blockChainSelector(
      this.config.providerConfig.networks,
      delegateDID
    );

    const provider = new Web3.providers.HttpProvider(
      blockchainToConnect.provider
    );
    const web3 = new Web3(provider);

    const identityAddr = BlockchainManager.getDidAddress(identity.did);
    const delegateAddr = BlockchainManager.getDidAddress(delegateDID);

    const options: Options = {
      from: identityAddr,
    };

    const contract = BlockchainManager.getDidContract(
      options,
      blockchainToConnect.address,
      web3
    );
    const account = web3.eth.accounts.privateKeyToAccount(identity.privateKey);
    web3.eth.accounts.wallet.add(account);
    const addDelegateMethod = contract.methods.addDelegate(
      identityAddr,
      BlockchainManager.delegateType,
      delegateAddr,
      validity
    );
    options.gas = await this.getGasLimit(addDelegateMethod, options);
    options.gasPrice = await this.getGasPrice(web3);

    const delegateMethodSent = await addDelegateMethod.send(options);
    web3.eth.accounts.wallet.remove(account.address);
    return delegateMethodSent;
  }

  /**
   * validate if delegateDID is delegate of identity
   * @param {Identity}  identity
   * @param {string}  delegateDID
   */
  async validateDelegate(identity: string, delegateDID: string) {
    const identityAddr = BlockchainManager.getDidAddress(identity);
    const delegateAddr = BlockchainManager.getDidAddress(delegateDID);

    const blockchainToConnect = blockChainSelector(
      this.config.providerConfig.networks,
      delegateDID
    );
    const provider = new Web3.providers.HttpProvider(
      blockchainToConnect.provider
    );
    const web3 = new Web3(provider);

    const options: Options = {
      from: identityAddr,
    };
    const contract = BlockchainManager.getDidContract(
      options,
      blockchainToConnect.address,
      web3
    );
    const validDelegateMethod = contract.methods.validDelegate(
      identityAddr,
      BlockchainManager.delegateType,
      delegateAddr
    );
    return validDelegateMethod.call(options);
  }

  /**
   * Resolve a DID document
   * @param {string} did DID to resolve its document
   */
  async resolveDidDocument(did: string) {
    const resolvedDid = await this.didResolver.resolve(did);
    return resolvedDid;
  }

  /**
   * Creates a JWT from a base payload with the information to encode
   * @param {string}  issuerDid  Issuer DID
   * @param {object}  payload  Information of the JWT
   * @param {string}  pkey  Information of the PK
   * @param {number}  expiration  Expiration of the JWT in [NumericDate]{@link https://tools.ietf.org/html/rfc7519#section-2}
   * @param {string}  audienceDID  DID of the audience of the JWT
   * @returns {string}  JWT's string
   */

  async createJWT(
    issuerDid: string,
    pkey: string,
    payload: any,
    expiration: number = undefined,
    audienceDID: string = undefined
  ) {
    payload.exp = expiration;
    payload.aud = audienceDID;

    const signer = didJWT.SimpleSigner(pkey);
    const response = await didJWT.createJWT(payload, {
      alg: "ES256K-R",
      issuer: issuerDid,
      signer,
    });
    return response;
  }

  /**
   * Creates a valid signer
   * @param {string}  privateKey  A hex encoded private key
   * @returns {Signer}  A configured signer function
   */
  getSigner(privateKey: string) {
    return didJWT.SimpleSigner(privateKey);
  }

  /**
   * Verify a JWT string with the given audience
   * @param {string} jwt JWT to be verified
   * @param {string} audienceDID DID of the audience if needed
   */
  async verifyJWT(jwt, audienceDID = undefined) {
    return await didJWT.verifyJWT(jwt, {
      resolver: this.didResolver,
      audience: audienceDID,
    });
  }

  async decodeJWT(jwt) {
    return didJWT.decodeJWT(jwt);
  }

  // genera un certificado asociando la informacion recibida en "subject" con el did
  async createCertificate(
    subjectDid, // this did has this prefix always (did:ethr:) it doesn't change
    subjectPayload,
    expirationDate,
    issuerDid, // the issuer might change and has different prefixes
    issuerPkey
  ) {
    const cleanDid = issuerDid.split(":");
    const prefixedDid = cleanDid.slice(2).join(":");

    const vcIssuer = new EthrDID({
      address: prefixedDid,
      privateKey: issuerPkey,
    });
    const date = expirationDate 
      ? (new Date(expirationDate).getTime() / 1000) | 0 
      : undefined;

    const vcPayload = {
      sub: subjectDid,
      vc: {
        "@context": ["https://www.w3.org/2018/credentials/v1"],
        type: ["VerifiableCredential"],
        credentialSubject: subjectPayload,
      },
    };

    if (expirationDate) {
      vcPayload["exp"] = date;
    }
    const result = await createVerifiableCredential(vcPayload, vcIssuer);
    return result;
  }

  async verifyCertificate(jwt) {
    const result = await verifyCredential(jwt, this.didResolver);
    return result;
  }

  createIdentity(prefixToAdd) {
    let prefixChecked = false,
      prefixedDid = null;

    if (prefixToAdd) {
      prefixChecked = checkPrefix(
        prefixToAdd,
        this.config.providerConfig.networks
      );
      if (!prefixChecked) {
        throw "Invalid Prefix - Check Provider Network Configuration";
      }
    }
    const credential = Credentials.createIdentity();

    if (prefixToAdd) {
      prefixedDid = addPrefix(prefixToAdd + ":", credential.did);
      credential.did = prefixedDid;
    }
    return credential;
  }
}
