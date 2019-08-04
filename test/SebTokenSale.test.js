const SebTokenSale = artifacts.require("./SebTokenSale.sol");

contract("SebTokenSale", function(accounts) {
  var tokenPrice = 1000000000000000; // Token price in wei = 0.001 ETH
  it("deploys and initializes correctly", function() {
    return SebTokenSale.deployed()
      .then(function(i) {
        tokenSaleInstance = i;
        return tokenSaleInstance.address;
      })
      .then(function(address) {
        assert.notEqual(address, "0x0", "does not have contract address");
        return tokenSaleInstance.tokenContract();
      })
      .then(function(tokenContractAddress) {
        assert.notEqual(tokenContractAddress, "0x0", "does not have token contract reference/address");
        return tokenSaleInstance.tokenPrice();
      })
      .then(function(price) {
        assert.equal(price, tokenPrice, "token price is not set");
      });
  });
});
