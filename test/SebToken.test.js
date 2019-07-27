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

  it("transfers ownership of tokens", function() {
    return SebToken.deployed()
      .then(function(i) {
        tokenInstance = i;
        return tokenInstance.transfer.call(accounts[1], 999999999);
      })
      .then(assert.fail)
      .catch(function(error) {
        assert(error.message.indexOf("revert") >= 0, "error must contain revert");
        return tokenInstance.transfer(accounts[1], 250000);
      })
      .then(function(receipt) {
        assert.equal(receipt.logs.length, 1, "there must be one event");
        assert.equal(receipt.logs[0].event, "Transfer", "must be Transfer event");
        assert.equal(receipt.logs[0].args._from, accounts[0], "logs sender account");
        assert.equal(receipt.logs[0].args._to, accounts[1], "logs receiver account");
        assert.equal(receipt.logs[0].args._value, 250000, "logs transfer amount");
        return tokenInstance.balanceOf(accounts[1]);
      })
      .then(function(receiverBalance) {
        assert(receiverBalance, 250000, "tokens not added to receiver account");
        return tokenInstance.balanceOf(accounts[0]);
      })
      .then(function(senderBalance) {
        assert(senderBalance, 750000, "tokens not deducted from sender account");
      });
  });
});
