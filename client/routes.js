Router.map(function () {
  this.route("ask", {
    path: "/"
  });

  this.route("answer");

  this.route("admin");
});

Router.configure({
  autoRender: false
});