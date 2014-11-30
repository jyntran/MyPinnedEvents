

var portal = {


	/*
	 * loadTemplates:  load templates from an external JSON file.
	 * Put them into the templates object.
	 */
	loadTemplates: function(location, storeTemplates) {

		$.get(location, "",
			function (d) {
				var templates = {};
				var chunks = d.split("@@@@");
				if (chunks.length % 2 != 0) {
					// Exceptions thrown in a callback aren't catchable
					throw "WARNING: loadTemplates expected an even number of strings in " + location + " after splitting on '@@@@'.";
				} 

				for(var i=0; i<chunks.length; i = i+2) {
					templates[chunks[i].trim()] = chunks[i+1].trim();
				}

				storeTemplates(templates);
			}, "text").fail(function() { console.log("error loading templates from " + location)});
	}
}


/*******************
 * Initialization
 *******************/

/**
 * A helper function to create an object with a prototype.
 * Usage:  
 *		var myPrototype = { ... }  // create a prototype, somehow
 *      var myObj = Object.create(myPrototype);
 */
if (typeof Object.create !== 'function') {
	Object.create = function (proto) {
		var f = function () {};
		f.prototype = proto;
		return new f();
	}
}


