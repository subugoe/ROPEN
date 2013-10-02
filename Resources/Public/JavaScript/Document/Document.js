/**
 * Implementation of the Document Class. It contains all required information and some browser oriented cache arrays.
 *
 * @constructor
 * @this {Document}
 * @param {string} title The identifier string to communicate with the eXist backend (e.g. 'rom-heyne1798').
 * @param {string} name The name of the document, used in the Browser as root node within the document list.
 * @param {string} nameShort The short name of the document, used in tabs of the folders.
 * @param {string} preview URI to a preview image; currently unused.
 * @param {number} pages The number of pages of the document.
 */
Document = function(title, name, nameShort, preview, pages, isFullText){
	this.title = title;
	this.name = name;
	this.nameShort = nameShort;
	this.preview = preview;
	this.pages = pages;
	this.isFullText = isFullText;

	// cache variables to avoid multiple server requests
	this.fullText;
	this.tree;
	this.pageCache = [];
	this.kmlCache = [];
	this.cloudCache = [];
	for (var i = 0; i < this.pages; i++) {
		this.pageCache.push(false);
		this.kmlCache.push(false);
		this.cloudCache.push(false);
	}
};
