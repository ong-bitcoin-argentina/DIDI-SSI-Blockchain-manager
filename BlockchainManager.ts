import {Resolver} from "did-resolver";
import {Signer} from "did-jwt/src/JWT";

const Constants = require("./Constants");
const DidRegistryContract = require("ethr-did-registry");
const {delegateTypes, getResolver} = require("ethr-did-resolver");
const didJWT = require("did-jwt");
const Web3 = require('web3');
const provider = new Web3.providers.HttpProvider(Constants.BLOCKCHAIN.BLOCK_CHAIN_URL);
const web3 = new Web3(provider);

interface BlockchainManagerConfig {
  gasPrice: number,
  providerConfig: any
}

interface Options {
  from: string,
  gasPrice: number,
  gas: number
}

interface Identity {
  did: string,
  privateKey: string
}

export class BlockchainManager {

  config: BlockchainManagerConfig
  didResolver: Resolver

  constructor(config: BlockchainManagerConfig) {
    this.config = config;
    this.didResolver = new Resolver(getResolver(config.providerConfig))
  }

  static delegateType = delegateTypes.Secp256k1SignatureAuthentication2018;

  /**
   * Get the minimum gas price for the given method and options
   * @returns {number}
   */
  async getGasPrice() {
    const lastBlock = await web3.eth.getBlock("latest");
    // 1.1 representes a 10% more of the minimumGasPrice collected
    return Math.round(parseInt(lastBlock.minimumGasPrice) * 1.1);
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
    return new web3.eth.Contract(DidRegistryContract.abi, Constants.BLOCKCHAIN.BLOCK_CHAIN_CONTRACT, {
      from: options.from,
      gasLimit: 3000000
    });
  }

  /**
   * Returns the address of the DID
   * @param {string}  did  Did to extract the address from
   * @returns {string}
   */
  static getDidAddress(did) {
    const cleanDid = did.split(":");
    return cleanDid[cleanDid.length - 1];
  }

  /**
   * Add delegateDID as a delegate of identity
   * @param {Identity}  identity
   * @param {string}  delegateDID
   * @param {number}  validity
   */
  async addDelegate(identity: Identity, delegateDID: string, validity: number = Constants.BLOCKCHAIN.DELEGATE_VALIDITY) {
    const identityAddr = BlockchainManager.getDidAddress(identity.did);
    const delegateAddr = BlockchainManager.getDidAddress(delegateDID);
    const options: Options = {from: identityAddr, gas: undefined, gasPrice: undefined};
    const contract = BlockchainManager.getDidContract(options);
    const account = web3.eth.accounts.privateKeyToAccount(identity.privateKey);
    web3.eth.accounts.wallet.add(account);
    const addDelegateMethod = contract.methods
      .addDelegate(identityAddr, BlockchainManager.delegateType, delegateAddr, validity);
    options.gas = await this.getGasLimit(addDelegateMethod, options);
    options.gasPrice = await this.getGasPrice();
    return addDelegateMethod.send(options);
  }

  /**
   * validate if delegateDID is delegate of identity
   * @param {Identity}  identity
   * @param {string}  delegateDID
   */
  async validateDelegate(identity: Identity, delegateDID: string) {
    const identityAddr = BlockchainManager.getDidAddress(identity.did);
    const delegateAddr = BlockchainManager.getDidAddress(delegateDID);
    const options: Options = {from: identityAddr, gas: undefined, gasPrice: undefined};
    const contract = BlockchainManager.getDidContract(options);
    const validDelegateMethod = contract.methods
      .validDelegate(identityAddr, BlockchainManager.delegateType, delegateAddr);
    return validDelegateMethod.call(options);
  }

  /**
   * Resolve a DID document
   * @param {string} did DID to resolve its document
   */
  async resolveDidDocument(did) {
    return this.didResolver.resolve(did);
  }

  /**
   * Creates a JWT from a base payload with the information to encode
   * @param {string}  issuerDid  Issuer DID
   * @param {object}  payload  Information of the JWT
   * @param {Signer}  signer  Signer of the JWT [More info]{@link https://github.com/decentralized-identity/did-jwt}
   * @param {number}  expiration  Expiration of the JWT in [NumericDate]{@link https://tools.ietf.org/html/rfc7519#section-2}
   * @param {string}  audienceDID  DID of the audience of the JWT
   * @returns {string}  JWT's string
   */
  async createJWT(
    issuerDid: string,
    payload: any,
    signer: Signer,
    expiration: number = undefined,
    audienceDID: string = undefined
  ) {
    payload.exp = expiration;
    payload.aud = audienceDID;
    return await didJWT.createJWT(
      payload,
      {alg: "ES256K-R", issuer: issuerDid, signer}
    );
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
    return await didJWT.verifyJWT(jwt, {resolver: this.didResolver, audience: audienceDID});
  }

}
