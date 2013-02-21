/**
 * Edition Configuration File. The given settings are default values and can be overwritten by calling EditionGui.initialize() with preferred settings.
 *
 * @constructor
 * @this {EditionProperties}
 */
var EditionProperties = {

		/**
		  dynamic gui configuration
		*/
		windowHeight:	650,		// false for dynamic height, height in pixel otherwise
		browserWidth:	300,		// false for dynamic width, width in pixel otherwise
		margin:		60,		// margin to window borders
		windowGap:	30,		// margin between windows
		folders:	2,		// initial number of folders

		/**
		  static gui configuration
		  false or predefined guiConfig, an example:
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
		   Google URL Shortener request link; if API key required, change link to something like:
		   'https://www.googleapis.com/urlshortener/v1/url?key={KEY_HERE}'
		*/
		urlShortenerRequest: 'https://www.googleapis.com/urlshortener/v1/url',

		// initial size for hyperlink windows to open external websites
		hyperlinkWindow: true,
		hyperlinkWindowWidth: 758,
		hyperlinkWindowHeight: 500,

		// maximum allowed number of documents in a folder
		maxDocuments: 10,

		// maximum allowed number of conent windows
		maxWindows: 6,

		// minimum size for windows
		minWindowHeight: 310,
		minWindowWidth: 310,

		// a valid url to DFG viewer if documents can be shown there, false if not
		dfgViewer: 'http://dfg-viewer.de/demo/viewer/?set[mets]=',
		pdfLink: 'http://gdz-srv1.sub.uni-goettingen.de/gcs/gcs?action=pdf&metsFile=DOC_ID&divID=LOG_0003&pagesize=A4&pdfTitlePage=http://gdz.sub.uni-goettingen.de/dms/load/pdftitle/?metsFile=PPN385030444_1865_2%7C&targetFileName=DOC_ID_LOG_0003.pdf', // link or false, if not

		/**
		   Text document options
		*/
    		lineNumbering: 1, // a valid integer for line number steps if line numbering is allowed, false if not
    		numbersOnStart: false, // initial line numbering (if lineNumbering=true)
		colorizeEntities: true,	// coloring of entities
		colorizeOnStart: false,	// initial coloring of entities (if colorizeEntities=true)

		/**
		   Options for scope of map and tags
		*/
    		scopeSelection: true, // if the user can change the scope for these views
    		documentScope: false, // the initial scope for these views

		/**
		   Image zoom options
		*/
    		fractionalZoomFactor: 0.1, // f.i. 0.1 makes 10 zoom steps instead of one

		/**
		   windows gui options
		*/
		draggable: true,	// if windows can be dragged
		resizable: true,	// if windows can be resized
		concealable: true,	// if windows can be concealed (minimized)		
		removable: true,	// if folders can be removed; browser cannot be removed
		addable: true,		// if folders can be added
		connectable: true,	// if tabs of folders can be connected
		gridLayout: true,	// if grid layout is a provided option
		automaticGridLayout: true,	// true for consistent grid layout, false for single grid layout
		magneticLink: true,	// if magnetic link is a provided option in the document menu
		fullscreen: true, // if browser fullscreen is allowed
		
		/**
		   Tooltip mode for colored entities; 'click' or 'hover' are possible
		   'click': a tooltip can be fixed via mouse click, then its content is accessible
		   'hover': a tooltip will be fixed if the user hovers it before he leaves the corresponding link
		*/
		tooltipMode: 'hover',

		maxTags: 50,		// maximum number of tags to be displayed in tag cloud
		
		// document related queries
		documentEndpoint: 	'/exist/rest/db/archaeo18/queries/listDocs.xquery',
//		documentEndpoint: 	'/archaeo18/testdata/docs/listDocs.xquery',
		textQuery: 		'/exist/rest/db/archaeo18/queries/getText.xq?mode=raw&format=xhtml&doc=DOC_ID&page=0',
		pageQuery: 		'/exist/rest/db/archaeo18/queries/getText.xq?mode=raw&format=xhtml&doc=DOC_ID&page=PAGE_ID',
		outlineQuery: 		'/exist/rest/db/archaeo18/queries/getText.xq?mode=structure&format=xhtml&doc=DOC_ID',
		pageCountQuery: 	'/exist/rest/db/archaeo18/queries/pageCount.xquery?doc=DOC_ID',
		searchQuery: 		'/exist/rest/db/archaeo18/queries/search.xq?query=QUERY_ID&mode=xhtml',
		facetsQuery: 		'/exist/rest/db/archaeo18/queries/getFacets.xq',
		metadataQuery: 		'/exist/rest/db/archaeo18/queries/getText.xq?mode=header&format=xhtml&doc=DOC_ID',
		//facetTableQuery:	'/exist/rest/db/archaeo18/queries/experimental/listEntities.xq?facet=FACET_ID&format=xhtml',
		facetTableQuery:	'./testdata/indices/listEntities.xq?facet=FACET_ID&format=xhtml',
		tagcloudQuery:		'/exist/rest/db/archaeo18/queries/experimental/listEntities.xq?facet=FACET_ID&format=cloud',
		mapQuery:		'/exist/rest/db/archaeo18/queries/experimental/listEntities.xq?facet=FACET_ID&format=kml',
		tagcloudPageQuery:	'/exist/rest/db/archaeo18/queries/getText.xq?doc=DOC_ID&page=PAGE_ID&format=cloud&facet=FACET_ID',
		kmlQuery: 		'/exist/rest/db/archaeo18/queries/getText.xq?format=kml&doc=DOC_ID&page=PAGE_ID',
		teiUri: 		'/exist/rest/db/archaeo18/data/tei/DOC_ID.xml',
		metsUri: 		'/exist/rest/db/archaeo18/data/mets/DOC_ID.mets.xml',

		// wikipedia link colors
		colors: {
			validLink: '#0645ad',
			invalidLink: '#ba0000'
		},

		// if search window should be shown on startup (true) or not (documents)
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
