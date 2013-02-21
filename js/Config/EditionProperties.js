/**
 * Edition Configuration File. The given settings are default values and can be overwritten by calling EditionGui.initialize() with preferred settings.
 *
 * @constructor
 * @this {EditionProperties}
 */
var EditionProperties = {

		/**
		  initial height of windows (browser, folder); false for dynamic height, height in pixel otherwise
		*/
		windowHeight: 650,

		/**
		  initial width of the browser; false for dynamic width, width in pixel otherwise
		*/
		browserWidth: 300,

		/**
		  minimum margin of each window to window borders
		*/
		margin:	60,

		/**
		  initial margin between windows
		*/
		windowGap: 30,

		/**
		  initial number of folders
		*/
		folders: 2,

		/**
		  static gui configuration; false or predefined guiConfig. An example:
			guiConfig: {
				browser: {
					top: 0,
					left: 0,
					height: 400,
					width: 400
				},
				windows: [{
						top: 440,
						left: 0,
						height: 400,
						width: 400
					},{
						top: 0,
						left: 440,
						height: 400,
						width: 400
					},{
						top: 440,
						left: 440,
						height: 400,
						width: 400
					}				
				]
			},
		*/
		guiConfig: false,

		/**
		   Google URL Shortener request link. If API key required, change link to something like:
		   'https://www.googleapis.com/urlshortener/v1/url?key={KEY_HERE}'
		*/
		urlShortenerRequest: 'https://www.googleapis.com/urlshortener/v1/url',

		/**
		  flag to allow/disallow opening external links in internal hyperlink windows
		*/
		hyperlinkWindow: true,

		/**
		  initial width for hyperlink windows
		*/
		hyperlinkWindowWidth: 758,

		/**
		  initial height for hyperlink windows
		*/
		hyperlinkWindowHeight: 500,

		/**
		  maximum allowed number of documents in a folder
		*/
		maxDocuments: 10,

		/**
		  maximum allowed number of folders
		*/
		maxWindows: 6,

		/**
		  minimum height for windows
		*/
		minWindowHeight: 310,

		/**
		  minimum width for windows
		*/
		minWindowWidth: 310,

		/**
		  an URL to DFG viewer if documents can be shown there, false if not
		*/
		dfgViewer: 'http://dfg-viewer.de/demo/viewer/?set[mets]=',

		/**
		  an URL to generate the PDF for documents
		*/
		pdfLink: 'http://gdz-srv1.sub.uni-goettingen.de/gcs/gcs?action=pdf&metsFile=DOC_ID&divID=LOG_0003&pagesize=A4&pdfTitlePage=http://gdz.sub.uni-goettingen.de/dms/load/pdftitle/?metsFile=PPN385030444_1865_2%7C&targetFileName=DOC_ID_LOG_0003.pdf', // link or false, if not

		/**
		  allow/disallow line numbering in textual views. A valid integer for line number steps if line numbering is allowed, false if not. (1 means to show line numbers on each line, 5 means to show line numbers for lines 5, 10, 15, ...)
		*/
    		lineNumbering: 1,

		/**
		  allow/disallow initial line numbering (if lineNumbering=true)
		*/
    		numbersOnStart: false,

		/**
		  allow/disallow coloring of entities
		*/
		colorizeEntities: true,

		/**
		  allow/disallow initial coloring of entities (if colorizeEntities=true)
		*/
		colorizeOnStart: false,

		/**
		   If the user shoul be able to change the scope for the views Places and Tags (document, page).
		*/
    		scopeSelection: true,

		/**
		   The initial scope for Places and Tags (document, page).
		*/
    		documentScope: false,

		/**
		   Image zoom factor. 0.1 makes 10 zoom steps instead of one.
		*/
    		fractionalZoomFactor: 0.1,

		/**
		   windows gui options: if windows can be dragged
		*/
		draggable: true,

		/**
		   windows gui options: if windows can be resized
		*/
		resizable: true,

		/**
		   windows gui options: if windows can be concealed (minimized)
		*/
		concealable: true,

		/**
		   windows gui options: if folders can be removed; browser cannot be removed
		*/
		removable: true,

		/**
		   windows gui options: if folders can be added
		*/
		addable: true,

		/**
		   windows gui options: if tabs of folders can be connected
		*/
		connectable: true,

		/**
		   windows gui options: if grid layout is a provided option
		*/
		gridLayout: true,

		/**
		   windows gui options: true for consistent grid layout, false for single grid layout
		*/
		automaticGridLayout: true,

		/**
		   windows gui options: if magnetic link is a provided option in the document menu
		*/
		magneticLink: true,

		/**
		   windows gui options: if browser fullscreen is allowed
		*/
		fullscreen: true,
		
		/**
		   Tooltip mode for colored entities; 'click' or 'hover' are possible.
		   'click': a tooltip can be fixed via mouse click, then its content is accessible
		   'hover': a tooltip will be fixed if the user hovers it before he leaves the corresponding link
		*/
		tooltipMode: 'hover',

		/**
		   maximum number of tags to be displayed in tag cloud
		*/
		maxTags: 50,
		
		/**
		   URL to retrieve the document list
		*/
		documentEndpoint: '/exist/rest/db/archaeo18/queries/listDocs.xquery',

		/**
		   URL to retrieve the fulltext of a document
		*/
		textQuery: '/exist/rest/db/archaeo18/queries/getText.xq?mode=raw&format=xhtml&doc=DOC_ID&page=0',

		/**
		   URL to retrieve a page of a document
		*/
		pageQuery: '/exist/rest/db/archaeo18/queries/getText.xq?mode=raw&format=xhtml&doc=DOC_ID&page=PAGE_ID',

		/**
		   URL to retrieve the outline of a document
		*/
		outlineQuery: '/exist/rest/db/archaeo18/queries/getText.xq?mode=structure&format=xhtml&doc=DOC_ID',

		/**
		   URL to retrieve the number of pages of a document
		*/
		pageCountQuery:	'/exist/rest/db/archaeo18/queries/pageCount.xquery?doc=DOC_ID',

		/**
		   URL to retrieve perform a search
		*/
		searchQuery: '/exist/rest/db/archaeo18/queries/search.xq?query=QUERY_ID&mode=xhtml',

		/**
		   URL to retrieve the existing facets
		*/
		facetsQuery: '/exist/rest/db/archaeo18/queries/getFacets.xq',

		/**
		   URL to retrieve tags for a document (whole document or page of a document)
		*/
		tagcloudPageQuery: '/exist/rest/db/archaeo18/queries/getText.xq?doc=DOC_ID&page=PAGE_ID&format=cloud&facet=FACET_ID',

		/**
		   URL to retrieve a KML file with places mentioned in a document (whole document or page of a document)
		*/
		kmlQuery: '/exist/rest/db/archaeo18/queries/getText.xq?format=kml&doc=DOC_ID&page=PAGE_ID',

		/**
		   URL to a documents TEI file
		*/
		teiUri: '/exist/rest/db/archaeo18/data/tei/DOC_ID.xml',

		/**
		   URL to a documents METS file
		*/
		metsUri: '/exist/rest/db/archaeo18/data/mets/DOC_ID.mets.xml',

		/**
		   URL to generate a metadata description for a document
		*/
		metadataQuery: '/exist/rest/db/archaeo18/queries/getText.xq?mode=header&format=xhtml&doc=DOC_ID',

		/**
		   URL to get entities of a specific kind for all documents in form of a table (for displaying with dataTables)
		*/
		facetTableQuery: './testdata/indices/listEntities.xq?facet=FACET_ID&format=xhtml',
		//facetTableQuery: '/exist/rest/db/archaeo18/queries/experimental/listEntities.xq?facet=FACET_ID&format=xhtml',

		/**
		   URL to get places mentioned in all documents
		*/
		mapQuery: '/exist/rest/db/archaeo18/queries/experimental/listEntities.xq?facet=FACET_ID&format=kml',

		/**
		   URL to get entities of a specific kind for all documents in form of a tag cloud (for displaying with jqcloud)
		*/
		tagcloudQuery: '/exist/rest/db/archaeo18/queries/experimental/listEntities.xq?facet=FACET_ID&format=cloud',

		/**
		   wikipedia link colors for coloring links when no entities are selected in the facet selection
		*/
		colors: {
			validLink: '#0645ad',
			invalidLink: '#ba0000'
		},

		/**
		   if search window should be shown on startup (true) or not (documents)
		*/
		browserSearch: true
	
}

/**
 * Function to overwrite the default Edition configuration.
 *
 * @this {EditionProperties}
 * @param {JSON} settings Preferred settings to overwrite the given defaults.
 */
EditionProperties.applySettings = function(settings) {
	$.extend(this, settings);
};
