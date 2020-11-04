const { BlockchainManager } = require("../../src/BlockchainManager");
const { Credentials } = require("uport-credentials");

export function initializeBlockchainManager(config) {
  const blockchainManager = new BlockchainManager(config);
  return blockchainManager;
}

export function createIdentity() {
  const identity = Credentials.createIdentity();
  return identity;
}
