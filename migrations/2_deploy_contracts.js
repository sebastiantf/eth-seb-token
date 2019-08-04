const SebToken = artifacts.require("./SebToken.sol");
const SebTokenSale = artifacts.require("./SebTokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(SebToken, 1000000);
  deployer.deploy(SebTokenSale);
};
