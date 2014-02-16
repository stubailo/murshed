Meteor.methods({
	getNearbyLandmarks : function(landmarkIds){
	  console.log(landmarkIds);
	  return _.map(landmarkIds, function (landmarkId) {
		  var searchedLandmark = Landmarks.findOne(landmarkId);
      console.log(searchedLandmark.name);
		  var nearby = Landmarks.find( { lngLat :
                           { $near : searchedLandmark.lngLat,
                             $maxDistance: 0.001
                      } } ).fetch();
      console.log(searchedLandmark.name);
      console.log(nearby.length);
		  return nearby;
		});
	}
});









