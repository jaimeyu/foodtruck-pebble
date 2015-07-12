/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');


var main = new UI.Card({
	title: 'Pebble.js',
	icon: 'images/menu_icon.png',
	subtitle: 'Hello World!',
	body: 'Press any button.'
});

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
}

function locationError(err) {
	console.log('location error (' + err.code + '): ' + err.message);
}

// Make an asynchronous request

function parse_truck_data(response){
	navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);  
	/* 
	   This is where the hackathon is happening. 
	   lat= 39.0437 lon= -77.4875 
	   */

	var list_results = [];
	var cnt = 0; // only do 10
	var cur_time = Date.now() / 1000;
	console.log("Current time now is: ", cur_time);

	var o = response.vendors;
	Object.keys(o).forEach(function (key) {

		//For some reason, we time out if we do too many ops.
		if (cnt > 9) { return;}

		cnt++;
		var t = o[key];
		console.log(t.name);
		//console.log("Hey this works?",(o[key]).name);

		var co = t.open;
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
						description: t.description
					});
			}
		});
	});

	var menu = new UI.Menu({
		sections: [{
			title: 'Open Trucks',
			items: list_results
		}]
	});
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
	return list_results;

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
