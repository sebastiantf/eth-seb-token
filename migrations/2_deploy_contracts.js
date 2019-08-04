const SebToken = artifacts.require("./SebToken.sol");
const SebTokenSale = artifacts.require("./SebTokenSale.sol");

module.exports = function(deployer) {
  deployer.deploy(SebToken, 1000000).then(function() {
    var tokenPrice = 1000000000000000; // Token price in wei = 0.001 ETH
    return deployer.deploy(SebTokenSale, SebToken.address, tokenPrice);
  });
};
