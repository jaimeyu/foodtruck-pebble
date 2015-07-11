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
//  list = fetch_trucks();
  /*console.log("LIST: ", list);
  
  items = [];
  items.push({title:'hello world'});
  items.push({title:'Foobar hello'});
    var menu = new UI.Menu({
    sections: [{
      items: items
    }]
  });*/
  /*
  var menu = new UI.Menu({
    sections: [{
      items: [{
        title: 'Pebble.js',
        icon: 'images/menu_icon.png',
        subtitle: 'Can do Menus'
      }, {
        title: 'Second Item',
        subtitle: 'Subtitle Text'
      },{
        title:'LIST',
        items: items 
      }]
    }]
  });
  
  menu.on('select', function(e) {
    console.log('Selected item #' + e.itemIndex + ' of section #' + e.sectionIndex);
    console.log('The item is titled "' + e.item.title + '"');
  });
  menu.show();
  */
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


function fetch_trucks() {
  var response;
  var req = new XMLHttpRequest();
  var uri = "http://data.streetfoodapp.com/1.1/schedule/ottawa/";

  var results;
  console.log("Fetching from:" + uri);
  //req.timeout = (1000*2); // 2 second timeout
  //req.ontimeout = error_fetching(route, station, direction, "Timeout");
  req.open('GET', uri , true);
  req.onload = function(e) {
  if (req.readyState === 4) {
    if (req.status === 200) {
      // Caution, unicode errors may happen because of accent e.
      //console.log(escape(req.responseText));
      console.log(req.responseText);
      response = JSON.parse(req.responseText);
      /* Response */
      console.log("Payload:" + response);
      results = parse_truck_data(response);
      console.log("Sent data to pebble");
    }
    else {
      error_fetching("status not 200");
      }
  } else {
    error_fetching("Readystate not 4");
    }
};
req.send();
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

    /*
    // Construct Menu to show to user
    var resultsMenu = new UI.Menu({
      sections: [{
        title: 'Current Forecast',
        items: menuItems
      }]
    });

    // Show the Menu, hide the splash
    //resultsMenu.show();
    */
  },
  function(error) {
    console.log('Download failed: ' + error);
  }
);
}