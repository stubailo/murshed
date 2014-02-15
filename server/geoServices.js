Meteor.methods({
	getNearbyLandmarks : function(landmarkId){
		var searchedLandmark = Landmarks.findOne(landmarkId);
		var nearby = Landmarks.find( { lngLat :
                         { $near : searchedLandmark.lngLat,
                           $maxDistance: 0.001
                    } } ).fetch();
		console.log(nearby);
		return nearby;
	}
});



/*
		return Landmarks.find({
			location: {
				$near:{
					$geometry:{
						type: "Point",
						coordinates: [searchedLandmark.location.lng, searchedLandmark.location.lat]
					}
				},
				$maxDistance: 500
			}
		});
		return searchedLandmark;
	}
});
			/*places.find( { loc : { $near :
                           { $geometry :
                               { type : "Point" ,
                                 coordinates: [ 40 , 5 ] } },
                             $maxDistance : 500
                } } )



				return Landmarks.find({ 
				location : { 
				    $near :{ 
					$geometry :{ 
					    type : "Point" ,coordinates:[ searchedLandmark.location.lng , searchedLandmark.location.lat ] 
} 
}, $maxDistance : 500
                } 
} )
	}
});

Meteor.methods({
		getNearbyLandmark : function(){
		var searchedLandmark = Landmarks.findOne('525fee3411d27f90f9816870').location.lat	
return searchedLandmark;
					      }
		});


*/
