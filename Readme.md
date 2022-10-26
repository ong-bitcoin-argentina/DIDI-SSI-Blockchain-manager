# Blockchain manager

This library is intented to support multiblockchain configuration for the functionalities provided by uPort libraries ([here](https://github.com/uport-project/ethr-did-registry#contract-deployments)). 
Based on the received DID and its prefix, it will select the blockchain to connect and support the uPort functions.
Below there is a description of how to implement it.

<hr style="border:1px solid gray"> </hr>

## Class Name
**BlockchainManagerConfig**


### Parameters to instanciate the class

The class takes three parameters:
* **config**: An object containing: { gasPrice: number, providerConfig: { object: PROVIDER_CONFIG} }
* **gasSafetyValue**: A safety value to increment the gas to prevent the estimation getting short (type number)
* **gasPriceSafetyValue**: A safety value to increment the gas price for the same reason (type number)
    
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

## [Library package](https://www.npmjs.com/package/@proyecto-didi/didi-blockchain-manager)

For more information about DIDI project, see the [documentation](https://docs.didi.org.ar/docs/developers/solucion/descripcion-tecnica/arquitectura-issuer)