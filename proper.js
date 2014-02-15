if (Meteor.isClient) {
  Template.directionsForm.events({
    "keyup input": function (event, template) {
      var name = event.target.name;
      var text = event.target.value;

      Session.set(name, text);
    },
    "click li": function (event) {
      var data = event.target.dataset;

      var id = data.id;
      var type = data.type;

      Session.set("selected-" + type, id);
      Session.set(type, null);
    },
    "click .cancel-selection": function (event) {
      var data = event.target.dataset;
      var type = data.type;

      Session.set("selected-" + type, null);
    }
  });

  Template.directionsForm.helpers({
    fromLandmarks: function () {
      var from = Session.get("from");
      if (!from || from.length < 3) {
        return null;
      }

      var regex = new RegExp(from, "i");
      return Landmarks.find({name: regex});
    },
    toLandmarks: function () {
      var to = Session.get("to");
      if (!to || to.length < 3) {
        return null;
      }

      var regex = new RegExp(to, "i");
      return Landmarks.find({name: regex});
    },
    selectedFrom: function () {
      return Landmarks.findOne(Session.get("selected-from"));
    },
    selectedTo: function () {
      return Landmarks.findOne(Session.get("selected-to"));
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
