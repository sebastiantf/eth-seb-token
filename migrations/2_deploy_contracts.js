const SebToken = artifacts.require("./SebToken.sol");

module.exports = function(deployer) {
  deployer.deploy(SebToken, 1000000);
};