if (Meteor.isClient) {
  Template.page.events({
    "click .update-foursquare": function () {
      Meteor.call("updateDestinations");
    }
  });

  Template.directionsForm.events({
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
    answers: function () {
      var questionId = this._id;
      return Answers.find({questionId: questionId});
    },
    similarQuestions: function () {
      return Questions.find();
    },
    fromLandmark: function () {
      return Landmarks.findOne(this.from);
    },
    toLandmark: function () {
      return Landmarks.findOne(this.to);
    }
  });

  var textcompleteEnabled = false;

  Template.questions.events({
    "click .answer": function () {
      Session.set("questionBeingAnswered", this._id);
    },
    "click .cancel-answering": function () {
      Session.set("questionBeingAnswered", null);
    },
    "click .post-answer": function (event, template) {
      var answerContent = $(template.find(".answer-textarea")).val();
      var questionId = this._id;

      Answers.insert({
        questionId: questionId,
        text: answerContent
      });

      Session.set("questionBeingAnswered", null);
    },
    "focus textarea.answer-textarea": function (event, template) {
      if (! textcompleteEnabled) {
        console.log("focused");
        textcompleteEnabled = true;

        $(template.find("textarea")).textcomplete([{
          match: /(^|\s)@(\w*)$/,
          search: function (term, callback) {
            console.log(term);
            var regex = new RegExp(term, "i");
            var landmarks = Landmarks.find({name: regex}).fetch();

            callback(_.map(landmarks, function (landmark) {
              return landmark.name;
            }));
          },
          replace: function (term) {
            return "<" + term + ">";
          }
        }]);
      }
    },
    "blur .textcomplete-wrapper textarea": function (event, template) {
      console.log("blur");
      $(template.find("textarea")).textcomplete("destroy");
      textcompleteEnabled = false;
    }
  });

  Template.questions.helpers({
    questions: function () {
      return Questions.find();
    },
    fromLandmark: function () {
      return Landmarks.findOne(this.from);
    },
    toLandmark: function () {
      return Landmarks.findOne(this.to);
    },
    answeringThisQuestion: function () {
      return Session.equals("questionBeingAnswered", this._id);
    }
  });
}

if (Meteor.isServer) {
  Meteor.startup(function () {
    // code to run on server at startup
  });
}
