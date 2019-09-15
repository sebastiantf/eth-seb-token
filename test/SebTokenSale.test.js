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

    /* return SebTokenSale.deployed()
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
      }); */
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

    /* return SebToken.deployed()
      .then(function(i) {
        tokenInstance = i;
        return SebTokenSale.deployed();
      })
      .then(function(i) {
        tokenSaleInstance = i;
        // Provision some tokens for tokenSale contract
        return tokenInstance.transfer(tokenSaleInstance.address, provisionedTokens, { from: admin });
      })
      .then(function(receipt) {
        return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: value });
      })
      .then(function(receipt) {
        assert.equal(receipt.logs.length, 1, "there must be one event");
        assert.equal(receipt.logs[0].event, "Sell", "must be Sell event");
        assert.equal(receipt.logs[0].args._buyer, buyer, "logs buyer account");
        assert.equal(receipt.logs[0].args._numberOfTokens, numberOfTokens, "logs numberOfTokens");
        return tokenSaleInstance.tokensSold();
      })
      .then(function(sold) {
        assert.equal(sold.toNumber(), numberOfTokens, "tokensSold not equal to numberOfTokens bought");
        // Check balance of buyer and tokenSale contract updated
        return tokenInstance.balanceOf(buyer);
      })
      .then(function(buyerBalance) {
        assert.equal(buyerBalance, numberOfTokens, "balanceOf buyer not updated");
        return tokenInstance.balanceOf(tokenSaleInstance.address);
      })
      .then(function(contractBalance) {
        assert.equal(contractBalance, provisionedTokens - numberOfTokens, "balanceOf tokenSale not updated");
        // Try selling tokens different from actual ether value
        return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 });
      })
      .then(assert.fail)
      .catch(function(error) {
        assert(error.message.indexOf("revert") >= 0, "tokens and value must be equal");
        // Try buying more tokens than provisionedTokens
        return tokenSaleInstance.buyTokens(800000, { from: buyer, value: value });
      })
      .then(assert.fail)
      .catch(function(error) {
        // console.log(error.message);
        assert(error.message.indexOf("revert") >= 0, "cannot buy more tokens than provisionedTokens");
      }); */
      });
  });

  it("ends token sale", function() {
    return SebToken.deployed()
      .then(function(i) {
        tokenInstance = i;
        return SebTokenSale.deployed();
      })
      .then(function(i) {
        tokenSaleInstance = i;
        // Trying endSale by other than admin
        return tokenSaleInstance.endSale({ from: buyer });
      })
      .then(assert.fail)
      .catch(function(error) {
        assert(error.message.indexOf("revert") >= 0, "only admin can end sale");
        // Try endSale by admin
        return tokenSaleInstance.endSale({ from: admin });
      })
      .then(function(receipt) {
        return tokenInstance.balanceOf(admin);
      })
      .then(function(adminBalance) {
        assert.equal(adminBalance.toNumber(), 999990, "remaining tokens not returned to admin");
        // Check that the contract has no balance
        return tokenInstance.balanceOf(tokenSaleInstance.address);
      })
      .then(function(contractBalance) {
        assert.equal(contractBalance.toNumber(), 0);
      });
  });
});
