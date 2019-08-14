App = {
  contracts: {},
  account: "0x0",
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensProvisioned: 750000,

  init: async function() {
    console.log("App initializing...");
    await App.initWeb3();
    await App.initContracts();
    await App.render();
  },

  initWeb3: async function() {
    // Update for MetaMask Privacy Mode: https://medium.com/metamask/https-medium-com-metamask-breaking-change-injecting-web3-7722797916a8
    // Modern dapp browsers...
    if (window.ethereum) {
      window.web3 = new Web3(ethereum);
      try {
        // Request account access if needed
        await ethereum.enable();
        // Accounts now exposed
      } catch (error) {
        // User denied account access...
        console.log(error.message);
      }
    }
    // Legacy dapp browsers...
    else if (window.web3) {
      window.web3 = new Web3(web3.currentProvider);
      // Accounts always exposed
    }
    // Non-dapp browsers...
    else {
      console.log("Non-Ethereum browser detected. You should consider trying MetaMask!");
    }
  },

  initContracts: async function() {
    var sebTokenSale = await $.getJSON("SebTokenSale.json");
    App.contracts.SebTokenSale = TruffleContract(sebTokenSale);
    App.contracts.SebTokenSale.setProvider(window.ethereum);

    sebTokenSale = await App.contracts.SebTokenSale.deployed();

    console.log("SebTokenSale contract address: ", sebTokenSale.address);

    var sebToken = await $.getJSON("SebToken.json");
    App.contracts.SebToken = TruffleContract(sebToken);
    App.contracts.SebToken.setProvider(window.ethereum);

    sebToken = await App.contracts.SebToken.deployed();

    console.log("SebToken contract address: ", sebToken.address);

    App.listenForEvents();
  },

  listenForEvents: async function() {
    var sebTokenSale = await App.contracts.SebTokenSale.deployed();

    sebTokenSale.Sell(
      {
        fromBlock: 0
      },
      function(error, event) {
        console.log("event triggered", event.event);
        App.render();
      }
    );

    ethereum.on("accountsChanged", function(accounts) {
      console.log("Account changed");
      App.render();
    });
  },

  render: async function() {
    if (App.loading) {
      return;
    }

    App.loading = true;

    var loader = $("#loader");
    var content = $("#content");
    content.hide();
    loader.show();

    web3.eth.getCoinbase(function(error, account) {
      if (error === null) {
        App.account = account;
        $(".account-address").html(account);
        console.log("Connected Account: ", account);
      } else {
        console.log(error);
      }
    });

    var sebTokenSaleInstance = await App.contracts.SebTokenSale.deployed();
    App.tokenPrice = await sebTokenSaleInstance.tokenPrice();
    $(".token-price").html(web3.fromWei(App.tokenPrice.toNumber(), "ether"));

    App.tokensSold = (await sebTokenSaleInstance.tokensSold()).toNumber();
    $(".tokens-sold").html(App.tokensSold);
    $(".tokens-provisioned").html(App.tokensProvisioned);

    var progressBarPercent = (App.tokensSold / App.tokensProvisioned) * 100;
    console.log("Progress: ", progressBarPercent);
    $(".progress-bar")
      .css("width", progressBarPercent + "%")
      .html(Math.ceil(progressBarPercent) + "%");

    var sebTokenInstance = await App.contracts.SebToken.deployed();
    var balance = await sebTokenInstance.balanceOf(App.account);

    console.log("Balance: ", balance.toNumber());
    $(".token-balance").html(balance.toNumber());
    App.loading = false;
    content.show();
    loader.hide();
  },

  buyTokens: async function() {
    var loader = $("#loader");
    var content = $("#content");
    content.hide();
    loader.show();

    var numberOfTokens = $("#numberOfTokens").val();

    var sebTokenSaleInstance = await App.contracts.SebTokenSale.deployed();
    await sebTokenSaleInstance.buyTokens(numberOfTokens, { from: App.account, value: numberOfTokens * App.tokenPrice, gas: 500000 });
    console.log("Tokens bought!");
    $("form").trigger("reset");
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
