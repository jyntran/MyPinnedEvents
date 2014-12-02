/*
 * Change "storeJson" in all urls to the name of your widget
 */
function storeJson(userid, htmlId) {
  "use strict";

  var key = "2f0d72e2-ba37-40ac-b0f4-e3d4e7352b2b";
  var wsURL = "https://" + server

  var templates = {};

  var model = {
    views: [],
    appData: 0,
    userData: [],

    addData: function(data) {
      //console.log(model);
      //console.log(model.userData);

      model.userData.push(data);
      model.appData = model.appData + 1;
      model.storeData();
    },

    storeData: function() {
      //console.log("storeJson: storing " + this.userData);
      var that = this;
      $.ajax({
        type: "POST",
        url: wsURL + "/storeUserData/storeJson/"+userid+"?key="+key,
        datatype: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(that.userData),
        success: function(data) {
          // Only get the data if we successfully stored it
          that.getData();
        },
        failure: function(msg) {
          $(htmlId).html("<h1>FAILED to store user data</h1><p>" + msg + "</p>");      
        }
      });

      $.ajax({
        type: "POST",
        url: wsURL + "/storeAppData/storeJson?key="+key,
        datatype: "json",
        contentType: "application/json; charset=utf-8",
        data: JSON.stringify(that.appData),
        success: function(data) {
          // Only get the data if we successfully stored it
          that.getData();
        },
        failure: function(msg) {
          $(htmlId).html("<h1>FAILED to store app data</h1><p>" + msg + "</p>");      
        }
      });
    },

    getData: function() {
      var that = this;
      $.getJSON(wsURL + "/getUserData/storeJson/"+userid+"?key="+key,
        function (d) {
          if (d.meta.status === "200 OK") {
            that.userData = d.result;
            that.updateViews("");
          } else {
            console.log("Failed to get user data." + JSON.stringify(d.meta));
          }
        });  

      $.getJSON(wsURL + "/getAppData/storeJson?key="+key,
        function (d) {
          if (d.meta.status === "200 OK") {
            that.appData = d.result;
            that.updateViews("");
          } else {
            console.log("Failed to get app data." + JSON.stringify(d.meta));
          }
        });      
    },

    clearData: function() {
      model.userData = [];
      model.storeData();
    },

    /**
     * Add a new view to be notified when the model changes.
     */
    addView: function (view) {
      this.views.push(view);
      view("");
    },

    /**
     * Update all of the views that are observing us.
     */
    updateViews: function (msg) {
      var i = 0;
      for (i = 0; i < this.views.length; i++) {
        this.views[i](msg);
      }
    }
  };

  var inputView = {
    updateView: function(msg) {
      //console.log("storeJson.inputView.updateView");
    }

  };

  var dataView = {
    updateView: function(msg) {
      //console.log("storeJson.dataView.updateView" + model.userData);
      $("#storeJson_userdata").html(JSON.stringify(model.userData));
      $("#storeJson_appdata").html(JSON.stringify(model.appData));
    }
  };


  //console.log("Initializing storeJson");
  portal.loadTemplates("widgets/storeJson/templates.txt",
    function (t) {
      templates = t;
      $(htmlId).html(templates.baseHtml);
      
      // Controllers

      // What happens when the user submits some data.
      $("#storeJson_submit").click(function() {
        model.addData($("#storeJson_input").val());
      });

      // What happens when the user clears data.
      $("#storeJson_clear").click(function() {
        model.clearData();
      });

      model.addView(dataView.updateView);
      model.addView(inputView.updateView);
      model.getData();
    });

}