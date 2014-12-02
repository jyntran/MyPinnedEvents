function j44trana4(userid, htmlId) {
	"use strict";

	var templates = {};  

	var model = {

	// Cookies implementation
	// Source: http://www.quirksmode.org/js/cookies.html

	createCookie: function(name,value,days) {
		if (days) {
			var date = new Date();
			date.setTime(date.getTime()+(days*24*60*60*1000));
			var expires = "; expires="+date.toGMTString();
		}
		else var expires = "";
		document.cookie = name+"="+value+expires+"; path=/";
	},

	readCookie: function (name) {
		var nameEQ = name + "=";
		var ca = document.cookie.split(';');
		for(var i=0;i < ca.length;i++) {
			var c = ca[i];
			while (c.charAt(0)==' ') c = c.substring(1,c.length);
			if (c.indexOf(nameEQ) == 0) return c.substring(nameEQ.length,c.length);
		}
		return null;
	},

	eraseCookie: function(name) {
		createCookie(name,"",-1);
	},

	
	// Views

    pinned: {
	title: "My Pinned Events",
	list: []
    },
    events: {
        title: "Pin New Event",
	data: {},
    },
    sessions: {
        title: "Pin New Event",
	data: {},
    },
    credits: {
        title: "About Widget",
    },
    views: [],
    currentView: "pinned",
    title: "My Pinned Events",

	
    // Initialize this object
    init: function () {
      //console.log("initializing model");
      var that = this;

	
	// Check if user has a cookie to reload pinned list
	var cookie = this.readCookie("j44trana4_cookie_pinned");
	//console.log("Cookie found: " + cookie);
	if (cookie != null) this.pinned = JSON.parse(cookie);

      // Initialize events
      $.getJSON("https://api.uwaterloo.ca/v2/events.json?key=6ed72651a0cadfd1fe73cc2048bb050e",
        function (d) {
          that.events.data = d;
          //that.updateViews("events");
        }).fail(function( jqxhr, textStatus, error ) {
        	var err = textStatus + ", " + error;
        	console.log( "Request Failed: " + err );
        });


      // Initialize sessions
      $.getJSON("https://api.uwaterloo.ca/v2/resources/infosessions.json?key=6ed72651a0cadfd1fe73cc2048bb050e",
        function (d) {
          that.sessions.data = d;
          //that.updateViews("sessions");
        }).fail(function( jqxhr, textStatus, error ) {
        	var err = textStatus + ", " + error;
        	console.log( "Request Failed: " + err );
        });
    },
	
	// Gets JSON data from id
	getById: function(type, id) {
		var json = null;
		var data = type.data.data;
		//console.log(JSON.stringify(data));
		//console.log(data.data.length);		
		for (var i=0; i<data.length; i++) {
			//console.log("json it ["+i+"]: "+data[i]);
			if ( data[i].id == id ) return json = data[i];
		}
		return json;
	},

	// Get array of times (for events)
	getArrayOfTimes: function(times){
		var result = [];
		//console.log("test:"+JSON.stringify(times));
		for (var i=0; i<times.length; i++) {
			var startString = times[i].start;
			var endString = times[i].end;
			var date = startString.substr(0,10);
			var start = startString.substr(11,5);
			var end = endString.substr(11,5);
			if (start === end) {
				end = "";
			} else {
				end = " - " + end;
			}
			var time = {"date": date, "time": start + end };
			result.push(time);			
		}
		return result;
	},
	
	// Check if pinned list is empty
	isPinnedEmpty: function() {
		return this.pinned.list.length === 0;
	},

	// Check if event is already pinned
	alreadyPinned: function(id){	
		for (var i=0; i<this.pinned.list.length; i++) {
			if ( this.pinned.list[i].id == id ){
				return true;
			}
		}
		return false;
	},
	
	// Add event to pinned list
	addPin: function(type,id) {
		var json = this.getById(type, id);
		var newPin = {};
		if (type === model.events) {
			//console.log(JSON.stringify(json.times));
			var time = model.getArrayOfTimes(json.times);
			newPin = {
				id: json.id,
				title: json.title,
				location: json.site_name,
				times: time,
				link: json.link
			};
			//console.log(newPin.times);
		} else if (type === model.sessions) {
			//console.log(json);
			newPin = {
				id: json.id,
				title: json.employer + " Info Session",
				location: json.location,
				times: [{ "date": json.date, "time":  json.start_time + "-" + json.end_time }],
				link: json.website
			};
		}
		this.pinned.list.push(newPin);
		this.alertAdded();
		//console.log("Pinned event.");
		newPin = "";

		this.createCookie("j44trana4_cookie_pinned",JSON.stringify(this.pinned));

	},
	
	// Remove event from pinned list	
	removePin: function(id) {
		for (var i=0; i<this.pinned.list.length; i++) {
			if ( this.pinned.list[i].id == id ){
				this.pinned.list.splice(i,1);
			}
		}
		this.alertRemoved();
		this.updateViews("pinned");
	},

	
	// Call alert of event added
	alertAdded: function() {
		var t = Mustache.render(templates.alertAdded, this);
		$("#j44trana4_alert").html(t);
	},

	// Call alert of event removed
	alertRemoved: function() {
		var t = Mustache.render(templates.alertRemoved, this);
		$("#j44trana4_alert").html(t);
	},

	// Call alert of error that warning has already been added
	alertAlreadyAdded: function() {
		var t = Mustache.render(templates.alertAlreadyAdded, this);
		$("#j44trana4_alert").html(t);
	},


     /*    
     * Add a new view to be notified when the model changes.
     */
    addView: function (view) {
      this.views.push(view);
      view("");
    },

    /*
     * Update all of the views that are observing us.
     */
    updateViews: function (msg) {
      var i = 0;
      for (i = 0; i < this.views.length; i++) {
        this.views[i](msg);
      }
    },

    /*
     * Hide all views
     */
    hideViews: function () {
      var i = 0; 
      for (i = 0; i < this.views.length; i++) {
	        this.views[i]("hide");
      }
    }

  };
/* end model */


/* Navigation Views */
  var navView = {
    updateView: function (msg) {
	var t ="";
      if (msg === "error") {
        t = templates.error;
	}
      $("#j44trana4_nav_title").html(model.title);
    },

    init: function () {
      //console.log("Initializing courseView");

      $("#j44trana4_nav_title").html(model.pinned.title);
      $("#j44trana4_nav1").show();
      $("#j44trana4_nav2").hide();

      $("#j44trana4_nav1_home").click(function () {
        //console.log("Home clicked");
		model.currentView = "pinned";
		model.hideViews();
		model.updateViews("pinned");
      });
      $("#j44trana4_nav1_event").click(function () {
        //console.log("Add clicked");
		model.currentView = "events";
		model.hideViews();
		model.updateViews("events");
      });
      $("#j44trana4_nav1_session").click(function () {
        //console.log("Add clicked");
		model.currentView = "sessions";
		model.hideViews();
		model.updateViews("sessions");
      });
      $("#j44trana4_nav_credits").click(function () {
        //console.log("Credits clicked");
		model.currentView = "credits";
		model.hideViews();
		model.updateViews("credits");
      });
    }
  };



/* Pinned View */

  var pinnedView = {
    updateView: function (msg) {
      //console.log("pinnedView.updateView with c = " + JSON.stringify(model.pinned));
      if (msg === "error") {
        t = templates.error;
      } else if (msg === "pinned") {
		var t = "";
		if (model.isPinnedEmpty() === true) {
			t = Mustache.render(templates.pinnedEmpty, model.pinned);		
		} else {
			t = Mustache.render(templates.pinned, model.pinned);
		}
		$("#j44trana4_pinned").html(t);
		model.title = model.pinned.title;
		$("#j44trana4_nav_title").html(model.title);
		$("#j44trana4_pinned").show();
      } else {
		$("#j44trana4_pinned").hide();
	  }
    },

    // Initialize this object
    init: function () {
      //console.log("initializing pinnedView");
		model.title = model.pinned.title;
        $("#j44trana4_nav_title").html(model.title);
		var t = Mustache.render(templates.pinnedEmpty, model.pinned);
        $("#j44trana4_pinned").html(t);		
		$("#j44trana4_pinned").on("click", "a.j44trana4_pinnedIcon", function () {
			//console.log("Want to unpin?");
			if (window.confirm("Are you sure you want to unpin this event?") === true){
				var id = this.id.substring(1);
				model.removePin(id);
			};
		});
    }
  };


/* Events View */

  var eventView = {
    updateView: function (msg) {
      //console.log("eventView.updateView with c = " + JSON.stringify(model.events));
      if (msg === "error") {
        t = templates.error;
      } else if (msg === "events") {
        var t = Mustache.render(templates.events, model.events.data);
        $("#j44trana4_events").html(t);
		model.title = model.events.title;
        $("#j44trana4_nav_title").html(model.title);
		$("#j44trana4_events").show();
	  } else {
		$("#j44trana4_events").hide();
	  }
    },

    // Initialize this object
    init: function () {
      //console.log("initialiszing eventView");
		model.currentView = "events";
		model.hideViews();
		model.updateViews(model.currentView);
		model.addView(eventView.updateView);

		$("#j44trana4_events").on("click", "a.j44trana4_unpinnedIcon", function () {
			var id = this.id.substring(1);
			if (model.alreadyPinned(id) === false) {
				model.addPin(model.events,id);
				//$(this.id).css('background','url(img/pinned32.png)');
				//$("#"+this.id).addClass("j44trana4_pinnedIcon");
				//$("#"+this.id).removeClass("j44trana4_unpinnedIcon");
				model.updateViews("events");
			} else {
				model.alertAlreadyAdded();
			}
		});		
    }
  };


/* Sessions View */

  var sessionsView = {
    updateView: function (msg) {
      //console.log("sessionsView.updateView with c = " + JSON.stringify(model.sessions.data));
      if (msg === "error") {
        t = templates.error;
      } else if (msg === "sessions") {
        var t = Mustache.render(templates.sessions, model.sessions.data);
        $("#j44trana4_sessions").html(t);
		model.title = model.sessions.title;
        $("#j44trana4_nav_title").html(model.title);
		$("#j44trana4_sessions").show();
	  } else {
		$("#j44trana4_sessions").hide();
	  }
    },

    // Initialize this object
    init: function () {
      //console.log("initialiszing sessionsView");
		model.currentView = "sessions";
		model.hideViews();
		model.updateViews(model.currentView);
		model.addView(sessionsView.updateView);

		$("#j44trana4_sessions").on("click", "a.j44trana4_unpinnedIcon", function () {
			var id = this.id.substring(1);
			if (model.alreadyPinned(id) === false) {
				model.addPin(model.sessions,id);
				model.updateViews("sessions");
			} else {
				model.alertAlreadyAdded();
			}
		});
		
    }
  };

/* Credits View */

  var creditsView = {
    updateView: function (msg) {
      //console.log("creditsView.updateView with c = " + JSON.stringify(model));
      if (msg === "error") {
        t = templates.error;
      } else if (msg === "credits") {
		model.title = model.credits.title;
        $("#j44trana4_nav_title").html(model.title);
        $("#j44trana4_credits").show();	
      } else {
        $("#j44trana4_credits").hide();	
	  }
    },

    // Initialize this object
    init: function () {
      //console.log("initializing creditsView");
        var t = Mustache.render(templates.credits, model.credits);
        $("#j44trana4_credits").html(t);	
    }
  };


  // Initialization
  //console.log("Initializing j44trana4(" + userid + ", " + htmlId + ")");
  portal.loadTemplates("widgets/j44trana4/templates.txt",
    function (t) {
      templates = t; 
      $(htmlId).html(templates.baseHtml);
      model.init();

      navView.init();
      pinnedView.init();
      eventView.init();
      sessionsView.init();
      creditsView.init();

      model.addView(pinnedView.updateView);
      model.addView(eventView.updateView);
      model.addView(sessionsView.updateView);
      model.addView(creditsView.updateView);
      model.addView(navView.updateView);

      model.currentView = "pinned";
      model.updateViews(model.currentView);
	});
}