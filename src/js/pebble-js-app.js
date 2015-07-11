function error_fetching(rreason){
  console.log("Error in response:" + reason);
  var stop_eta = 3;
  //route_destination = "(╯°□°）╯︵ ┻━┻";
  var route_destination = "No data";
  var stop_name = "Retrying in 3 mins";

  Pebble.sendAppMessage({
    "KEY_ETA" : parseInt(stop_eta),
    "KEY_DST" : route_destination.substring(0,24),
    "KEY_STATION_STR" : stop_name.substring(0,24),
    "KEY_GPS" : parseInt(0)
  });


}

function parseTravvikData(response){
  var stop_eta = null, route_destination = null, stop_name = null, gps = null;
  var gps = 0;

  try {
   
  }
  catch (e) {
    console.log("Something went wrong trying to parse data:" + JSON.stringify(e));
  }


  Pebble.sendAppMessage({
    "KEY_ETA" : parseInt(stop_eta),
    "KEY_DST" : route_destination.substring(0,12),
    "KEY_STATION_STR" : stop_name.substring(0,12),
    "KEY_GPS" : parseInt(gps)
  },
function(e) {
    console.log('Successfully delivered message with transactionId=' + e.data.transactionId);
  },
  function(e) {
    console.log('Unable to deliver message with transactionId=' + e.data.transactionId + ' Error is: ' + e.error.message);
  });

  // No error detector, save the values.
  /*
  console.log("Saving data:" + station + " " + route + " " + direction);
  localStorage.setItem("last_station", station);
  localStorage.setItem("last_route", route);
  localStorage.setItem("last_direction", direction);*/


}


function fetch_trucks() {
  var response;
  var req = new XMLHttpRequest();
  var uri = "http://data.streetfoodapp.com/1.1/schedule/ottawa/";

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
      parseTravvikData(response);
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


Pebble.addEventListener("ready",
    function(e) {
      console.log("connected" + e.ready);
      console.log(e.type);

      fetch_next_bus();

    });

Pebble.addEventListener("appmessage",
    function(e) {
      console.log(e.type);
      console.log("rcvd msg frm pbl");
      fetch_next_bus();
    });

Pebble.addEventListener("webviewclosed",
    function(e) {
      console.log("webview closed");
      console.log(e.type);
      console.log(e.response);
    });

