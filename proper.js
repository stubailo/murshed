if (Meteor.isClient) {
  Template.directionsForm.events({
    "keyup input": function (event, template) {
      var name = event.target.name;
      var text = event.target.value;

      Session.set(name, text);
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
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
