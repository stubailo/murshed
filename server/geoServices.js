Meteor.methods({
	getNearbyLandmarks : function(landmarkIds){
	  return _.map(landmarkIds, function (landmarkId) {
		  var searchedLandmark = Landmarks.findOne(landmarkId);
		  var nearby = Landmarks.find( { lngLat :
                           { $near : searchedLandmark.lngLat,
                             $maxDistance: 0.003
                      } } ).fetch();
		  return nearby;
		});
	}
});









