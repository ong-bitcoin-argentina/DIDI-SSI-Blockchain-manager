/// /////////////////////////////////////////////////////////////////////////////////
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
// - addDelegate                                                                  //
// - validateDelegate                                                             //
// - revokeDelegate                                                               //
//                                                                                //
// To run these tests you must have a DELEGATOR DID address and its private key   //
// with some $$$ in it, to execute the transaction and pay the fee.               //
// This info must be added also in the .env file. (check out README file)         //
/// /////////////////////////////////////////////////////////////////////////////////

import { BlockchainManager } from '../src/BlockchainManager';

const Constants = require('./constants/Constants');
const { addPrefix } = require('../src/BlockchainManager');
const {
  initializeBlockchainManager,
  createIdentity,
} = require('./utils/utils');

const config = {
  gasPrice: 10000,
  providerConfig: Constants.BLOCKCHAIN.PROVIDER_CONFIG,
};

const blockchainManager: BlockchainManager =
  initializeBlockchainManager(config);

const issuerIdentity = {
  did: process.env.DELEGATOR_DID,
  privateKey: process.env.DELEGATOR_PRIV_KEY,
};

async function addDelegation(prefixToAdd, delegateIdentity) {
  const { did } = delegateIdentity;
  const withPrefixDid = addPrefix(prefixToAdd, did);

  const delegateTx = await blockchainManager.addDelegate(
    issuerIdentity,
    withPrefixDid,
    '1000',
  );
  return delegateTx;
}

describe('blockchainManager Delegation', () => {
  describe('on ANY blochchain should', () => {
    const delegateIdentity = createIdentity();
    it('be able to delegate did without prefix', async () => {
      expect.assertions(1);
      const prefixToAdd = '';
      const delegateTxs = await addDelegation(prefixToAdd, delegateIdentity);
      delegateTxs.forEach(({ network, status }) => {
        const expectedStatus =
          network === 'mainnet' || network === 'goerli'
            ? 'rejected'
            : 'fulfilled';
        expect(status).toBe(expectedStatus);
      });
    });

    it('fail when invalid prefix is received', async () => {
      expect.assertions(1);
      const prefixToAdd = 'invalid:';
      try {
        await addDelegation(prefixToAdd, delegateIdentity);
      } catch (error) {
        expect(error).toBe('Invalid Provider Prefix');
      }
    });

    it('verify delegation', async () => {
      expect.assertions(1);
      const validatedDelegate = await blockchainManager.validDelegate(
        issuerIdentity.did,
        delegateIdentity.did,
      );
      expect(validatedDelegate).toBeTruthy();
    });

    it('fail to revoke delegation on Mainnet due to insufficients funds', async () => {
      expect.assertions(8);
      const revokeTxs = await blockchainManager.revokeDelegate(
        issuerIdentity,
        delegateIdentity.did,
      );

      revokeTxs.forEach(({ network, status }) => {
        const expectedStatus =
          network === 'mainnet' || network === 'goerli'
            ? 'rejected'
            : 'fulfilled';
        expect(status).toBe(expectedStatus);
      });
    });

    it('fail verification due to revoked delegation on all networks', async () => {
      expect.assertions(1);
      const validatedDelegate = await blockchainManager.validDelegate(
        issuerIdentity.did,
        delegateIdentity.did,
      );
      expect(validatedDelegate).toBeFalsy();
    });

    it('fail verification when delegation does not exists on all networks', async () => {
      expect.assertions(1);
      const otherIdentity = createIdentity();
      const validatedDelegate = await blockchainManager.validDelegate(
        issuerIdentity.did,
        otherIdentity.did,
      );
      expect(validatedDelegate).toBeFalsy();
    });
  });

  describe('on MAINNET should', () => {
    const delegateIdentity = createIdentity();

    it('fail delegation due to insufficient funds for gas on MAINNET', async () => {
      expect.assertions(1);
      const prefixToAdd = 'mainnet:';
      try {
        await addDelegation(prefixToAdd, delegateIdentity);
      } catch (error) {
        expect(
          error.message.includes('insufficient funds for gas * price + value'),
        ).toBeTruthy();
      }
    });

    it('fail verification on MAINNET', async () => {
      expect.assertions(1);
      const prefixToAdd = 'mainnet:';
      const prefixAddedDid = addPrefix(prefixToAdd, delegateIdentity.did);
      try {
        await blockchainManager.validDelegate(
          issuerIdentity.did,
          prefixAddedDid,
        );
      } catch (error) {
        expect(
          error.message.includes('All promises were rejected'),
        ).toBeTruthy();
      }
    });

    it('revoke delegation on MAINNET', async () => {
      expect.assertions(2);
      const prefixToAdd = 'mainnet:';
      const prefixAddedDid = addPrefix(prefixToAdd, delegateIdentity.did);
      const [revoke] = await blockchainManager.revokeDelegate(issuerIdentity, prefixAddedDid);
      expect(revoke.status).toBe('rejected'); // not gas
      expect(
        revoke.value.message.includes('insufficient funds for gas * price + value'),
      ).toBeTruthy();
    });
  });

  describe('on RSK should', () => {
    const delegateIdentity = createIdentity();

    it('be able to addDelegate on RSK', async () => {
      expect.assertions(11);
      const prefixToAdd = 'rsk:';
      const response = await addDelegation(prefixToAdd, delegateIdentity);
      expect(response[0].status).toBe('fulfilled');
      expect(response[0].network).toBe('rsk');
      expect(response[0].value).toBeDefined();
    });

    it('be able to addDelegate 3 times simultaneously on RSK', async () => {
      expect.assertions(9);
      const prefixToAdd = 'rsk:';
      const delegateTxs = [];
      for (let i = 0; i < 3; i += 1) {
        delegateTxs[i] = addDelegation(prefixToAdd, createIdentity());
      }

      const delegtions = await Promise.all(delegateTxs);
      for (let i = 0; i < 3; i += 1) {
        expect(delegtions[i][0].status).toBe('fulfilled');
        expect(delegtions[i][0].network).toBe('rsk');
        expect(delegtions[i][0].value).toBeDefined();
      }
    });

    it('verify delegation on RSK', async () => {
      expect.assertions(1);
      const prefixToAdd = 'rsk:';
      const prefixAddedDid = addPrefix(prefixToAdd, delegateIdentity.did);
      const validatedDelegate = await blockchainManager.validDelegate(
        issuerIdentity.did,
        prefixAddedDid,
      );
      expect(validatedDelegate).toBeTruthy();
    });

    it('revoke delegation on RSK', async () => {
      expect.assertions(4);
      const prefixToAdd = 'rsk:';
      const prefixAddedDid = addPrefix(prefixToAdd, delegateIdentity.did);
      const response = await blockchainManager.revokeDelegate(
        issuerIdentity,
        prefixAddedDid,
      );

      expect(response[0].status).toBe('fulfilled');
      expect(response[0].network).toBe('rsk');
      expect(response[0].value).toBeDefined();

      const { validTo } =
        response[0].value.events.DIDDelegateChanged.returnValues;
      expect(parseInt(validTo, 10) - Date.now() / 1000).toBeLessThan(500);
    });

    it('fail verification due to revoked delegation on RSK', async () => {
      expect.assertions(1);
      const prefixToAdd = 'rsk:';
      const prefixAddedDid = addPrefix(prefixToAdd, delegateIdentity.did);
      const validatedDelegate = await blockchainManager.validDelegate(
        issuerIdentity.did,
        prefixAddedDid,
      );
      expect(validatedDelegate).toBeFalsy();
    });

    it('fail verification when delegation does not exists on RSK', async () => {
      expect.assertions(1);
      const otherIdentity = createIdentity();
      const prefixToAdd = 'rsk:';
      const prefixAddedDid = addPrefix(prefixToAdd, otherIdentity.did);
      const validatedDelegate = await blockchainManager.validDelegate(
        issuerIdentity.did,
        prefixAddedDid,
      );
      expect(validatedDelegate).toBeFalsy();
    });
  });

  describe('on LACCHAIN should', () => {
    const delegateIdentity = createIdentity();

    it('be able to addDelegate on LACCHAIN', async () => {
      expect.assertions(3);
      const prefixToAdd = 'lacchain:';
      const response = await addDelegation(prefixToAdd, delegateIdentity);
      expect(response[0].status).toBe('fulfilled');
      expect(response[0].network).toBe('lacchain');
      expect(response[0].value).toBeDefined();
    });

    it('be able to addDelegate 3 times simultaneously on LACCHAIN', async () => {
      expect.assertions(9);
      const prefixToAdd = 'lacchain:';
      const delegateTxs = [];
      for (let i = 0; i < 3; i += 1) {
        delegateTxs[i] = addDelegation(prefixToAdd, createIdentity());
      }

      const delegtions = await Promise.all(delegateTxs);
      for (let i = 0; i < 3; i += 1) {
        expect(delegtions[i][0].status).toBe('fulfilled');
        expect(delegtions[i][0].network).toBe('lacchain');
        expect(delegtions[i][0].network).toBeDefined();
      }
    });

    it('verify delegation on LACCHAIN', async () => {
      expect.assertions(1);
      const prefixToAdd = 'lacchain:';
      const prefixAddedDid = addPrefix(prefixToAdd, delegateIdentity.did);
      const validatedDelegate = await blockchainManager.validDelegate(
        issuerIdentity.did,
        prefixAddedDid,
      );
      expect(validatedDelegate).toBeTruthy();
    });

    it('revoke delegation on LACCHAIN', async () => {
      expect.assertions(4);
      const prefixToAdd = 'lacchain:';
      const prefixAddedDid = addPrefix(prefixToAdd, delegateIdentity.did);
      const response = await blockchainManager.revokeDelegate(
        issuerIdentity,
        prefixAddedDid,
      );

      expect(response[0].status).toBe('fulfilled');
      expect(response[0].network).toBe('lacchain');
      expect(response[0].value).toBeDefined();

      const { validTo } =
        response[0].value.events.DIDDelegateChanged.returnValues;
      expect(parseInt(validTo, 10) - Date.now() / 1000).toBeLessThan(500);
    });

    it('fail verification due to revoked delegation on LACCHAIN', async () => {
      expect.assertions(1);
      const prefixToAdd = 'lacchain:';
      const prefixAddedDid = addPrefix(prefixToAdd, delegateIdentity.did);
      const validatedDelegate = await blockchainManager.validDelegate(
        issuerIdentity.did,
        prefixAddedDid,
      );
      expect(validatedDelegate).toBeFalsy();
    });

    it('fail verification when delegation does not exists on LACCHAIN', async () => {
      expect.assertions(1);
      const otherIdentity = createIdentity();
      const prefixToAdd = 'lacchain:';
      const prefixAddedDid = addPrefix(prefixToAdd, otherIdentity.did);
      const validatedDelegate = await blockchainManager.validDelegate(
        issuerIdentity.did,
        prefixAddedDid,
      );
      expect(validatedDelegate).toBeFalsy();
    });
  });

  describe('on BFA should', () => {
    const delegateIdentity = createIdentity();

    it('be able to addDelegate on BFA', async () => {
      expect.assertions(3);
      const prefixToAdd = 'bfa:';
      const response = await addDelegation(prefixToAdd, delegateIdentity);
      expect(response[0].status).toBe('fulfilled');
      expect(response[0].network).toBe('bfa');
      expect(response[0].value).toBeDefined();
    });

    it('be able to addDelegate 3 times simultaneously on BFA', async () => {
      expect.assertions(9);
      const prefixToAdd = 'bfa:';
      const delegateTxs = [];
      for (let i = 0; i < 3; i += 1) {
        delegateTxs[i] = addDelegation(prefixToAdd, createIdentity());
      }

      const delegtions = await Promise.all(delegateTxs);
      for (let i = 0; i < 3; i += 1) {
        expect(delegtions[i][0].status).toBe('fulfilled');
        expect(delegtions[i][0].network).toBe('bfa');
        expect(delegtions[i][0].network).toBeDefined();
      }
    });

    it('verify delegation on BFA', async () => {
      expect.assertions(1);
      const prefixToAdd = 'bfa:';
      const prefixAddedDid = addPrefix(prefixToAdd, delegateIdentity.did);
      const validatedDelegate = await blockchainManager.validDelegate(
        issuerIdentity.did,
        prefixAddedDid,
      );
      expect(validatedDelegate).toBeTruthy();
    });

    it('revoke delegation on BFA', async () => {
      expect.assertions(4);
      const prefixToAdd = 'bfa:';
      const prefixAddedDid = addPrefix(prefixToAdd, delegateIdentity.did);
      const response = await blockchainManager.revokeDelegate(
        issuerIdentity,
        prefixAddedDid,
      );

      expect(response[0].status).toBe('fulfilled');
      expect(response[0].network).toBe('bfa');
      expect(response[0].value).toBeDefined();

      const { validTo } =
        response[0].value.events.DIDDelegateChanged.returnValues;
      expect(parseInt(validTo, 10) - Date.now() / 1000).toBeLessThan(500);
    });

    it('fail verification due to revoked delegation on BFA', async () => {
      expect.assertions(1);
      const prefixToAdd = 'bfa:';
      const prefixAddedDid = addPrefix(prefixToAdd, delegateIdentity.did);
      const validatedDelegate = await blockchainManager.validDelegate(
        issuerIdentity.did,
        prefixAddedDid,
      );

      expect(validatedDelegate).toBeFalsy();
    });

    it('fail verification when delegation does not exists on BFA', async () => {
      expect.assertions(1);
      const otherIdentity = createIdentity();
      const prefixToAdd = 'bfa:';
      const prefixAddedDid = addPrefix(prefixToAdd, otherIdentity.did);
      const validatedDelegate = await blockchainManager.validDelegate(
        issuerIdentity.did,
        prefixAddedDid,
      );
      expect(validatedDelegate).toBeFalsy();
    });
  });
});
