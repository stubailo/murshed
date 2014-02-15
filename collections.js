Landmarks = new Meteor.Collection("landmarks");
Questions = new Meteor.Collection("questions");
Answers = new Meteor.Collection("answers");

if (Meteor.isServer) {
  Questions._ensureIndex({from: 1, to: 1}, {unique: 1});
  Landmarks._ensureIndex({ lngLat : "2d" });
}
