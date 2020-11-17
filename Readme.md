# Blockchain manager

This library is intented to support multiblockchain configuration for the functionalities provided by uPort libraries ([here](https://github.com/uport-project/ethr-did-registry#contract-deployments)). 
Based on the received DID and its prefix, it will select the blockchain to connect and support the uPort functions.
Below there is a description of how to implement it.

<hr style="border:1px solid gray"> </hr>

## Class Name
**BlockchainManagerConfig**


### Parameters to instanciate the class

The class takes two parameters:
* An object containing: { gasPrice: number, providerConfig: { object: PROVIDER_CONFIG} }
* The gas incremental value for safeguard the transactions: a number
    
**gasPrice**: It's the gas price. For testing purposes a value of 10000 can be safely used.

**providerConfig**: It's a JSON object containing the network configurations to use when receiving the DID.
The DIDs follow certain format and it should look like this:

    did:ethr:0x0d0fa2cd3813412e94597103dbf715c7afb8c038
    The above DID will route to the variable specified in mainnet

    did:ethr:lacchain:0x0d0fa2cd3813412e94597103dbf715c7afb8c038
    The above DID will route to the variable specified in lacchain

The **providerConfig** JSON must be similar to this: 

```
PROVIDER_CONFIG = {
  networks: [
    { 
      name: 'mainnet', 
      rpcUrl: BLOCKCHAIN_URL_MAIN, 
      registry: BLOCKCHAIN_CONTRACT_MAIN
    },
    {
      name: 'lacchain',
      rpcUrl: BLOCKCHAIN_URL_LAC,
      registry: BLOCKCHAIN_CONTRACT_LAC
    },
    {
      name: 'bfa',
      rpcUrl: BLOCKCHAIN_URL_BFA,
      registry: BLOCKCHAIN_CONTRACT_BFA
    },
    {
      name: 'rsk',
      rpcUrl: BLOCKCHAIN_URL_RSK,
      registry: BLOCKCHAIN_CONTRACT_RSK
    }
  ]
};
```
**NOTE 1:** It is important to put the prefix on the DID, equal to the one in the JSON name attribute in order to route right. (for mainnet, no prefix must be entered)

**NOTE 2:** All of these variables must be defined in the `.env` file in the root folder.


**Gas Increment** value to increase the gas in the transaction for safeguard. By default is 1.1 (10%). This value can be defined in 
the ENV file as *GAS_INCREMENT*

<hr style="border:1px solid gray"> </hr>

### **M E T H O D S** 

#### METHOD: **addDelegate**
This method will add a delegation from the issuer to a certain address to be the new signer. It will write the transaction in the blockchain

It will receive:
* identity
* delegateDID
* validity

**identity**: a JSON object containing the ISSUER DID and its private key

```
issuerIdentity = {
  did: process.env.TEST_ISSUER_DID,
  privateKey: process.env.TEST_ISSUER_PRIV_KEY,
};
```
<br>

**delegateDID**: a STRING containing the DID with the correct prefix to route into that specific blockchain

    did:ethr:rsk:0x0d0fa2cd3813412e94597103dbf715c7afb8c038
    The above DID will route to the variable specified in rsk
<br>

**validity**: a NUMBER with the amount of time will last the delegation until expired 

More info [here](https://developer.uport.me/ethr-did/docs/guides/index#manage-keys)
<hr style="border:1px solid gray"> </hr>

#### METHOD: **validateDelegate**
This method will validate a previous delegation written in the blockchain

It will receive:
* identity
* delegateDID

**identity**: a STRING containing an address, the ISSUER  
**delegateDID**: a STRING containing an address, the DELEGATED  

More info [here](https://developer.uport.me/ethr-did/docs/guides/index#manage-keys)
<hr style="border:1px solid gray"> </hr>

#### METHOD: **resolveDidDocument**
This methor will resolve the DID document entered as a parameter.

It will receive:
* did

**did**: It's the did to resolve with the prefix to route

    did:ethr:rsk:0x0d0fa2cd3813412e94597103dbf715c7afb8c038

When instanciating the CLASS the providerConfig object was already passed, so the method has the information to route correctly.

More info [here](https://developer.uport.me/ethr-did/docs/reference/index#did-method)
<hr style="border:1px solid gray"> </hr>

#### METHOD: **createJWT**
This method will create a JWT 

It will receive:
* issuerDid
* pkey
* payload
* expiration (optional)
* audienceDID (optional)

**issuerDid**: a STRING with the did of the issuer  
**pkey**: a STRING with the private key of the issuer  
**payload**: any payload  
**expiration**: a NUMBER containing the time to expire of the web token  
**audience**: a STRING - TBD  

More info [here](https://developer.uport.me/ethr-did/docs/guides/index#manage-keys)
<hr style="border:1px solid gray"> </hr>

#### METHOD: **verifyJWT**
This method will verify a JWT

It will receive:
* JWT
* audienceDID (optional)

**JWT**: a JWT to be decoded
<br>
**audience**: a STRING - TBD

More info [here](https://developer.uport.me/ethr-did/docs/guides/index#manage-keys)
<hr style="border:1px solid gray"> </hr>

#### METHOD: **decodeJWT**
This method will decode a JWT

It will receive:
* JWT

More Info [here](https://github.com/decentralized-identity/did-jwt)

<hr style="border:1px solid gray"> </hr>

#### METHOD: **createCertificate**
Signs and returns a JWT from a created credential

It will receive:
* Subject Did
* Subject Credential
* Expiration Date
* Issuer Did
* issuer PrivateKey

**Subject Did**: Did of the subject of the credential
**Expiration Date**: Expiration date of the credential
**Issuer Did**: Issuer of the Credential
**Issuer PrivateKey**: Private Key of the Issuer
**Subject Credential**: an object containing the data of the credential as below
```
const personData = {
  dni: 12345678,
  names: "Homero",
  lastNames: "Simpson",
  nationality: "Argentina",
};
```
```
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
```

More Info [here](https://github.com/decentralized-identity/did-jwt-vc)

<hr style="border:1px solid gray"> </hr>

#### METHOD: **verifyCertificate**
Verifies a created Certificate

It will receive:
* JWT of the created certificate

<hr style="border:1px solid gray"> </hr>

#### METHOD: **createIdentity**
Create an Identity with DID and Private KEY

It will receive:
* Prefix to add for the Did

Returns:
* ```did:ethr:lacchain:0xdca7ef03e98e0dc2b855be647c39abe984ffg32c``` If the prefix is ```lacchain```
* ```did:ethr:rsk:0xdca7ef03e98e0dc2b855be647c39abe984ffg32c``` If the prefix is ```rsk```

<hr style="border:1px solid gray"> </hr>