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
  });

  it("sets totalSupply on deployment", async () => {
    const totalSupply = await this.tokenInstance.totalSupply();
    assert.equal(totalSupply.toNumber(), 1000000, "doesn't set totalSupply to 1000000");

    const adminBalance = await tokenInstance.balanceOf(accounts[0]);
    assert(adminBalance.toNumber(), 1000000, "Admin account balance is not 1000000");
  });

  it("transfers ownership of tokens", async () => {
    this.tokenInstance.transfer
      .call(accounts[1], 999999999)
      .then(assert.fail)
      .catch(function(error) {
        assert(error.message.indexOf("revert") >= 0, "error must contain revert");
      });

    const success = await this.tokenInstance.transfer.call(accounts[1], 250000);
    assert(success, true, "it returns true if successful");

    // receipt contains events emitted
    const receipt = await this.tokenInstance.transfer(accounts[1], 250000);
    assert.equal(receipt.logs.length, 1, "there must be one event");
    assert.equal(receipt.logs[0].event, "Transfer", "must be Transfer event");
    assert.equal(receipt.logs[0].args._from, accounts[0], "logs sender account");
    assert.equal(receipt.logs[0].args._to, accounts[1], "logs receiver account");
    assert.equal(receipt.logs[0].args._value, 250000, "logs transfer amount");

    const receiverBalance = await this.tokenInstance.balanceOf(accounts[1]);
    assert(receiverBalance, 250000, "tokens not added to receiver account");

    const senderBalance = await this.tokenInstance.balanceOf(accounts[0]);
    assert(senderBalance, 750000, "tokens not deducted from sender account");
  });

  it("approves tokens for delegated transfer", async () => {
    const success = await this.tokenInstance.approve.call(accounts[1], 100);
    assert.equal(success, true, "it returns true if successful");

    const receipt = await this.tokenInstance.approve(accounts[1], 100);
    assert.equal(receipt.logs.length, 1, "there must be one event");
    assert.equal(receipt.logs[0].event, "Approval", "must be Approval event");
    assert.equal(receipt.logs[0].args._owner, accounts[0], "logs owner account");
    assert.equal(receipt.logs[0].args._spender, accounts[1], "logs spender account");
    assert.equal(receipt.logs[0].args._value, 100, "logs allowance amount");

    const allowance = await tokenInstance.allowance(accounts[0], accounts[1]);
    assert.equal(allowance.toNumber(), 100, "allowance not set correctly");
  });

  it("performs delegated transfers", async () => {
    fromAccount = accounts[2];
    toAccount = accounts[3];
    spenderAccount = accounts[4];

    // Send init balance tokens to fromAccount
    await this.tokenInstance.transfer(fromAccount, 100, { from: accounts[0] });

    // Approve spenderAccount to transfer max 10 tokens fromAccount -> toAccount
    await this.tokenInstance.approve(spenderAccount, 10, { from: fromAccount });

    // Try transferFrom tokens more than fromAccount balance
    this.tokenInstance
      .transferFrom(fromAccount, toAccount, 999, { from: spenderAccount })
      .then(assert.fail)
      .catch(function(error) {
        assert(error.message.indexOf("revert") >= 0, "error must contain revert");
        // Try transferFrom tokens more than allowance
        return tokenInstance.transferFrom(fromAccount, toAccount, 20, { from: spenderAccount });
      })
      .then(assert.fail)
      .catch(function(error) {
        assert(error.message.indexOf("revert") >= 0, "error must contain revert");
      });

    // Check if true returned
    const success = await this.tokenInstance.transferFrom.call(fromAccount, toAccount, 10, { from: spenderAccount });
    assert.equal(success, true);

    const receipt = await this.tokenInstance.transferFrom(fromAccount, toAccount, 10, { from: spenderAccount });
    assert.equal(receipt.logs.length, 1, "there must be one event");
    assert.equal(receipt.logs[0].event, "Transfer", "must be Transfer event");
    assert.equal(receipt.logs[0].args._from, fromAccount, "logs sender account");
    assert.equal(receipt.logs[0].args._to, toAccount, "logs receiver account");
    assert.equal(receipt.logs[0].args._value, 10, "logs transfer amount");

    const senderBalance = await this.tokenInstance.balanceOf(fromAccount);
    assert.equal(senderBalance.toNumber(), 90, "tokens not deducted from sender account");

    const receiverBalance = await this.tokenInstance.balanceOf(toAccount);
    assert.equal(receiverBalance.toNumber(), 10, "tokens not added to receiver account");

    const allowance = await this.tokenInstance.allowance(fromAccount, spenderAccount);
    assert.equal(allowance.toNumber(), 0, "allowance not updated");
  });
});
