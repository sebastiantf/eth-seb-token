// Run the following code in truffle console to provision the initial tokens to the SebTokenSale contract
// buyTokens() won't work if this isn't performed beforehand
// NOTE: This code is not intended to be run independently

sebToken = await SebToken.deployed();
sebTokenSale = await SebTokenSale.deployed();

var provisionedTokens = 750000;
accounts = await web3.eth.getAccounts();
admin = accounts[0];

sebToken.transfer(sebTokenSale.address, provisionedTokens, { from: admin });
