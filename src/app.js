App = {
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
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
