/**
 * Provides utilities for the system. (e.g. it loads documents, facets, tags and tooltip texts)
 *
 * @constructor
 * @this {Util}
 */
var Util = new function(){
	/* array for all documents metadata from the server */
	this.documents = [];
	/* array for all possible facets */
	this.facets = [];
	/* array of strings for all possible document views */
	this.docTypes = [ 'outline', 'text', 'pages', 'thumbnails', 'images', 'tei', 'map', 'tags' ];
	this.docsLoaded = false;
	this.docCount = false;
	this.docLoad = 0;
	this.facetsLoaded = false;
	this.texts = EditionTooltips;
	if( typeof navigator.language != 'undefined' && navigator.language.indexOf("de") > -1  ){
		this.language = "de";
	}
	else if( typeof navigator.browserLanguage != 'undefined' && navigator.browserLanguage.indexOf("de") > -1 ){
		this.language = "de";
	}
	else {
		this.language = "en";
	}
};

/**
 * Getter for an ID for a given document type. Required for generating magnetic links.
 *
 * @this {Util}
 * @param {string} type The document type.
 * @return {number} The corresponding document type id.
 */
Util.getIdByType = function(type){
	for( var i=0; i<this.docTypes.length; i++ ){
		if( this.docTypes[i] == type ){
			return i;
		}
	}
};

/**
 * Getter for the document type of a given ID. Required for utilizing magnetic links.
 *
 * @this {Util}
 * @param {number} id The id of the document type.
 * @return {string} The corresponding document type.
 */
Util.getTypeById = function(id){
	return this.docTypes[id];
};

/**
 * Getter for a specific attribute of a given node. Required for attribute names with name spaces like 'xml:href'.
 *
 * @this {Util}
 * @param {XML} node The XML node to get the attribute.
 * @param {string} attributeName The attribute to search for.
 * @return {string} The value of the attribute.
 */
Util.getAttribute = function(node,attributeName){
	var value = $(node).attr(attributeName);
	if( typeof value == 'undefined' ){
		for( var i=0; i<node.attributes.length; i++ ){
			if( attributeName == node.attributes[i].name ){
				value = node.attributes[i].nodeValue;
				break;
			}
		}
	}
	return value;
};

/**
 * Getter for a language dependent tooltip string.
 *
 * @this {Util}
 * @param {string} id The id of the tooltip, e.g. 'folder'.
 * @return {string} The corresponding tooltip dependent on the applications language.
 */
Util.getString = function(id){
	return Util.texts[id][Util.language];
};

/**
 * Asynchronous loader for all available documents. This function retrieves the metadata file for all documents. Afterwards, each single document gets retrieved.
 *
 * @this {Util}
 * @param {Object} trigger A trigger function to be called when a document has been loaded.
 */
Util.loadDocuments = function(trigger){
	var gui = this;
	var callback = function(xml){
		var docs = $(xml).find('doc');
		Util.docCount = docs.length;
		for( var i=0; i<docs.length; i++ ){
			Util.loadDocument($(docs[i]).find('id').text(),$(docs[i]).find('title').text(),$(docs[i]).find('titleShort').text(),$(docs[i]).find('preview').text(),trigger);
		};
	}
	DocumentServerConnection.getDocuments(callback);
};

/**
 * Loads a single document asynchronously.
 *
 * @this {Util}
 * @param {string} title The title (id) of the document.
 * @param {string} name The name of the document.
 * @param {string} nameShort The short name of the document.
 * @param {string} preview A preview thumbnail for the document (currently unused).
 * @param {Object} trigger A trigger function to be called when a document has been loaded.
 */
Util.loadDocument = function(title,name,nameShort,preview,trigger){
	var pagesCallback = function(xml){
		var pageCount = $(xml).find('count').text();
	    	var imagePath, images = [];
		var metsCallback = function(xml){
			$(xml).find('[nodeName="METS:mets"]').find('[nodeName="METS:fileSec"]').find('[nodeName="METS:fileGrp"]').first().find('[nodeName="METS:file"]').each(function(){
				var node = $(this).find('[nodeName="METS:FLocat"]')[0];
       	    			var fullPath = Util.getAttribute(node,'xlink:href');
       	    			images.push(fullPath.substring(fullPath.lastIndexOf("/")+1));
       	    			if( !imagePath ){
       	    				var dummy = fullPath.substring(0,fullPath.lastIndexOf("/"));
       	    				imagePath = dummy.substring(0,dummy.lastIndexOf("/")+1);
       	    			}
			})
			var doc = new Document(title,name,nameShort,preview,pageCount,imagePath,images);
			Util.documents.push(doc);
			if( typeof trigger == 'undefined' ){
				return doc;
			}
			else {
				trigger(doc);
			}
			Util.docLoad++;
			if( Util.docLoad == Util.docCount ){
				Util.docsLoaded = true;
			}
		};
		DocumentServerConnection.getMets(title,true,metsCallback);
	}
	DocumentServerConnection.getPages(title,true,pagesCallback);
};

/**
 * Loads a single document synchronously. Used for utilizing magnetic links; the intention is to load related documents before unrelated ones.
 *
 * @this {Util}
 * @param {string} title The title (id) of the document.
 * @param {string} nameShort The short name of the document.
 */
Util.loadDocumentSync = function(title,nameShort){
	var pageCount;
	var pagesCallback = function(xml){
		pageCount = $(xml).find('count').text();
	}
	DocumentServerConnection.getPages(title,false,pagesCallback);
    	var imagePath, images = [];
	var metsCallback = function(xml){
		$(xml).find('[nodeName="METS:mets"]').find('[nodeName="METS:fileSec"]').find('[nodeName="METS:fileGrp"]').first().find('[nodeName="METS:file"]').each(function(){
			var node = $(this).find('[nodeName="METS:FLocat"]')[0];
       	    		var fullPath = Util.getAttribute(node,'xlink:href');
       	    		images.push(fullPath.substring(fullPath.lastIndexOf("/")+1));
       	    		if( !imagePath ){
       	    			var dummy = fullPath.substring(0,fullPath.lastIndexOf("/"));
       	    			imagePath = dummy.substring(0,dummy.lastIndexOf("/")+1);
       	    		}
		});
	}
	DocumentServerConnection.getMets(title,false,metsCallback);
	var doc = new Document(title,'',nameShort,'',pageCount,imagePath,images);
	return doc;
};

/**
 * Getter for a document with a specific title. Currently used from the external Scrips page.
 *
 * @this {Util}
 * @param {string} title The title (id) of the document.
 * @return {Document} The document with the given title.
 */
Util.getDoc = function(title){
	for( var i in Util.documents ){
		if( Util.documents[i].title == title ){
			return Util.documents[i];
		}
	}
};

/**
 * Loader for the possible facets of a document. Finally, we receive 2 types of facets:
 * 1) facets for rendering in texts, e.g. 'tei:placeName' for place names
 * 2) facets for additional information for documents, e.g. 'tei:note' for notes for a document
 *
 * @this {Util}
 * @param {Object} trigger A trigger function to be called when the facets have been loaded.
 */
Util.loadFacets = function(trigger){
	var i = 0;
	var callback = function(xml){
		$(xml).find('[nodeName="tei:tei"]').children().each(function(){
			var labels = [];
			$(this).find('foreign').each(function(){
				labels.push({
					language: Util.getAttribute(this,'xml:lang'),
					label: $(this).text()
				});
			});
			var render = $(this).attr("rend");
			var color = undefined;
			if( render ){
				var dummy = $("<div class='entity"+i+"'/>").appendTo('body');
				color = $(dummy).css('color');
				$(dummy).remove();
				i++;
			}
			var facet = {
				facet: this.nodeName,
				render: render,
				labels: labels,
				color: color
			};
			Util.facets.push(facet);
			if( typeof trigger != 'undefined' && render ){
				trigger(facet);
			}
		});
		Util.facetsLoaded = true;
	}
	DocumentServerConnection.getFacets(callback);
};

/**
 * Getter for a label of a facet in the proper language.
 *
 * @this {Util}
 * @param {JSON} facet The facet to get the label.
 * @return {string} The label of the facet in the browsers language.
 */
Util.getFacetLabel = function(facet){
	for( var i in facet.labels ){
		if( facet.labels[i].language == Util.language ){
			return facet.labels[i].label;
		}
	}
};

/**
 * Getter for a facet by a given id.
 *
 * @this {Util}
 * @param {string} The id of the facet, e.g. 'tei:placeName'.
 * @return {JSON} The JSON data of the corresponding facet.
 */
Util.getFacet = function(id){
	for( var i in Util.facets ){
		if( Util.facets[i].facet == id ){
			return Util.facets[i];
		}
	}
};

/**
 * Getter for a specific number (EditionProperties.maxTags) of tags from the given xml file.
 *
 * @this {Util}
 * @param {XML} tags The xml file containing the tag data.
 * @return {Array} A specific number of most frequent tags.
 */
Util.getTags = function(tags){
	var tagArray = [];
	for( var i=0; i<tags.length; i++ ){
		var text = $(tags[i]).find('tag').text();
		if( text == "" ){
			continue;
		}
		var weight = $(tags[i]).find('count').text();
		var url = $(tags[i]).find('link').text();
		var facet = Util.getFacet($(tags[i]).find('facet').text());
		var tooltip = weight+" "+Util.getString('occurences');
		var link = '<a title="'+tooltip+'" class="tagcloudTag '+facet.facet+'" href="'+url+'" style="color:'+facet.color+';" target="_blank">'+text+'</a>';
		tagArray.push({
			text: link,
			weight: weight
		});
		if( EditionProperties.maxTags && EditionProperties.maxTags == tagArray.length ){
			break;
		}
	}
	return tagArray;
};

/**
 * Returns the HTML for an error message of a given type; used to communicate AJAX response errors when loading data from the server.
 *
 * @this {Util}
 * @param {number} errorType The error id (e.g. 404).
 * @return {HTML} The error message content DIV.
 */
Util.getErrorMessage = function(errorType){
	var errorDiv = $("<div/>");
	$("<div class='errorMessage'>"+Util.getString('errorMessage')+' ('+errorType+')'+"</div>").appendTo(errorDiv);
	$('<div class="errorSign"/>').appendTo(errorDiv);
	return errorDiv;
};

/**
 * Returns the HTML for an alert message. Used to communicate if the user needs to select facets when required.
 *
 * @this {Util}
 * @param {string} message The alert message to be shown.
 * @return {HTML} The alert message content DIV.
 */
Util.getAlertMessage = function(message){
	var alertDiv = $("<div/>");
	$("<div class='alertMessage'>"+message+"</div>").appendTo(alertDiv);
	$('<div class="alertSign"/>').appendTo(alertDiv);
	return alertDiv;
};

/**
 * Used to transform Ascii to HEX code for generating working hyperlinks.
 *
 * @this {Util}
 * @param {string} text The text to transform.
 * @return {string} The transformed hex code.
 */
Util.asciiToHex = function(text){
	var ascii = new Array( "!","#","$","%","&","'","(",")","*","+",",","/",":",";","=","?","@","[","]", " " );
	var hex = new Array( "%21","%23","%24","!$#","%26","%27","%28","%29","%2a","%2b","%2c","%2f","%3a","%3b","%3d","%3f","%40","%5b","%5d","%20" );
	for( var i=0; i<ascii.length; i++ ){
		while(text.indexOf(ascii[i])!= -1){
			text = text.replace(ascii[i],hex[i]);	
		}
	}
	text = text.replace(/!$#/g,"%25");
	return text;
};

/**
 * Gets the actual mouse position relative to the document.
 *
 * @this {Util}
 * @param {Object} e The mouse event data.
 * @return {string} The transformed hex code.
 */
Util.getMousePosition = function(event) {
	if (!event) {
		event = window.event;
	}
	var body = (window.document.compatMode && window.document.compatMode == "CSS1Compat") ? window.document.documentElement : window.document.body;
	return {
		top : event.pageY ? event.pageY : event.clientY,
		left : event.pageX ? event.pageX : event.clientX
	};
};

/**
 * This method is required for lazy loading of images. It appends the image to the parent div and rescales the image if it is too large.
 *
 * @this {Util}
 * @param {Image} response The response after an image has been loaded.
 * @param {HTML} image The images'  html tag.
 * @param {HTML} div The parent DIV which contains the image.
 */
var imageLoad = function(response,image,div){
	var width = div.width(), height = div.height();
	var w = response.naturalWidth || response.width, h = response.naturalHeight || response.height;
	if( typeof w != "undefined" && w > 0 ){
		if( h > height ){
			image.attr('height',height);
			h = height;
		}
		if( w > width ){
			image.attr('width',width);
			w = width;
		}
		var top = (height-$(image).height())/2;
		var left = (width-$(image).width())/2;
		image.css('position','absolute');
		image.css('top',top+'px');
		image.css('left',left+'px');
		image.parent().css("background-image","none");
	}
}
