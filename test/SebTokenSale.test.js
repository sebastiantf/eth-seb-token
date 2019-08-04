const SebTokenSale = artifacts.require("./SebTokenSale.sol");

contract("SebTokenSale", function(accounts) {
  it("deploys and initializes correctly", function() {
    return SebTokenSale.deployed()
      .then(function(i) {
        tokenSaleInstance = i;
        return tokenSaleInstance.address;
      })
      .then(function(address) {
        assert.notEqual(address, "0x0", "does not have contract address");
      });
  });
});
