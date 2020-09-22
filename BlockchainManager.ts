import {Resolver} from "did-resolver";
import {Signer} from "did-jwt/src/JWT";
import set = Reflect.set;

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

export class BlockchainManager {

  config: BlockchainManagerConfig
  didResolver: Resolver

  constructor(config: BlockchainManagerConfig) {
    this.config = config;
    this.didResolver = new Resolver(getResolver(config.providerConfig))
  }

  static delegateType = delegateTypes.Secp256k1SignatureAuthentication2018;

  /**
   * Get gas price for RSK network
   * @returns {number}
   */
  get gasPrice() {
    return this.config.gasPrice;
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
    let cleanDid = did.split(":");
    return cleanDid[cleanDid.length - 1];
  }

  /**
   * Add delegateDID as a delegate of identity
   * @param {string}  identity
   * @param {string}  delegateDID
   * @param {number}  validity
   */
  async addDelegate(identity: string, delegateDID: string, validity: number = Constants.BLOCKCHAIN.DELEGATE_VALIDITY) {
    const identityAddr = BlockchainManager.getDidAddress(identity);
    const delegateAddr = BlockchainManager.getDidAddress(delegateDID);
    const options: Options = {from: identityAddr, gas: undefined, gasPrice: this.gasPrice};
    const contract = BlockchainManager.getDidContract(options);
    const addDelegateMethod = contract.methods
      .addDelegate(identityAddr, BlockchainManager.delegateType, delegateAddr, validity);
    return addDelegateMethod.send(options);
  }

  /**
   * validate if delegateDID is delegate of identity
   * @param {string}  identity
   * @param {string}  delegateDID
   */
  async validateDelegate(identity, delegateDID) {
    const options = {from: identity};
    const identityAddr = BlockchainManager.getDidAddress(identity);
    const delegateAddr = BlockchainManager.getDidAddress(delegateDID);
    const contract = BlockchainManager.getDidContract(options);
    return contract.methods
      .validDelegate(identityAddr, BlockchainManager.delegateType, delegateAddr)
      .call(options);
  }

  /**
   * Resolve a DID document
   * @param {string} did DID to resolve its document
   */
  async resolveDidDocument(did) {
    return this.didResolver.resolve(did);
  }


  /**
   * Sets an DID attribute
   * @param {string}  identity  DID to set the attribute in
   * @param {string}  key  Attribute key
   * @param {string}  value  Attribute value
   * @param {number}  validity
   */
  async setAttribute(identity: string, key: string, value: string, validity: number = Constants.BLOCKCHAIN.ATTRIBUTE_VALIDITY) {
    const didAddr = BlockchainManager.getDidAddress(identity);
    const options: Options = {from: didAddr, gasPrice: this.gasPrice, gas: undefined};
    const contract = BlockchainManager.getDidContract(options);
    const keyBytes = web3.utils.fromAscii(key)
    const valueBytes = web3.utils.fromAscii(value)
    const setAttrMethod = contract.methods.setAttribute(didAddr, keyBytes, valueBytes, validity);
    return setAttrMethod.send(options);
  }

  /**
   * Gets an DID attribute
   * @param {string}  identity  DID to set the attribute in
   * @param {string}  key  Attribute key
   */
  async getAttribute(identity: string, key: string) {
    const identityAddr = BlockchainManager.getDidAddress(identity);
    const options: Options = {from: identityAddr, gasPrice: this.gasPrice, gas: undefined};
    const contract = BlockchainManager.getDidContract(options);
    const keyBytes = web3.utils.fromAscii(key);

    let previousChange = await contract.methods.changed(identityAddr).call();
    let event;
    while (parseInt(previousChange)) {
      const events = await contract.getPastEvents("DIDAttributeChanged", {
        fromBlock: previousChange, toBlock: previousChange,
        filter: {identity: identityAddr}
      });

      if (events.length == 0)
        return undefined;

      event = events[0];
      previousChange = undefined;
      const eventKeyBytes = event.returnValues.name.substring(keyBytes.length)
      if (eventKeyBytes !== keyBytes)
        previousChange = event.returnValues.previousChange;
    }

    return event.returnValues;
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
    return didJWT.createJWT(
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
    return didJWT.verifyJWT(jwt, {resolver: this.didResolver, audience: audienceDID});
  }

}