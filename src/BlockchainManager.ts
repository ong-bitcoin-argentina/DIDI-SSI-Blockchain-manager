import { Resolver } from "did-resolver";
import Web3 from "web3";

// import DidRegistryContract from "ethr-did-registry";
const DidRegistryContract = require("ethr-did-registry");

// import didJWT from "did-jwt";
const didJWT = require("did-jwt");

const { delegateTypes, getResolver } = require("ethr-did-resolver");

let web3 = null,
  provider = null,
  blockchainContract = null;

const blockChainSelector = (
  networkConfig: { name: string; rpcUrl: string; registry: string }[],
  did: string
) => {
  // const blockChainSelector = (networkConfig, did) => {
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
    } else i++; // provider not found, keep going through array
  }

  if (index >= 0) {
    provider = new Web3.providers.HttpProvider(networkConfig[index].rpcUrl);
    web3 = new Web3(provider);
    blockchainContract = networkConfig[index].registry;
    return null;
  } else {
    throw "Invalid Provider Prefix";
  }
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
  gas_increment: number;

  constructor(config: BlockchainManagerConfig, gas_increment: number) {
    this.config = config;
    this.didResolver = new Resolver(getResolver(config.providerConfig));
    this.gas_increment = gas_increment;
  }

  static delegateType = delegateTypes.Secp256k1SignatureAuthentication2018;

  /**
   * Get the minimum gas price for the given method and options
   * @returns {number}
   */
  async getGasPrice() {
    const lastBlock = await web3.eth.getBlock("latest");
    // 1.1 representes a 10% more of the minimumGasPrice collected
    // return Math.round(parseInt(lastBlock.minimumGasPrice) * 1.1);
    return Math.round(parseInt(lastBlock.getGasPrice) * this.gas_increment);
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
  static getDidContract(options) {
    return new web3.eth.Contract(DidRegistryContract.abi, blockchainContract, {
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
    blockChainSelector(this.config.providerConfig.networks, delegateDID);

    const identityAddr = BlockchainManager.getDidAddress(identity.did);
    const delegateAddr = BlockchainManager.getDidAddress(delegateDID);

    const options: Options = {
      from: identityAddr,
    };
    const contract = BlockchainManager.getDidContract(options);
    const account = web3.eth.accounts.privateKeyToAccount(identity.privateKey);
    web3.eth.accounts.wallet.add(account);
    const addDelegateMethod = contract.methods.addDelegate(
      identityAddr,
      BlockchainManager.delegateType,
      delegateAddr,
      validity
    );
    options.gas = await this.getGasLimit(addDelegateMethod, options);
    options.gasPrice = await this.getGasPrice();
    return addDelegateMethod.send(options);
  }

  /**
   * validate if delegateDID is delegate of identity
   * @param {Identity}  identity
   * @param {string}  delegateDID
   */
  async validateDelegate(identity: string, delegateDID: string) {
    const identityAddr = BlockchainManager.getDidAddress(identity);
    const delegateAddr = BlockchainManager.getDidAddress(delegateDID);

    blockChainSelector(this.config.providerConfig.networks, delegateDID);

    const options: Options = {
      from: identityAddr,
    };
    const contract = BlockchainManager.getDidContract(options);
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
  // async resolveDidDocument(did: string, config: { providerConfig: any }) {
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
   * Decode a JWT string with the given audience
   * @param {string} jwt JWT to be decoded
   * @param {string} audienceDID DID of the audience if needed
   */
  async verifyJWT(jwt, audienceDID = undefined) {
    return await didJWT.verifyJWT(jwt, {
      resolver: this.didResolver,
      audience: audienceDID,
    });
  }
}
