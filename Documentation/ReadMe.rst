ROPEN
=====

ROPEN (Resource Oriented Presentation ENvironment) is a digital tool for presenting digital editions.

Dependencies
############

1. dynatree https://code.google.com/p/dynatree/
	- used to generate an outline tree for each document in the browser and to generate TEI trees
	- slightly modified (modified html of the resultant trees)
	- used in: Browser.js, TEI.js

2. GeoTemCo https://github.com/stjaenicke/GeoTemCo
	- used to display places mentioned in documents within a map
	- OpenLayers library is included, so it is also used to display book images
	- not modified
	- used in: EditionGui.js (configuration), Places.js, Images.js

3. jqcloud https://github.com/lucaong/jQCloud
	- used to generate tag clouds
	- used in: Tags.js

4. jQuery http://jquery.com/
	- used for general jQuery functionality

5. jQuery-ui-1.10.0.custom http://jqueryui.com/
	- used for functionality of all frames (draggablity, resizablity)
	- not modified
	- used in: EditionGui.js (for draggable dialog windows), FrameWindow.js

6. jsonlib http://call.jsonlib.com/
	- used to send requests to Google URL Shortener to shorten URLs when generating magnetic links
	- not modified
	- used in: EditionGui.js

7. lazyloader http://www.appelsiini.net/projects/lazyload
	- used for lazy loading of images in the browser's search result list and the thumbnail views
	- modified to allow lazy loading within divs
	- used in: Browser.js, Thumbnails.js