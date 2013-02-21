/**
 * Manages Server Interaction to retrieve any kind of data via ajax requests
 *
 * @constructor
 * @this {DocumentServerConnection}
 */
var DocumentServerConnection = new function(){
}

/**
 * Function to perform each AJAX request.
 *
 * @this {DocumentServerConnection}
 * @param {string} url The URL to retrive the data.
 * @param {string} type The expected response data type.
 * @param {boolean} async If the ajax request should be done asynchronously or not.
 * @param {Object} successCallback A callback function to be called for successfully retrieved data like: function(data).
 * @param {Object} failureCallback A callback function to be called for unsuccessfully retrieved data.
 */
DocumentServerConnection.getData = function(url,type,async,successCallback,failureCallback){
	$.ajax({
		url: url,
		async: async,
		dataType: type,
		success: function(data){
			if( typeof successCallback != "undefined" ){
				successCallback(data);
			}
		},
		error: function(errorObject){ 
			if( typeof failureCallback != "undefined" ){
				failureCallback(errorObject);
			}
	        }
	});
};

/**
 * Getter for the list of available documents. The result is an xml fragment with metadata for each of the documents.
 *
 * @this {DocumentServerConnection}
 * @param {Object} callback A callback function to be called for successfully retrieved data like: function(data).
 */
DocumentServerConnection.getDocuments = function(callback,async){
	var url = EditionProperties.documentEndpoint;
	this.getData(url,'xml',async,callback);
};

/**
 * Getter for a single page of a document.
 *
 * @this {DocumentServerConnection}
 * @param {Document} document The document to get the page.
 * @param {number} page The dedicated page number.
 * @param {Object} success A callback function to be called for successfully retrieved data like: function(data).
 * @param {Object} failure A callback function to be called for unsuccessfully retrieved data.
 */
DocumentServerConnection.getDocumentPage = function(document,page,success,failure){
	var url = EditionProperties.pageQuery.replace('DOC_ID',document.title).replace('PAGE_ID',page);
	this.getData(url,'html',true,success,failure);
};

/**
 * Getter for the outline of a document.
 *
 * @this {DocumentServerConnection}
 * @param {Document} document The document to get the outline.
 * @param {Object} success A callback function to be called for successfully retrieved data like: function(data).
 * @param {Object} failure A callback function to be called for unsuccessfully retrieved data.
 */
DocumentServerConnection.getDocumentOutline = function(document,success,failure){
	var url = EditionProperties.outlineQuery.replace('DOC_ID',document.title);
	this.getData(url,'html',true,success,failure);
};

/**
 * Getter for the whole text of a document.
 *
 * @this {DocumentServerConnection}
 * @param {Document} document The document to get the text.
 * @param {Object} success A callback function to be called for successfully retrieved data like: function(data).
 * @param {Object} failure A callback function to be called for unsuccessfully retrieved data.
 */
DocumentServerConnection.getDocumentText = function(document,success,failure){
	var url = EditionProperties.textQuery.replace('DOC_ID',document.title);
	this.getData(url,'html',true,success,failure);
};

/**
 * Getter for the TEI fragment of a document.
 *
 * @this {DocumentServerConnection}
 * @param {Document} document The document to get the TEI.
 * @param {Object} success A callback function to be called for successfully retrieved data like: function(data).
 * @param {Object} failure A callback function to be called for unsuccessfully retrieved data.
 */
DocumentServerConnection.getDocumentTEI = function(document,success,failure){
	var url = EditionProperties.teiUri.replace(/DOC_ID/g,document.title);
	this.getData(url,'xml',true,success,failure);
};

/**
 * Getter for a KML of places mentioned in a document.
 *
 * @this {DocumentServerConnection}
 * @param {Document} document The document to get the places.
 * @param {number} page The dedicated page number. If the page is '0', the KML consists of all places within the document.
 * @param {Object} callback A callback function to be called for successfully retrieved data like: function(data).
 */
DocumentServerConnection.getDocumentKml = function(document,page,callback){
	var url = EditionProperties.kmlQuery.replace('DOC_ID',document.title).replace('PAGE_ID',page);
	this.getData(url,'xml',true,callback);
};

/**
 * Getter for the tags of specific type of a document.
 *
 * @this {DocumentServerConnection}
 * @param {Document} document The document to get the tags.
 * @param {number} page The dedicated page number. If the page is '0', the response consists of all tags within the document.
 * @param {string} facets The tags are retrieved for a list of facets as part of the query, e.g. facets = tei:placeName,tei:persName.
 * @param {Object} success A callback function to be called for successfully retrieved data like: function(data).
 * @param {Object} failure A callback function to be called for unsuccessfully retrieved data.
 */
DocumentServerConnection.getDocumentTags = function(document,page,facets,success,failure){
	var url = EditionProperties.tagcloudPageQuery.replace('DOC_ID',document.title).replace('FACET_ID',facets).replace('PAGE_ID',page);
	this.getData(url,'xml',true,success,failure);
};

/**
 * Getter for the results of a search query.
 *
 * @this {DocumentServerConnection}
 * @param {string} term The search term to be searched for.
 * @param {string} facets If the search should be done on specific facets, e.g. facets = tei:placeName,tei:persName. If facets='' the search will be performed on the full texts of the documents.
 * @param {Object} callback A callback function to be called for successfully retrieved data like: function(data).
 */
DocumentServerConnection.getSearchResults = function(term,facet,callback){
	var url = EditionProperties.searchQuery.replace('QUERY_ID',term);
	if( facet != '' ){
		url += '&facet=' + facet;
	}
	this.getData(url,'xml',true,callback);
};

/**
 * Getter for all possible facets within the documents.
 *
 * @this {DocumentServerConnection}
 * @param {Object} callback A callback function to be called for successfully retrieved data like: function(data).
 */
DocumentServerConnection.getFacets = function(callback){
	var url = EditionProperties.facetsQuery;
	this.getData(url,'xml',false,callback);
};

/**
 * Getter for the number of pages of a document.
 *
 * @this {DocumentServerConnection}
 * @param {Document} document The document to get the pagenumber.
 * @param {boolean} async If the ajax request should be done asynchronously or not.
 * @param {Object} callback A callback function to be called for successfully retrieved data like: function(data).
 */
DocumentServerConnection.getPages = function(document,async,callback){
	var url = EditionProperties.pageCountQuery.replace('DOC_ID',document);
	this.getData(url,'xml',async,callback);
};

/**
 * Getter for the METS fragment of a document.
 *
 * @this {DocumentServerConnection}
 * @param {string} title The title of the document to get the METS.
 * @param {boolean} async If the ajax request should be done asynchronously or not.
 * @param {Object} callback A callback function to be called for successfully retrieved data like: function(data).
 */
DocumentServerConnection.getMets = function(title,async,callback){
	var url = EditionProperties.metsUri.replace(/DOC_ID/g,title);
	this.getData(url,'xml',async,callback);
};
