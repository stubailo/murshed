var updateFoursquareDestinations = function(offset, city) {
  HTTP.call("GET", 'https://api.foursquare.com/v2/venues/explore',
  {
    params: {
      near: city,
      radius: 10000,
      openNow: 0,
      limit: 50,
      offset: offset,
      client_id: "QVTGXYI2RTFT1OJK5EI45HA2PQVKYSPS5OXWYNCCA25YYJ4Q",
      client_secret: "3LAGOTH4P2ZGS54UHPUEYU0ZCEKSWLJK4KI4MIRJZTTSUGMU",
      v: "20140214"
    }
  },
  function(error, result){
    var data = result.data;
    var venues = _.map(data.response.groups[0].items, function(item){
      item = item.venue;
      item.source = "foursquare";
      item.city = city;
      item._id = item.id;
      
      if (item.location.lng && item.location.lat) {
        item.lngLat = [item.location.lng, item.location.lat];
      }
      
      return item;
    });

    _.each(venues, function(venue) {
      Landmarks.insert(venue);
    });

    if (offset + venues.length < data.response.totalResults) {
        updateFoursquareDestinations(offset + venues.length, city);
    }
  });
};

Meteor.methods({
  updateDestinations: function () {
    Landmarks.remove({});
    _.each(["Abu Dhabi, UAE", "Dubai, UAE"], function(city) {
      updateFoursquareDestinations(0, city);
    });
  },
});
