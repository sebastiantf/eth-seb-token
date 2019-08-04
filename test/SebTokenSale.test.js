const SebTokenSale = artifacts.require("./SebTokenSale.sol");

contract("SebTokenSale", function(accounts) {
  var tokenPrice = 1000000000000000; // Token price in wei = 0.001 ETH
  var numberOfTokens;
  var buyer;
  var value;

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

  it("facilitates buying tokens", function() {
    return SebTokenSale.deployed()
      .then(function(i) {
        tokenSaleInstance = i;
        buyer = accounts[1];
        numberOfTokens = 10;
        value = numberOfTokens * tokenPrice;
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
        // Try selling tokens different from actual ether value
        return tokenSaleInstance.buyTokens(numberOfTokens, { from: buyer, value: 1 });
      })
      .then(assert.fail)
      .catch(function(error) {
        assert(error.message.indexOf("revert") >= 0, "tokens and value must be equal");
      });
  });
});
