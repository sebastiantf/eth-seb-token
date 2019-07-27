const SebToken = artifacts.require("./SebToken.sol");

contract("SebToken", function() {
  it("sets totalSupply on deployment", function() {
    return SebToken.deployed()
      .then(function(i) {
        tokenInstance = i;
        return tokenInstance.totalSupply();
      })
      .then(function(totalSupply) {
        assert.equal(
          totalSupply.toNumber(),
          1000000,
          "doesn't set totalSupply to 1000000"
        );
      });
  });
});
