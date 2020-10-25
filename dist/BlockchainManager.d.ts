import { Resolver } from "did-resolver";
interface BlockchainManagerConfig {
    gasPrice: number;
    providerConfig: any;
}
interface Identity {
    did: string;
    privateKey: string;
}
export declare class BlockchainManager {
    config: BlockchainManagerConfig;
    didResolver: Resolver;
    gas_increment: number;
    constructor(config: BlockchainManagerConfig, gas_increment: number);
    static delegateType: any;
    /**
     * Get the minimum gas price for the given method and options
     * @returns {number}
     */
    getGasPrice(): Promise<number>;
    /**
     * Get gas limit given the method and options
     * @returns {number}
     */
    getGasLimit(method: any, options: any): Promise<number>;
    /**
     * Obtains the ethr-did-registry contract
     * @param options
     * @returns {Contract}
     */
    static getDidContract(options: any): any;
    /**
     * Returns the address of the DID
     * @param {string}  did  Did to extract the address from
     * @returns {string}
     */
    static getDidAddress(did: string): string;
    /**
     * Add delegateDID as a delegate of identity
     * @param {Identity}  identity
     * @param {string}  delegateDID
     * @param {string}  validity
     */
    addDelegate(identity: Identity, delegateDID: string, validity: string): Promise<any>;
    /**
     * validate if delegateDID is delegate of identity
     * @param {Identity}  identity
     * @param {string}  delegateDID
     */
    validateDelegate(identity: string, delegateDID: string): Promise<any>;
    /**
     * Resolve a DID document
     * @param {string} did DID to resolve its document
     */
    resolveDidDocument(did: string): Promise<import("did-resolver").DIDDocument>;
    /**
     * Creates a JWT from a base payload with the information to encode
     * @param {string}  issuerDid  Issuer DID
     * @param {object}  payload  Information of the JWT
     * @param {string}  pkey  Information of the PK
     * @param {number}  expiration  Expiration of the JWT in [NumericDate]{@link https://tools.ietf.org/html/rfc7519#section-2}
     * @param {string}  audienceDID  DID of the audience of the JWT
     * @returns {string}  JWT's string
     */
    createJWT(issuerDid: string, pkey: string, payload: any, expiration?: number, audienceDID?: string): Promise<any>;
    /**
     * Creates a valid signer
     * @param {string}  privateKey  A hex encoded private key
     * @returns {Signer}  A configured signer function
     */
    getSigner(privateKey: string): any;
    /**
     * Decode a JWT string with the given audience
     * @param {string} jwt JWT to be decoded
     * @param {string} audienceDID DID of the audience if needed
     */
    verifyJWT(jwt: any, audienceDID?: any): Promise<any>;
}
export {};
//# sourceMappingURL=BlockchainManager.d.ts.map