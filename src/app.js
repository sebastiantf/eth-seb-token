App = {
  contracts: {},
  account: "0x0",
  loading: false,

  init: function() {
    console.log("App initializing...");
    return App.initWeb3();
  },

  initWeb3: function() {
    if (typeof web3 !== "undefined") {
      console.log("There is web3 injected by MetaMask: ", web3);
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
      console.log("new Web3(): ", web3, web3.currentProvider);
    } else {
      console.log("No web3 found. Creating new Web3()");
      App.web3Provider = new Web3.providers.HttpProvider("http://localhost:8545");
      web3 = new Web3(App.web3Provider);
      console.log("new Web3(): ", web3, web3.currentProvider);
    }
    return App.initContracts();
  },

  initContracts: function() {
    $.getJSON("SebTokenSale.json", function(sebTokenSale) {
      App.contracts.SebTokenSale = TruffleContract(sebTokenSale);
      App.contracts.SebTokenSale.setProvider(App.web3Provider);
      App.contracts.SebTokenSale.deployed().then(function(sebTokenSale) {
        console.log("SebTokenSale contract address: ", sebTokenSale.address);
      });
    }).done(function() {
      $.getJSON("SebToken.json", function(sebToken) {
        App.contracts.SebToken = TruffleContract(sebToken);
        App.contracts.SebToken.setProvider(App.web3Provider);
        App.contracts.SebToken.deployed().then(function(sebToken) {
          console.log("SebToken contract address: ", sebToken.address);
        });
        return App.render();
      });
    });
  },

  render: function() {
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

    App.loading = false;
    content.show();
    loader.hide();
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
