/**
 * Browser Detection function. Implemented as class to keep the number of global object low.
 *
 * @constructor
 * @this {BrowserDetect}
 */
function BrowserDetect(){
	this.dataBrowser = [
		{
			string: navigator.userAgent,
			subString: "Chrome",
			identity: "Chrome"
		},
		{ 	string: navigator.userAgent,
			subString: "OmniWeb",
			versionSearch: "OmniWeb/",
			identity: "OmniWeb"
		},
		{
			string: navigator.vendor,
			subString: "Apple",
			identity: "Safari",
			versionSearch: "Version"
		},
		{
			prop: window.opera,
			identity: "Opera",
			versionSearch: "Version"
		},
		{
			string: navigator.vendor,
			subString: "iCab",
			identity: "iCab"
		},
		{
			string: navigator.vendor,
			subString: "KDE",
			identity: "Konqueror"
		},
		{
			string: navigator.userAgent,
			subString: "Firefox",
			identity: "Firefox"
		},
		{
			string: navigator.vendor,
			subString: "Camino",
			identity: "Camino"
		},
		{
			string: navigator.userAgent,
			subString: "Netscape",
			identity: "Netscape"
		},
		{
			string: navigator.userAgent,
			subString: "MSIE",
			identity: "Explorer",
			versionSearch: "MSIE"
		},
		{
			string: navigator.userAgent,
			subString: "Gecko",
			identity: "Mozilla",
			versionSearch: "rv"
		},
		{
			string: navigator.userAgent,
			subString: "Mozilla",
			identity: "Netscape",
			versionSearch: "Mozilla"
		}
	];
	this.dataOS = [
		{
			string: navigator.platform,
			subString: "Win",
			identity: "Windows"
		},
		{
			string: navigator.platform,
			subString: "Mac",
			identity: "Mac"
		},
		{
			   string: navigator.userAgent,
			   subString: "iPhone",
			   identity: "iPhone/iPod"
		},
		{
			string: navigator.platform,
			subString: "Linux",
			identity: "Linux"
		}
	];
	this.initialize();
}

/**
 * Initializes the Browser Detection.
 *
 * @this {BrowserDetect}
 */
BrowserDetect.prototype.initialize = function(){
	this.browser = this.searchString(this.dataBrowser) || "An unknown browser";
	this.version = this.searchVersion(navigator.userAgent) || this.searchVersion(navigator.appVersion) || "an unknown version";
	this.OS = this.searchString(this.dataOS) || "an unknown OS";
};

/**
 * Retrieves a string for a specific field. (e.g. the navigator's or the operating system's name)
 *
 * @this {BrowserDetect}
 * @param {JSON} data The versions (browsers, operating systems) to search for.
 * @return {string} The short string identity of the browser or operating system.
 */
BrowserDetect.prototype.searchString = function(data){
	for( var i=0; i<data.length; i++ ){
		var dataString = data[i].string;
		var dataProp = data[i].prop;
		this.versionSearchString = data[i].versionSearch || data[i].identity;
		if( dataString ){
			if( dataString.indexOf(data[i].subString) != -1 ){
				return data[i].identity;
			}
		}
		else if( dataProp ){
			return data[i].identity;
		}
	}
};

/**
 * Tries to retrieve the browser's version.
 *
 * @this {BrowserDetect}
 * @param {string} dataString The string representation of the navigator.
 * @return {number} The browser's version or 'undefined' if it cannot be retrieved.
 */
BrowserDetect.prototype.searchVersion = function(dataString){
	var index = dataString.indexOf(this.versionSearchString);
	if( index == -1 ){
		return;
	}
	return parseFloat(dataString.substring(index+this.versionSearchString.length+1));
};
