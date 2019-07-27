const SebToken = artifacts.require("./SebToken.sol");

contract("SebToken", function(accounts) {
  it("initializes name and symbol", function() {
    return SebToken.deployed()
      .then(function(i) {
        tokenInstance = i;
        return tokenInstance.name();
      })
      .then(function(name) {
        assert.equal(name, "Seb Token", "does not have correct name");
        return tokenInstance.symbol();
      })
      .then(function(symbol) {
        assert.equal(symbol, "SEB", "does not have correct symbol");
      });
  });

  it("sets totalSupply on deployment", function() {
    return SebToken.deployed()
      .then(function(i) {
        tokenInstance = i;
        return tokenInstance.totalSupply();
      })
      .then(function(totalSupply) {
        assert.equal(totalSupply.toNumber(), 1000000, "doesn't set totalSupply to 1000000");
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then(function(adminBalance) {
        assert(adminBalance.toNumber(), 1000000, "Admin account balance is not 1000000");
      });
  });
});
