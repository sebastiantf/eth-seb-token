const SebToken = artifacts.require("./SebToken.sol");

contract("SebToken", function(accounts) {
  before(async () => {
    this.tokenInstance = await SebToken.deployed();
  });

  it("initializes name and symbol", async () => {
    const name = await this.tokenInstance.name();
    assert.equal(name, "Seb Token", "does not have correct name");

    const symbol = await tokenInstance.symbol();
    assert.equal(symbol, "SEB", "does not have correct symbol");

    /* return SebToken.deployed()
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
      }); */
  });

  it("sets totalSupply on deployment", async () => {
    const totalSupply = await this.tokenInstance.totalSupply();
    assert.equal(totalSupply.toNumber(), 1000000, "doesn't set totalSupply to 1000000");

    const adminBalance = await tokenInstance.balanceOf(accounts[0]);
    assert(adminBalance.toNumber(), 1000000, "Admin account balance is not 1000000");

    /* return SebToken.deployed()
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
      }); */
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
        return tokenInstance.transfer.call(accounts[1], 250000);
      })
      .then(function(success) {
        assert(success, true, "it returns true if successful");
        return tokenInstance.transfer(accounts[1], 250000);
      }) // receipt contains events emitted
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

  it("approves tokens for delegated transfer", function() {
    return SebToken.deployed()
      .then(function(i) {
        tokenInstance = i;
        return tokenInstance.approve.call(accounts[1], 100);
      })
      .then(function(success) {
        assert.equal(success, true, "it returns true if successful");
        return tokenInstance.approve(accounts[1], 100);
      })
      .then(function(receipt) {
        assert.equal(receipt.logs.length, 1, "there must be one event");
        assert.equal(receipt.logs[0].event, "Approval", "must be Approval event");
        assert.equal(receipt.logs[0].args._owner, accounts[0], "logs owner account");
        assert.equal(receipt.logs[0].args._spender, accounts[1], "logs spender account");
        assert.equal(receipt.logs[0].args._value, 100, "logs allowance amount");
        return tokenInstance.allowance(accounts[0], accounts[1]);
      })
      .then(function(allowance) {
        assert.equal(allowance.toNumber(), 100, "allowance not set correctly");
      });
  });

  it("performs delegated transfers", function() {
    return SebToken.deployed()
      .then(function(i) {
        tokenInstance = i;
        fromAccount = accounts[2];
        toAccount = accounts[3];
        spenderAccount = accounts[4];
        // Send init balance tokens to fromAccount
        return tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });
      })
      .then(function(receipt) {
        // Approve spenderAccount to transfer max 10 tokens fromAccount -> toAccount
        return tokenInstance.approve(spenderAccount, 10, { from: fromAccount });
      })
      .then(function(receipt) {
        // Try transferFrom tokens more than fromAccount balance
        return tokenInstance.transferFrom(fromAccount, toAccount, 999, { from: spenderAccount });
      })
      .then(assert.fail)
      .catch(function(error) {
        assert(error.message.indexOf("revert") >= 0, "error must contain revert");
        // Try transferFrom tokens more than allowance
        return tokenInstance.transferFrom(fromAccount, toAccount, 20, { from: spenderAccount });
      })
      .then(assert.fail)
      .catch(function(error) {
        assert(error.message.indexOf("revert") >= 0, "error must contain revert");
        // Check if true returned
        return tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spenderAccount });
      })
      .then(function(success) {
        assert.equal(success, true);
        return tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spenderAccount });
      })
      .then(function(receipt) {
        assert.equal(receipt.logs.length, 1, "there must be one event");
        assert.equal(receipt.logs[0].event, "Transfer", "must be Transfer event");
        assert.equal(receipt.logs[0].args._from, fromAccount, "logs sender account");
        assert.equal(receipt.logs[0].args._to, toAccount, "logs receiver account");
        assert.equal(receipt.logs[0].args._value, 10, "logs transfer amount");
        return tokenInstance.balanceOf(fromAccount);
      })
      .then(function(senderBalance) {
        assert.equal(senderBalance.toNumber(), 90, "tokens not deducted from sender account");
        return tokenInstance.balanceOf(toAccount);
      })
      .then(function(receiverBalance) {
        assert.equal(receiverBalance.toNumber(), 10, "tokens not added to receiver account");
        return tokenInstance.allowance(fromAccount, spenderAccount);
      })
      .then(function(allowance) {
        assert.equal(allowance.toNumber(), 0, "allowance not updated");
      });
  });
});
