/**
 * Welcome to Pebble.js!
 *
 * This is where you write your app.
 */

var UI = require('ui');
var Vector2 = require('vector2');
var ajax = require('ajax');
var Vibe = require('ui/vibe');



var fn_gps;
var fn_closeness;
navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions);  
var main = new UI.Card({
	title: 'Hungry?',
	icon: 'images/menu_icon.png',
	subtitle: 'Loading...',
  body: 'Up: Show list, down: reset gps'
});
	get_truck_data();

main.show();
main.on('click', 'up', function(e) {
	console.log("Starting getting the trucks...");
	get_truck_data();
});

/*
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
*/

main.on('click', 'down', function(e) {
  clearInterval(fn_gps);
  clearInterval(fn_closeness);

	var card = new UI.Card();
	card.title('GPS tracker reset');
	card.subtitle('GPS is reset');
	card.body('Press back to go back...');
	card.show();
});

var locationOptions = {
	enableHighAccuracy: true, 
	maximumAge: 10000, 
	timeout: 10000
};

var my_lat = 0;
var my_long = 0;

function locationSuccess(pos) {
	console.log('My lat= ' + pos.coords.latitude + ' long= ' + pos.coords.longitude);
	/* Set it to local storage. What's the performance hit? */
	/*localStorage.setItem("my_lat", pos.coords.latitude);
	localStorage.setItem("my_long", pos.coords.longitude);
	*/
       my_lat = pos.coords.latitude;
       my_long = pos.coords.longitude;
}

function locationError(err) {
	console.log('location error (' + err.code + '): ' + err.message);
}


function gps_to_dist(lat, long){
  var clat = Math.abs(lat) - Math.abs(my_lat);
  var clong = Math.abs(long) - Math.abs(my_long);
  
  var dist = Math.sqrt((clat*clat) + (clong*clong));
  console.log("Dist:" + dist);
  return dist;
}

// Make an asynchronous request

  function parse_truck_data(response){
	/* 
	   This is where the hackathon is happening. 
	   lat= 39.0437 lon= -77.4875 
     Actually no, this is the emulator's geoip
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
		if (cnt > 40) { return;}

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
				console.log(t.description);
        
        var curmylat = my_lat;
        var curmylong = my_long;
        if (curmylong < 0) {curmylong = curmylong *-1;}
        if (curmylat < 0) {curmylat = curmylat *-1;}
        
        var lat = 0;
        var long = 0;
        if (op.latitude < 0){
          lat = curmylat + op.latitude;
        } else {
          lat = curmylat - op.latitude;
        }
        if ( op.longitude <0) {
          long = curmylong + op.longitude;
        }else {
          long = curmylong - op.longitude;
        }
        
        var cmag = Math.sqrt((lat*lat) + (long*long));
        var mymag = Math.sqrt((my_lat*my_lat) + (my_long*my_long));
        
        var dist = cmag - mymag;
        if (dist < 0) { dist = dist * -1;}
        
        console.log("GPS Debug");
        console.log("op.lat" + op.latitude);
        console.log("op.long" + op.longitude);
        console.log("mylat" + curmylat);
        console.log("mylong" + curmylong );
        console.log("lat" + lat);
        console.log("long" + long );
        console.log("cmag" + cmag);
        console.log("mymag" + mymag);
        console.log("dist" + dist);
        
        gps_to_dist(op.latitude, op.longitude);
        
        var dt = ">100km";
        if (cmag< 0.001 ) {
          dt = "<100m";
        } else if (cmag < 0.01) {
          dt = "<1km";
        } else if (cmag < 0.05){
          dt = "<5km";
        } else if (cmag < 0.1) {
          dt = "<11km";
        } else if (cmag < 0.25) {
          dt = "<25km";
        } else if (cmag < 0.5) {
          dt = "<50km";
        } else {
          dt ="<100km";
        }

				list_results.push(
					{title:t.name,
						subtitle:dt + "@" + op.display + op.special + t.description,
						where: op.display,
						why: op.special,
						description: t.description,
						latitude: op.latitude,
						longitude: op.longitude
					});
			}
		});
	});

	/* Order the list by closest to you */
	list_results.sort( function(a,b) {
		var magnitude_a = a.latitude + a.longitude;
		var magnitude_b = b.latitude + b.longitude;
		
	
		/*var my_lat = localStorage.getItem("my_lat");
		var my_long = localStorage.getItem("my_long");
		*/
		var my_mag = my_lat + my_long;

		var diff_a = my_mag - magnitude_a;
		var diff_b = my_mag - magnitude_b;
    
    diff_a = gps_to_dist(a.latitude, a.longitude);
    diff_b = gps_to_dist(b.latitude, b.longitude);

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
		console.log('The item loc "' + e.item.longitude + ',' + e.item.latitude + '"');
		var card = new UI.Card();
		card.title(e.item.title);
		card.subtitle(e.item.special);
		card.body(e.item.description);
		card.show();

	});
  
  menu.on('longSelect', function(e) {
    // Get new gps coords every 15 seconds.
    clearInterval(fn_gps);
    clearInterval(fn_closeness);
    fn_gps = setInterval(function()
                {
                  navigator.geolocation.getCurrentPosition(locationSuccess, locationError, locationOptions); 
                } , 3500);
    
    
    console.log("Activating the GPS every 15 seconds.");
    /*
     Accuracy versus decimal places
      decimal
      places	degrees	N/S or
      E/W at equator	E/W at
      23N/S	E/W at
      45N/S	E/W at
      67N/S
      0	1.0	111.32 km	102.47 km	78.71 km	43.496 km
      1	0.1	11.132 km	10.247 km	7.871 km	4.3496 km
      2	0.01	1.1132 km	1.0247 km	.7871 km	.43496 km
      3	0.001	111.32 m	102.47 m	78.71 m	43.496 m
      4	0.0001	11.132 m	10.247 m	7.871 m	4.3496 m
      5	0.00001	1.1132 m	1.0247 m	.7871 m	.43496 m
      6	0.000001	111.32 mm	102.47 mm	78.71 mm	43.496 mm
      7	0.0000001	11.132 mm	10.247 mm	7.871 mm	4.3496 mm
      8	0.00000001	1.1132 mm	1.0247 mm	.7871 mm	.43496 mm
      */
    fn_closeness = setInterval(function(){
      var my_mag = my_lat + my_long;
        var mag = e.item.longitude+ e.item.latitude;
      if ( mag < 0) {
        if ((my_mag + mag) < 0.01) {
          Vibe.vibrate('long'); 
    }
        else if ((my_mag + mag < 0.1)) {
          Vibe.vibrate('short');
    }
    }
      else {
        if ((my_mag - mag) < 0.01) {
          Vibe.vibrate('long'); 
    }
        else if ((my_mag - mag < 0.1)) {
          Vibe.vibrate('short');
    }
    }
    },1500);

    var card = new UI.Card();
    card.title("Target:" + e.item.title);
    card.body("Start walking, your watch will buzz when you are near..." + "lat:" + e.item.latitude + "long: " + e.item.longitude);
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
