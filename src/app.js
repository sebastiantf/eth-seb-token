App = {
  init: function() {
    console.log("App initializing...");
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
