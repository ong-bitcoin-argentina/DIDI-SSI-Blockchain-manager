import { BlockchainManager } from "../../src/BlockchainManager";
const { Credentials } = require("uport-credentials");


export function initializeBlockchainManager(config): BlockchainManager  {
  const blockchainManager = new BlockchainManager(config);
  return blockchainManager;
}

export function createIdentity() {
  const identity = Credentials.createIdentity();
  return identity;
}
