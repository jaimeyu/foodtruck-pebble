# foodtruck-pebble
Wrote this @ the [Ottawa Pebble Hackathon](http://www.meetup.com/PebbleOTT/events/222726467/). 

This app will show all the currently open food trucks in Ottawa and order them by distance from you.
It was written in Pebble.js. 

## Instructions ##
* Start App, the menu list will show up once its loaded.
* Select an item on the list, it will show more information about the truck
* Long Select an item on the list, it will activate the proximity vibration to the selected food truck. When you are within 1 km of a food truck, the Pebble will vibrate a lot. When you are at 11km, it will vibrate occasionally. Else, it will just track your GPS position and wait until you are close enough to start vibrating.
* Hit back from the menu list and you will hit the help screen.
* From the help screen, hit up to launch the list of food trucks (this refreshes / grabs the latest data).
* From the help screen, hit down to deactivate the GPS tracking feature. 

## Future ##
* Wanted to get the compass working but this is not supported in Pebble.js (yet). Sorry peeps. I was hoping that the watch would be able to tell you where to start walking towards.
* Tune everything. I wrote it without checking all the UI displays. If you find something wrong or a better way to display info, fire off an issue. 
* Tune vibration. I didn't get a chance to test this outside near food trucks yet. 
