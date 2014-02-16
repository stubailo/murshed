if (Meteor.isClient) {
  Template.page.events({
    "click .update-foursquare": function () {
      Meteor.call("updateDestinations");
    }
  });

  updateSimilarQuestions = function () {
    var from = Session.get("selected-from");
    var to = Session.get("selected-to");
    
    Deps.nonreactive(function () {
    Session.set("similarQuestions", null);
    if (from && to) {
        Meteor.call("getNearbyLandmarks", [from, to], function (error, result) {
          // result is array of [from locations, to locations]
          var similarQuestions = Questions.find({
            from: {$in: _.map(result[0], function (landmark) {return landmark._id})},
            to: {$in: _.map(result[1], function (landmark) {return landmark._id})}
           }).fetch();
           
            Session.set("similarQuestions", similarQuestions);
           
        });
    }
    });
  };
  
  Deps.autorun(updateSimilarQuestions);

  Template.page.helpers({
    currentPage: function (name) {
      if (Router && Router.current(true) && Router.current(true).route) {
        return Router.current(true).route.name === name;
      }
    }
  });

  Template.ask.events({
    "keyup input": function (event) {
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
    },
    "click .post-question": function () {
      Questions.insert({
        from: Session.get("selected-from"),
        to: Session.get("selected-to")
      });
    },
    "click .up": function(){
      Answers.update({
        _id: this._id
      }, {$set: {
        upVotes: (this.upVotes || 0) + 1
      }});
    },
    "click .down": function(){
      Answers.update({
        _id: this._id
      }, {$set: {
        downVotes: (this.downVotes || 0) + 1
      }});
    },
    "click .similar-question-link": function () {
      Session.set("selected-from", this.from);
      Session.set("selected-to", this.to);
      Session.set("similar-from", null);
      Session.set("similar-to", null);
    },
    "mouseover .similar-question-link": function () {
      Session.set("similar-from", this.from);
      Session.set("similar-to", this.to);
    },
    "mouseout .similar-question-link": function () {
      Session.set("similar-from", null);
      Session.set("similar-to", null);
    },
    "click .landmark": function (event) {
      event.preventDefault();
    },
    "mouseover .landmark": function (event) {
      var name = $(event.target).text();
      var landmark = Landmarks.findOne({name: name});
      Session.set("current-landmark", landmark);
    },
    "mouseout .landmark": function () {
      Session.set("current-landmark", null);
    }
  });

  var getPercentScore = function (answer) {
    if((answer.downVotes+answer.upVotes)===0)
        {
          return 50;
        }
      else
      {
        return answer.upVotes/(answer.downVotes+answer.upVotes)*100;
      }
  };

  Template.ask.helpers({
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
    },
    question: function () {
      if (Session.get("selected-from") && Session.get("selected-to")) {
        return Questions.findOne({
          from: Session.get("selected-from"),
          to: Session.get("selected-to")
        });
      } else {
        return null;
      }
    },
    questionPostable: function () {
      return Session.get("selected-from") && Session.get("selected-to");
    },
    answers: function () {
      var questionId = this._id;
      var finalScore = Answers.find({questionId: questionId}).fetch();
      return _.sortBy(finalScore, function (answer) {
        return -getPercentScore(answer);
      });
    },
    similarQuestions: function () {
      return _.filter(Session.get("similarQuestions"), function (question) {
        // remove the current question, if any
        if (question.from === Session.get("selected-from") &&
          question.to === Session.get("selected-to")) {
          return false;
        }

        return true;
      });
    },
    displaySimilarQuestions: function () {
      return Session.get("selected-from") && Session.get("selected-to");
    },
    fromLandmark: function () {
      return Landmarks.findOne(this.from);
    },
    toLandmark: function () {
      return Landmarks.findOne(this.to);
    },
    percent: function () {
      return getPercentScore(this);
    },
    answerLandmarked: function() {
      var answerLandmarks = this.text.match(/\[.*?\]/g);
      answerLandmarks = _.map(answerLandmarks, function (untrimmed) {
        return untrimmed.substr(1, untrimmed.length - 2);
      });

      answerLandmarks = Landmarks.find({
        name: {$in: answerLandmarks}
      }).fetch();

      return this.text.replace(/\[/g, "<a href='#' class='landmark'>")
        .replace(/\]/g, "</a>");
    }
  });

  var textcompleteEnabled = false;

  Template.answer.events({
    "click .answer": function () {
      Session.set("questionBeingAnswered", this._id);
    },
    "click .cancel-answering": function () {
      Session.set("questionBeingAnswered", null);
    },
    "click .post-answer": function (event, template) {
      var answerContent = $(template.find(".answer-textarea")).val();
      var questionId = this._id;

      var answerLandmarks = answerContent.match(/\[.*?\]/g);
      answerLandmarks = _.map(answerLandmarks, function (untrimmed) {
        return untrimmed.substr(1, untrimmed.length - 2);
      });

      answerLandmarks = Landmarks.find({
        name: {$in: answerLandmarks}
      }).fetch();

      Answers.insert({
        questionId: questionId,
        text: answerContent,
        upVotes: 0,
        downVotes:0,
        landmarks: answerLandmarks
      });

      Questions.update({_id: questionId},
      {$set:
        {answerCount: (this.answerCount || 0) + 1}
      });

      Session.set("questionBeingAnswered", null);
    },
    "focus textarea.answer-textarea": function (event, template) {
      if (! textcompleteEnabled) {
        textcompleteEnabled = true;

        $(template.find("textarea")).textcomplete([{
          match: /(^|\s)@(\w*)$/,
          search: function (term, callback) {
            var regex = new RegExp(term, "i");
            var landmarks = Landmarks.find({name: regex}).fetch();

            callback(_.map(landmarks, function (landmark) {
              return landmark.name;
            }));
          },
          replace: function (term) {
            return " [" + term + "]";
          }
        }]);
      }
    }
  });

  Template.answer.helpers({
    questions: function () {
      return Questions.find({}, {
        sort: {answerCount: 1},
        limit: 10
      });
    },
    fromLandmark: function () {

      return Landmarks.findOne(this.from);
    },
    toLandmark: function () {
      return Landmarks.findOne(this.to);
    },
    answeringThisQuestion: function () {
      return Session.equals("questionBeingAnswered", this._id);
    },
    answerCount: function() {
      return this.answerCount || 0;
    }


  });

  var fromMarker;
  var toMarker;

  var similarFromMarker;
  var similarToMarker;

  var landmarkMarker;

  var map;

  Template.map.rendered = function () {
    var template = this;
    var abuDhabiLatLng = new google.maps.LatLng(24.4667, 54.366);

    if (! template.firstRendered) {
      var mapOptions = {
        center: abuDhabiLatLng,
        zoom: 13,
        scrollwheel: false
      };
      
      map = new google.maps.Map(template.find(".google-map"),
            mapOptions);
    }

    updateMarkers();

    template.firstRendered = true;
  };

  updateMarkers = function () {
    var from = Landmarks.findOne(Session.get("selected-from"));
    var to = Landmarks.findOne(Session.get("selected-to"));

    var similarFrom = Landmarks.findOne(Session.get("similar-from"));
    var similarTo = Landmarks.findOne(Session.get("similar-to"));

    var currentLandmark = Session.get("current-landmark");

    if (window.google) {
      var abuDhabiLatLng = new google.maps.LatLng(24.4667, 54.366);

      // extend map bounds
      var newBounds = new google.maps.LatLngBounds();
      newBounds.extend(abuDhabiLatLng);

      // actual start and end
      if (from) {
        var fromLatLng = new google.maps.LatLng(from.lngLat[1], from.lngLat[0]);

        newBounds.extend(fromLatLng);

        if (!fromMarker) {
          fromMarker = new google.maps.Marker({
            position: fromLatLng,
            map: map,
            title: 'Start',
            icon: generateIcon("A", "FF4136")
          });
        } else {
          fromMarker.setPosition(fromLatLng);
          fromMarker.setMap(map);
        }
      } else if (fromMarker) {
        fromMarker.setMap(null);
        fromMarker = null;
      }

      if (to) {
        var toLatLng = new google.maps.LatLng(to.lngLat[1], to.lngLat[0]);

        newBounds.extend(toLatLng);

        if (!toMarker) {
          toMarker = new google.maps.Marker({
            position: toLatLng,
            map: map,
            title: 'End',
            icon: generateIcon("B", "FF4136")
          });
        } else {
          toMarker.setPosition(toLatLng);
          toMarker.setMap(map);
        }
      } else if (toMarker) {
        toMarker.setMap(null);
        toMarker = null;
      }

      if (similarFrom) {
        var similarFromLatLng = new google.maps.LatLng(similarFrom.lngLat[1], similarFrom.lngLat[0]);

        newBounds.extend(similarFromLatLng);

        if (!similarFromMarker) {
          similarFromMarker = new google.maps.Marker({
            position: similarFromLatLng,
            map: map,
            title: 'Start',
            icon: generateIcon("A", "7FDBFF")
          });
        } else {
          similarFromMarker.setPosition(similarFromLatLng);
          similarFromMarker.setMap(map);
        }
      } else if (similarFromMarker) {
        similarFromMarker.setMap(null);
        similarFromMarker = null;
      }

      if (similarTo) {
        var similarToLatLng = new google.maps.LatLng(similarTo.lngLat[1], similarTo.lngLat[0]);

        newBounds.extend(similarToLatLng);

        if (!similarToMarker) {
          similarToMarker = new google.maps.Marker({
            position: similarToLatLng,
            map: map,
            title: 'End',
            icon: generateIcon("B", "7FDBFF")
          });
        } else {
          similarToMarker.setPosition(similarToLatLng);
          similarToMarker.setMap(map);
        }
      } else if (similarToMarker) {
        similarToMarker.setMap(null);
        similarToMarker = null;
      }

      if (currentLandmark) {
        var landmark = currentLandmark;

        var prefix= landmark.photos.groups[0].items[0].prefix;
        var suffix = landmark.photos.groups[0].items[0].suffix;
        var imageUrl = prefix + "100x100" + suffix;
        
        var landmarkLatLng = new google.maps.LatLng(landmark.lngLat[1],
          landmark.lngLat[0]);

        newBounds.extend(landmarkLatLng);

        var infoWindow = new google.maps.InfoWindow({
          content: "<img src='" + imageUrl + "' />"
        });

        if (!landmarkMarker) {
          landmarkMarker = new google.maps.Marker({
            position: landmarkLatLng,
            map: map,
            title: 'Landmark',
            icon: generateIcon("", "7FDBFF")
          });
        } else {
          landmarkMarker.setPosition(landmarkLatLng);
          landmarkMarker.setMap(map);
        }

        var openInfoWindow = function () {
          infoWindow.close();
          if (map && landmarkMarker) {
            infoWindow.open(map, landmarkMarker);
          }
        };

        openInfoWindow();

        setTimeout(openInfoWindow, 1000);


      } else if (landmarkMarker) {
        landmarkMarker.setMap(null);
        landmarkMarker = null;
      }

      if (from || to) {
        map.fitBounds(newBounds);
      }
    }
  };

  Deps.autorun(function () {
    updateMarkers();
  });
}
