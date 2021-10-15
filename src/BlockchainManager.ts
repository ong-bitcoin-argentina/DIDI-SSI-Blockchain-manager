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
): NetworkConfig => {
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

  let blockchainToConnect: NetworkConfig = {
    provider: null,
    address: null,
    name: null,
  };

  if (index >= 0) {
    blockchainToConnect.provider = networkConfig[index].rpcUrl;
    blockchainToConnect.address = networkConfig[index].registry;
    blockchainToConnect.name = networkConfig[index].name;
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

export interface BlockchainManagerConfig {
  gasPrice: number;
  providerConfig: any;
}

export interface Options {
  from: string;
  gasPrice?: number;
  gas?: number;
  nonce?: number;
}

export interface Identity {
  did: string;
  privateKey: string;
}

export interface NetworkConfig {
  provider: string,
  address: string,
  name: string,
}

export interface OperationResponse {
  status: 'fulfilled' | 'rejected',
  network: string,
  value: any
}

export interface CredentialVerificationResponse {
  isIssuerValid: boolean,
  payload: any,
  doc: any,
  issuer: string,
  signer: any,
  jwt: string,
}

export class BlockchainManager {
  config: BlockchainManagerConfig;
  didResolver: Resolver;
  gasSafetyValue?: number;
  gasPriceSafetyValue?: number;
  

  constructor(config: BlockchainManagerConfig, gasSafetyValue: number = 1.2, gasPriceSafetyValue: number = 1.1) {
    this.config = config;
    this.didResolver = new Resolver(getResolver(config.providerConfig));    
    this.gasSafetyValue = gasSafetyValue;
    this.gasPriceSafetyValue = gasPriceSafetyValue ;
  }

  static delegateType = delegateTypes.Secp256k1SignatureAuthentication2018;

  /**
   * Get the minimum gas price for the given method and options
   * @returns {number}
   */
  async getGasPrice(web3) {
    const gasPrice = await web3.eth.getGasPrice();
    const retGasPrice = Math.round(parseInt(gasPrice) * this.gasPriceSafetyValue);
    return retGasPrice;
  }

  /**
   * Get gas limit given the method and options
   * @returns {number}
   */
  async getGasLimit(method, options) {
    // 21000 is a recommended number
    const gasQty = Math.round(Math.max(await method.estimateGas(options), 21000) * this.gasSafetyValue);
    return gasQty;
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
   * @param {string}  did  Did to get the address from
   * @returns {string}
   */
  static getDidAddress(did: string) {
    const cleanDid = did.split(":");
    return cleanDid[cleanDid.length - 1];
  }
  
  /**
   * 
   * @param {string} did Did to get the blockchain name from
   */
  static getDidBlockchain(did: string) {
    const didAsArray = did.split(":");

    return didAsArray.length === 4 ? didAsArray[2] : null;
  }

  /**
   * Add a blockchain beofre the ethereum address. Throws if already contains
   * a blockchain. did:ethr:0x123 => did:ethr:rinkeby:0x123
   * @param {string} did Did to add the blockchain
   * @param {string} blockchain Blockchain to add
   */
  static addBlockchainToDid(did: string, blockchain: string) {
    const didAsArray = did.split(":");
    if ( didAsArray.length === 4) throw new Error('#blockchainManager-didWithNetwork');

    didAsArray.splice(2, 0, blockchain)
    return didAsArray.join(':');
  } 

  /**
   * Compare two dids DIDs. A DIDI without netowors is equal to a DID with network and
   * same address. Two DIDs with same netork and different address are different. Ex:
   * did:ethr:net:0x123 == did:ethr:0x123
   * did:ethr:net1:0x123 != did:ethr:net2:0x123
   * did:ethr:net:0x123 != did:ethr:net:0x124
   * did:ethr:0x123 != did:ethr:0x124
   * did:ethr:net1:0x123 != did:ethr:net2:0x124
   * @param {string} did1 
   * @param {string} did2 
   */
  static compareDid(did1: string, did2:string){
    const didAddress1=BlockchainManager.getDidAddress(did1);
    const didAddress2=BlockchainManager.getDidAddress(did2);
    const didBlockchain1=BlockchainManager.getDidBlockchain(did1);
    const didBlockchain2=BlockchainManager.getDidBlockchain(did2);

    if (didBlockchain1 == null || didBlockchain2 == null){
      return (didAddress1 === didAddress2);
    } else {
      return ( didAddress1 === didAddress2 && didBlockchain1 === didBlockchain2 );
    }
    }    

  /**
   * If syncing throws #blockchainManager-nodeIsSyncing  
   * @param web3 
   */
  async onlySynced(web3) {
    try {
      const isSyncingResponse = await web3.eth.isSyncing();
      if (!!isSyncingResponse) throw new Error('#blockchainManager-nodeIsSyncing');
    } catch (e) {
      // RSK public node don't allow eth_syncing. We assume that is always in sync
      if(e.message.includes("403 Method Not Allowed")) {
        return;
      }
      throw e;
    }
  }

  /**
   * Given a network add delegateDID as a delegate of identity
   * @param {NetworkConfig} blockchainToConnect 
   * @param {Identity} identity 
   * @param {string} delegateDID 
   * @param {string} validity 
   */
  private async delegateOnBlockchain(blockchainToConnect: NetworkConfig, identity: Identity, delegateDID: string, validity: string) {
    const provider = new Web3.providers.HttpProvider(
      blockchainToConnect.provider
    );
    const web3 = new Web3(provider);
    await this.onlySynced(web3);
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
    options.nonce = blockchainToConnect.name !== 'lacchain' ? await web3.eth.getTransactionCount(identityAddr, 'pending'): undefined;
    
    let delegateMethodSent;
    try {
      delegateMethodSent = await addDelegateMethod.send(options);
    } catch (e) {
      if (this.isUnknownError(e)) { 
        throw e;
      }
      delegateMethodSent = await this.delegateOnBlockchain(blockchainToConnect, identity, delegateDID, validity)
    }
    web3.eth.accounts.wallet.remove(account.address);
    return delegateMethodSent;
  }

  /**
   * Add delegateDID as a delegate of identity on one or more networks
   * @param {Identity}  identity
   * @param {string}  delegateDID
   * @param {string}  validity
   */
  async addDelegate(identity: Identity, delegateDID: string, validity: string): Promise<OperationResponse[]> {
    const blockchain = BlockchainManager.getDidBlockchain(delegateDID);

    if (blockchain) {
      const blockchainToConnect: NetworkConfig = blockChainSelector(
        this.config.providerConfig.networks,
        delegateDID
      );
      const delegations: any = await Promise.allSettled([this.delegateOnBlockchain(blockchainToConnect, identity, delegateDID, validity)]);  
      delegations[0].network = blockchainToConnect.name;
      return delegations;
    }

    const validNetworks = this.config.providerConfig.networks.filter(({ name }) => !!name);
    const delegations = validNetworks
      .map(({ rpcUrl, registry, name })=> ({ provider: rpcUrl, address: registry, name }))
      .map((network: NetworkConfig) => this.delegateOnBlockchain(network, identity, delegateDID, validity));

    // PromiseConstructor.allSettled<any>(values: any) should be an array ,but is a single value 
    const settledDelegations: any = await Promise.allSettled(delegations);

    return settledDelegations.map((result, index) => ({
      network: validNetworks[index].name,
      ...result,
    }));
  }

  /**
   * Given a blockchain and an issuer, validate the delegate
   * @param {NetworkConfig} blockchainToConnect 
   * @param {String} identityAddr 
   * @param {String} delegateAddr 
   */
  private async validateOnBlockchain(blockchainToConnect: NetworkConfig, identityAddr: string, delegateAddr: string): Promise<boolean> {
    const provider = new Web3.providers.HttpProvider(
      blockchainToConnect.provider
    );
    const web3 = new Web3(provider);

    await this.onlySynced(web3);
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
   * validate if delegateDID is delegate of identityDID
   * @param {Identity}  identityDID
   * @param {string}  delegateDID
   */
  async validDelegate(identityDID: string, delegateDID: string): Promise<boolean> {
    const identityAddr = BlockchainManager.getDidAddress(identityDID);
    const delegateAddr = BlockchainManager.getDidAddress(delegateDID);
    const blockchain = BlockchainManager.getDidBlockchain(delegateDID);

    if (blockchain) {
      const blockchainToConnect: NetworkConfig = blockChainSelector(
        this.config.providerConfig.networks,
        delegateDID
      );
      return this.validateOnBlockchain(blockchainToConnect, identityAddr, delegateAddr);
    };

    const validations = this.config.providerConfig.networks.map(network => {
      const blockchainToConnect: NetworkConfig = {
        provider: network.rpcUrl,
        address: network.registry,
        name: network.name,
      };
      return this.validateOnBlockchain(
        blockchainToConnect, 
        identityAddr, 
        delegateAddr
      );
    });
    let responses: any;
    await Promise.allSettled(validations)
      .then((results) => responses = results);
    return responses.some(result => result.value === true);
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
  /**
   * Waring: Use verifyJWT. Decodes a token and returns the contet.
   * @param {string}  jwt
   */
  async decodeJWT(jwt) {
    return didJWT.decodeJWT(jwt);
  }
  
  /**
   * genera un certificado asociando la informacion recibida en "subject" con el did
   * @param {string} subjectDid This did has this prefix always (did:ethr:) it doesn't change
   * @param {string} subjectPayload 
   * @param {Date} expirationDate 
   * @param {string} issuerDid The issuer might change and has different prefixes
   * @param {string} issuerPkey 
   */
  async createCredential(
    subjectDid,
    subjectPayload,
    expirationDate,
    issuerDid,
    issuerPkey
  ): Promise<string> {
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

  /**
   * Verifies a credential using the universal resolver and verifies issuer
   * @param {string} jwt Credential encoded as jwt
   * @param {string} IdentityDid  Central entity DID, usually DIDI
   */
  async verifyCredential(jwt: string, IdentityDid?: string): Promise<CredentialVerificationResponse> {
    const credentialVerification =  verifyCredential(jwt, this.didResolver);
    if(!IdentityDid) return credentialVerification;

    const isIssuerValid = this.validDelegate(IdentityDid, credentialVerification.issuer);
     return {
      isIssuerValid,
       ...credentialVerification,
     }
  }

  /**
   * Given an prefix, genereates new privte and public keys. 
   * @param {string}  prefixToAdd
   */
  createIdentity(prefixToAdd: string = '') {
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

  /**
   * Given a blockchain revoke a delegate
   * @param {NetworkConfig} blockchainToConnect 
   * @param {string} delegatedDID 
   * @param {Identity} issuerCredentials 
   */
  private async revokeOnBlockchain(blockchainToConnect: NetworkConfig, delegatedDID: string, issuerCredentials: Identity) {
    const sourceAddress = BlockchainManager.getDidAddress(issuerCredentials.did);
    const targetAddress = BlockchainManager.getDidAddress(delegatedDID);

    const provider = new Web3.providers.HttpProvider(
      blockchainToConnect.provider
    );
    const web3 = new Web3(provider);

    const options: Options = { from: sourceAddress };

    const contract = BlockchainManager.getDidContract(
      options,
      blockchainToConnect.address,
      web3
    );

    const account = web3.eth.accounts.privateKeyToAccount(
      issuerCredentials.privateKey
    );
    web3.eth.accounts.wallet.add(account);

    const revokeDelegateMethod = contract.methods.revokeDelegate(
      sourceAddress,
      BlockchainManager.delegateType,
      targetAddress
    );
    options.gas = await this.getGasLimit(revokeDelegateMethod, options);
    options.gasPrice = await this.getGasPrice(web3);
    options.nonce = blockchainToConnect.name !== 'lacchain' ? await web3.eth.getTransactionCount(sourceAddress, 'pending'): undefined;
    let revokeMethodSent;
    try {
      revokeMethodSent = await revokeDelegateMethod.send(options);
    } catch (e) {
      if (this.isUnknownError(e)) { 
        throw e;
      }
      revokeMethodSent = await this.revokeDelegate(issuerCredentials, delegatedDID)
    }
    web3.eth.accounts.wallet.remove(account.address);
    return revokeMethodSent;    
  }

  /**
   * Revoke delegation
   * @param {Identity}  issuerCredentials
   * @param {string}  delegatedDID
   */
  async revokeDelegate(issuerCredentials, delegatedDID): Promise<OperationResponse[]> {
    const blockchain = BlockchainManager.getDidBlockchain(delegatedDID);

    if (blockchain) {
      const blockchainToConnect: NetworkConfig = blockChainSelector(
        this.config.providerConfig.networks,
        delegatedDID
      );
      const revoke: any = await Promise.allSettled([this.revokeOnBlockchain(blockchainToConnect, delegatedDID, issuerCredentials)])
      revoke[0].network = blockchainToConnect.name;
      return revoke;
    }

    const validNetworks = this.config.providerConfig.networks.filter(({ name }) => !!name);
    const delegations = validNetworks
      .map(({ rpcUrl, registry, name })=> ({ provider: rpcUrl, address: registry, name }))
      .map((network: NetworkConfig) => this.revokeOnBlockchain(network, delegatedDID, issuerCredentials));

    // PromiseConstructor.allSettled<any>(values: any) should be an array ,but is a single value 
    const settledDelegations: any = await Promise.allSettled(delegations);

    return settledDelegations.map((result, index) => ({
      network: validNetworks[index].name,
      ...result,
    }));
  }

  /**
   * We dont want to bump txs. This only happen if simultaneous tx are sent, this resend recursively 
   * the tx increasing nonce by one
   * @param error
   */
  isUnknownError(error) {
    return !(error.message.includes('gas price not enough to bump transaction')
    || error.message.includes('transaction underpriced')
    || error.message.includes('too low') 
    || error.message.includes('too high'))
  }
}
