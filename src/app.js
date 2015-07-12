/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');


navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);  
var main = new UI.Card({
	title: 'Food Trucks near you',
	icon: 'images/menu_icon.png',
	subtitle: 'Loading...',
	body: 'Grabbing data...'
});
	get_truck_data();

main.show();
main.on('click', 'up', function(e) {
	console.log("Starting getting the trucks...");
	get_truck_data();
});


main.on('click', 'select', function(e) {
	var wind = new UI.Window({
		fullscreen: true,
	});
	var textfield = new UI.Text({
		position: new Vector2(0, 65),
		size: new Vector2(144, 30),
		font: 'gothic-24-bold',
		text: 'Text Anywhere!',
		textAlign: 'center'
	});
	wind.add(textfield);
	wind.show();
});

main.on('click', 'down', function(e) {
	var card = new UI.Card();
	card.title('A Card');
	card.subtitle('Is a Window');
	card.body('The simplest window type in Pebble.js.');
	card.show();
});

var locationOptions = {
	enableHighAccuracy: true, 
	maximumAge: 10000, 
	timeout: 10000
};

function locationSuccess(pos) {
	console.log('lat= ' + pos.coords.latitude + ' lon= ' + pos.coords.longitude);
	/* Set it to local storage. What's the performance hit? */
	localStorage.setItem("my_lat", pos.coords.latitude);
	localStorage.setItem("my_long", pos.coords.longitude);

}

function locationError(err) {
	console.log('location error (' + err.code + '): ' + err.message);
}



// Make an asynchronous request

  function parse_truck_data(response){
	/* 
	   This is where the hackathon is happening. 
	   lat= 39.0437 lon= -77.4875 
	   */

	var list_results = [];
	var cnt = 0; // only do 10
	var cur_time = Date.now() / 1000;
	console.log("Current time now is: ", cur_time);

	var o = response.vendors;
	/* Get all the known vendors */
	Object.keys(o).forEach(function (key) {

		/* For some reason, we time out if we do too many ops.
		 * Limit to only ~10 items for now...
		 */
		if (cnt > 9) { return;}

		cnt++;
		var t = o[key];

		var co = t.open;
		/* For each vendor,
		 * 	check if they have a truck open RIGHT NOW
		 * 	and push into the result_list
	 	 */
		Object.keys(co).forEach(function (key) {
			//console.log("Is it open?");
			var op = co[key];
			if (cur_time > op.start && cur_time < op.end) {
				console.log("it is!");
				console.log(t.description);

				list_results.push(
					{title:t.name,
						subtitle:op.display + op.special + t.description,
						where: op.display,
						why: op.special,
						description: t.description,
						latitude: t.latitude,
						longitude: t.longitude
					});
			}
		});
	});

	/* Order the list by closest to you */
	list_results.sort( function(a,b) {
		var magnitude_a = a.latitude + a.longitude;
		var magnitude_b = b.latitude + b.longitude;
		
	
		var my_lat = localStorage.getItem("my_lat");
		var my_long = localStorage.getItem("my_long");

		var my_mag = my_lat + my_long;

		var diff_a = my_mag - magnitude_a;
		var diff_b = my_mag - magnitude_b;

		if ( diff_a > diff_b ) {
			return 1;
		} else if (diff_a < diff_b ) {
			return -1;
		} 
		return 0;
		
	});


	/* Show the menu list on the pebble */
	var menu = new UI.Menu({
		sections: [{
			title: 'Open Trucks',
			items: list_results
		}]
	});
	/* When you click a menu item, show a card with more info */
	menu.on('select', function(e) {
		console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
		console.log('The item is titled "' + e.item.title + '"');
		console.log('The item is "' + e.item.where + '"' + e.item.why);
		var card = new UI.Card();
		card.title(e.item.title);
		card.subtitle(e.item.special);
		card.body(e.item.description);
		card.show();

	});
	
	menu.show();
	console.log("Done parsing the trucks");

}

function get_truck_data() {
	ajax(
		{
			url:'http://data.streetfoodapp.com/1.1/schedule/ottawa/',
			type:'json'
		},
		function(data) {
			// Create an array of Menu items
			//var menuItems = parseFeed(data, 10);
			console.log("Got data");
			parse_truck_data(data);
		},
		function(error) {
			console.log('Download failed: ' + error);
		}
	);
}
