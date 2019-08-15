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

    App.sebTokenSale = await App.contracts.SebTokenSale.deployed();

    console.log("SebTokenSale contract address: ", App.sebTokenSale.address);

    var sebToken = await $.getJSON("SebToken.json");
    App.contracts.SebToken = TruffleContract(sebToken);
    App.contracts.SebToken.setProvider(window.ethereum);

    App.sebToken = await App.contracts.SebToken.deployed();

    console.log("SebToken contract address: ", App.sebToken.address);

    App.listenForEvents();
  },

  listenForEvents: async function() {
    App.sebTokenSale.Sell(
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

    App.tokenPrice = await App.sebTokenSale.tokenPrice();
    $(".token-price").html(web3.fromWei(App.tokenPrice.toNumber(), "ether"));

    App.tokensSold = (await App.sebTokenSale.tokensSold()).toNumber();
    $(".tokens-sold").html(App.tokensSold);
    $(".tokens-provisioned").html(App.tokensProvisioned);

    var progressBarPercent = (App.tokensSold / App.tokensProvisioned) * 100;
    console.log("Progress: ", progressBarPercent);
    $(".progress-bar")
      .css("width", progressBarPercent + "%")
      .html(Math.ceil(progressBarPercent) + "%");

    var balance = await App.sebToken.balanceOf(App.account);

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

    await App.sebTokenSale.buyTokens(numberOfTokens, { from: App.account, value: numberOfTokens * App.tokenPrice, gas: 500000 });
    console.log("Tokens bought!");
    $("form").trigger("reset");
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
