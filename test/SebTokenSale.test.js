const SebToken = artifacts.require("./SebToken.sol");
const SebTokenSale = artifacts.require("./SebTokenSale.sol");

contract("SebTokenSale", function(accounts) {
  before(async () => {
    this.tokenInstance = await SebToken.deployed();
    this.tokenSaleInstance = await SebTokenSale.deployed();
  });

  var tokenPrice = 1000000000000000; // Token price in wei = 0.001 ETH
  var numberOfTokens = 10;
  var buyer = accounts[1];
  var value = numberOfTokens * tokenPrice;

  var provisionedTokens = 750000;
  var admin = accounts[0];

  it("deploys and initializes correctly", async () => {
    const address = await this.tokenSaleInstance.address;
    assert.notEqual(address, "0x0", "does not have contract address");

    const tokenContractAddress = await this.tokenSaleInstance.tokenContract();
    assert.notEqual(tokenContractAddress, "0x0", "does not have token contract reference/address");

    const price = await this.tokenSaleInstance.tokenPrice();
    assert.equal(price, tokenPrice, "token price is not set");
  });

  it("facilitates buying tokens", async () => {
    // Provision some tokens for tokenSale contract
    await this.tokenInstance.transfer(tokenSaleInstance.address, provisionedTokens, { from: admin });

    const receipt = await this.tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: value });
    assert.equal(receipt.logs.length, 1, "there must be one event");
    assert.equal(receipt.logs[0].event, "Sell", "must be Sell event");
    assert.equal(receipt.logs[0].args._buyer, buyer, "logs buyer account");
    assert.equal(receipt.logs[0].args._numberOfTokens, numberOfTokens, "logs numberOfTokens");

    const sold = await this.tokenSaleInstance.tokensSold();
    assert.equal(sold.toNumber(), numberOfTokens, "tokensSold not equal to numberOfTokens bought");

    // Check balance of buyer and tokenSale contract updated
    const buyerBalance = await this.tokenInstance.balanceOf(buyer);
    assert.equal(buyerBalance, numberOfTokens, "balanceOf buyer not updated");

    const contractBalance = await this.tokenInstance.balanceOf(tokenSaleInstance.address);
    assert.equal(contractBalance, provisionedTokens - numberOfTokens, "balanceOf tokenSale not updated");

    // Try selling tokens different from actual ether value
    this.tokenSaleInstance
      .buyTokens(numberOfTokens, { from: buyer, value: 1 })
      .then(assert.fail)
      .catch(function(error) {
        assert(error.message.indexOf("revert") >= 0, "tokens and value must be equal");
      });

    // Try buying more tokens than provisionedTokens
    this.tokenSaleInstance
      .buyTokens(800000, { from: buyer, value: value })
      .then(assert.fail)
      .catch(function(error) {
        // console.log(error.message);
        assert(error.message.indexOf("revert") >= 0, "cannot buy more tokens than provisionedTokens");
      });
  });

  it("ends token sale", async () => {
    // Trying endSale by other than admin
    this.tokenSaleInstance
      .endSale({ from: buyer })
      .then(assert.fail)
      .catch(function(error) {
        assert(error.message.indexOf("revert") >= 0, "only admin can end sale");
      });

    // Try endSale by admin
    await this.tokenSaleInstance.endSale({ from: admin });

    const adminBalance = await this.tokenInstance.balanceOf(admin);
    assert.equal(adminBalance.toNumber(), 999990, "remaining tokens not returned to admin");

    // Check that the contract has no balance
    const contractBalance = await this.tokenInstance.balanceOf(tokenSaleInstance.address);
    assert.equal(contractBalance.toNumber(), 0);
  });
});
