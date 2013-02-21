/**
 * Main container of the Edition. It holds all folders and the browser window.
 *
 * @constructor
 * @this {EditionGui}
 */
var EditionGui = new function(){
	this.folders = [];
	this.windowIndex = 0;
	this.independentId = 0;
	this.automaticGridLayout = false;
	this.zIndex = 0;
	this.magneticLinks = [];

	/**
	* stops loading process of actual window tab
	*/
	$(document).keypress(function(e){
		if( e.keyCode == 27 ){
			e.preventDefault();
			EditionGui.activeWindow.stopProcessing();
		}
	});

	/**
	* automatic grid layout, if user resizes browser
	*/
	$(window).resize(function(){
		EditionGui.gridLayout();
	});	
}

/**
 * Initializes a certain number of empty folders.
 *
 * @this {EditionGui}
 * @param {number} number The number of folders to create.
 */
EditionGui.initializeFolders = function(number){
	for( var i=0; i<number; i++ ){
		this.addFolder();
	}
};

/**
 * Get the current highest z-index inside the main window. Required the rise the z-index of a folders, the user clicks on, which is overlapped by another folder. Furthermore, the z-index for dialogs (add folder, magnetic link) is retrieved from this method.
 *
 * @this {EditionGui}
 * @return {number} The current highest z-index.
 */
EditionGui.getZIndex = function(){
	return ++this.zIndex;
};

/**
 * Adds a new folder to the main window.
 *
 * @this {EditionGui}
 */
EditionGui.addFolder = function(){
	var folder = $('<div/>').appendTo(this.containerDiv);
	$.extend(folder,new FrameWindow());
	folder.initialize({
		draggable: EditionProperties.draggable,
		resizable: EditionProperties.resizable,
		concealable: EditionProperties.concealable,
		removable: EditionProperties.removable,
		triggerResize: function(){ folder.resizeContent(); },
		triggerRemove: function(){ EditionGui.removeFolder(folder); },
		class: 'window'
	});
	$.extend(folder,new Folder(++this.windowIndex));
	folder.initialize();
	this.folders.push(folder);
	folder.setSize(this.windowWidth,EditionProperties.windowHeight);
	folder.resize();
	folder.resizeContent();
	folder.css('top',(($(this.containerDiv).height()-folder.height())/2)+'px');
	folder.css('left',(($(this.containerDiv).width()-folder.width())/2)+'px');
	folder.setFixed(this.automaticGridLayout);
};

/**
 * Initialization of the main window. Either an empty setting is created (browser + folders) or a magnetic link will be utilized. Furthermore, the loading of facets and documents is triggered here.
 *
 * @this {EditionGui}
 */
EditionGui.initialize = function(settings){
	if( typeof settings != 'undefined' ){
		EditionProperties.applySettings(settings);
	}
	var gui = this;
	this.containerDiv = $('#editionContainer');
	this.containerDiv.css('height',(EditionProperties.windowHeight+2*EditionProperties.margin)+'px');
	GeoTemConfig.applySettings({
		language: EditionGui.language,
		allowFilter: false,
		highlightEvents : false,
		selectionEvents : false
	});
	Util.loadFacets();
	this.browser = $('<div/>').appendTo(this.containerDiv);
	$.extend(this.browser,new FrameWindow());
	this.browser.initialize({
		draggable: EditionProperties.draggable,
		resizable: EditionProperties.resizable,
		concealable: EditionProperties.concealable,
		removable: false,
		triggerResize: function(){ gui.browser.resizeContent(); },
		class: 'search'
	});
	$.extend(this.browser,new Browser());
	this.browser.initialize();
	this.browser.setSize(EditionProperties.windowWidth,EditionProperties.windowHeight);
	this.browser.resize();
	this.browser.resizeContent();
	this.browser.setFixed(this.automaticGridLayout);
	Util.loadDocuments(function(doc){
    		gui.browser.addDocument(doc);
	});
	this.addControls();
	this.minHeight = $(this.containerDiv).height();
	if( window.location.href.indexOf('?params') != -1 ){
		this.setParams( window.location.href.slice(window.location.href.indexOf('?params=') + 8) );
	}
	else if( EditionProperties.guiConfig ){
		this.initializeFolders(EditionProperties.guiConfig.windows.length);
		this.initialLayout();
	}
	else {
		this.initializeFolders(EditionProperties.folders);
		this.gridLayout();
	}
};

/**
 * If an initial gui layout is defined in the Edition Properties, the values (position,size) are attached here to the initialized windows.
 *
 * @this {EditionGui}
 */
EditionGui.initialLayout = function(){
	var conf = EditionProperties.guiConfig;
	this.browser.position(conf.browser.left,conf.browser.top);
	this.browser.setSize(conf.browser.width,conf.browser.height);
	this.browser.resize();
	var xmin = this.browser.offset().left;
	var xmax = this.browser.offset().left + this.browser.width();
	var ymin = this.browser.offset().top;
	var ymax = this.browser.offset().top + this.browser.height();
	var min = Math.min( EditionProperties.guiConfig.windows.length, this.folders.length );
	for( var i=0; i<min; i++ ){
		var folder = this.folders[i];
		folder.position(conf.windows[i].left,conf.windows[i].top);
		folder.setSize(conf.windows[i].width,conf.windows[i].height);
		folder.resize();
		folder.resizeContent();
		if( folder.offset().left < xmin ){
			xmin = folder.offset().left;
		}
		if( folder.offset().left + folder.width() > xmax ){
			xmax = folder.offset().left + folder.width();
		}
		if( folder.offset().top < ymin ){
			ymin = folder.offset().top;
		}
		if( folder.offset().top + folder.height() > ymax ){
			ymax = folder.offset().top + folder.height();
		}
	}
	var shiftX = Math.round(($(document).width()-xmax+xmin)/2);
	var shiftY = Math.round(($(document).height()-ymax+ymin)/2);
	this.browser.position(this.browser.offset().left+shiftX,this.browser.offset().top+shiftY);
	for( var i=0; i<min; i++ ){
		var folder = this.folders[i];
		folder.position(folder.offset().left+shiftX,folder.offset().top+shiftY);
	}
};
	
/**
 * Checks the height of the main containers windows to re-assign a new height to the main container div; required when windows are dragged over the main containers div boundaries.
 *
 * @this {EditionGui}
 */
EditionGui.checkHeight = function(){
	var highest;
	for( var i=0; i<this.folders.length; i++ ){
		var folder = this.folders[i];
		var yMax = $(folder).height() + $(folder).position().top;
		if( typeof highest == 'undefined' || yMax > highest ){
			highest = yMax;
		}
	}
	var yMaxBrowser = $(this.browser).height() + $(this.browser).position().top;
	if( typeof highest == 'undefined' || yMaxBrowser > highest ){
		highest = yMaxBrowser;
	}
	if( highest < this.minHeight - EditionProperties.margin ){
		highest = this.minHeight - EditionProperties.margin;
	}
	if( $(EditionGui.containerDiv).height() != highest + EditionProperties.margin ){
		$(EditionGui.containerDiv).css('height',(EditionProperties.margin+highest)+'px');
	}
};
	
/**
 * Creates a dialog window. (e.g. open document dialog) with a given headline, content, position and a an onclose functionality.
 *
 * @this {EditionGui}
 * @param {string} headline The headline of the dialog (e.g. 'Add folder').
 * @param {HTML} content The content to be shown in the dialog.
 * @param {Object} event A mouseevent which is used to relatively position the dialog window.
 * @param {number} sx The dialog will be placed sx pixels right of the mouseevents position.
 * @param {number} sy The dialog will be placed sy pixels below of the mouseevents position.
 * @param {Object} onclose A trigger function to be called, when the dialog gets closed.
 */
EditionGui.createDialog = function(headline,content,event,sx,sy,onclose){
	var gui = this;
	var id = "dialog"+this.getIndependentId();
	var dialog = $('<div id="'+id+'" class="dialog"/>').appendTo(this.containerDiv);
	var closeDialog = function(){			
		$(dialog).remove();
		if( typeof onclose != 'undefined' ){
			onclose();
		}
	}
	var zIndex = this.getZIndex();
	$(dialog).css('z-index',zIndex);
	$(dialog).mousedown(function(){
		if( gui.zIndex != zIndex ){
			zIndex = gui.getZIndex();
			$(dialog).css('z-index',zIndex);
		}
	});
	$('<div class="text">'+headline+'</div>').appendTo(dialog);
	var ul = $('<ul class="dialog-tools"/>').appendTo(dialog);
	var close = $('<li><a class="button-close"/><span class="visuallyhidden"></span></a></li>').appendTo(ul);
	$(close).css('display','inherit');
	$(close).click(closeDialog);
	$(content).appendTo(dialog);
	$('#'+id).draggable({handles: 'e'});
	if( sx < 0 ){
		sx -= $(dialog).width();
	}
	if( sy < 0 ){
		sy -= $(dialog).height();
	}
	if( event ){
		var pos = Util.getMousePosition(event);
		$(dialog).css('top',(pos.top-$(this.containerDiv).offset().top+sy)+'px');
		$(dialog).css('left',(pos.left+sx)+'px');
	}
	else {
		$(dialog).css('top','200px');
		$(dialog).css('left',($(this.containerDiv).width()/2-$(dialog).width()/2)+'px');
	}
	return dialog;
}; 

/**
 * If one of the folders was removed, the names of the other folders are updated.
 *
 * @this {EditionGui}
 */
EditionGui.updateNames = function(){
	$.each(this.folders,function(i,folder){
		folder.updateName(i+1);
	});
};
	
/**
 * Getter for an independent ID to be appended when creating new HTML elements that require different IDs.
 *
 * @this {EditionGui}
 * @return {number} The independent ID.
 */
EditionGui.getIndependentId = function(){
	return ++this.independentId;
};

/**
 * Removes the given folder from the screen.
 *
 * @this {EditionGui}
 * @param {Folder} folder The folder to be removed.
 */
EditionGui.removeFolder = function(folder){
	folder.remove();
	for( var i=0; i<this.folders.length; i++ ){
		if( folder == this.folders[i] ){
			this.folders.splice(i,1);
			break;
		}
	}
	this.updateNames();
};

/**
 * Positions and resizes browser and folders to match a grid layout like: || || || ||. Triggered when 'Automatic Grid Layout' buttons was pressed or the internet browser was resized.
 *
 * @this {EditionGui}
 */
EditionGui.gridLayout = function(){
	var gui = this;
	var borderGap = parseInt($(this.browser).css('border-left-width')) + parseInt($(this.browser).css('border-right-width'));
	var marginGap = EditionProperties.margin;
	var windowGap = EditionProperties.windowGap;
	$(this.containerDiv).css('width','100%');
	var w = $(this.containerDiv).width();
	var h = this.minHeight;
	var windowHeight, windowWidth;		
	if( EditionProperties.windowHeight ){
		windowHeight = EditionProperties.windowHeight;
	}
	else {
		windowHeight = h-2*marginGap;
	}
	var windowTop = Math.max( marginGap, Math.floor( (h-windowHeight)/2 ) );
	var visibleWindows = 0;
	$.each(this.folders,function(i,folder){
		if( folder.visibility ){
			visibleWindows++;
		}
	});
	var availableWidth = w - 2*marginGap;
	availableWidth -= visibleWindows*(windowGap+borderGap);
	if( !this.browser.visibility ){
		availableWidth += windowGap;
	}
	else {
		availableWidth -= borderGap;
	}
	if( EditionProperties.browserWidth ){
		if( this.browser.visibility ){
			availableWidth -= EditionProperties.browserWidth;
		}
		windowWidth = Math.floor(availableWidth/visibleWindows);
		if( this.browser.visibility ){
			this.browser.setSize(EditionProperties.browserWidth,windowHeight);
		}
	}
	else {
		if( this.browser.visibility ){
			windowWidth = Math.floor(availableWidth/(visibleWindows+1));
			this.browser.setSize(windowWidth,windowHeight);
		}
		else {
			windowWidth = Math.floor(availableWidth/visibleWindows);
		}
	}
	if( windowWidth < EditionProperties.minWindowWidth ){
		$(this.containerDiv).css('width',(w+(EditionProperties.minWindowWidth-windowWidth)*visibleWindows)+'px');
		windowWidth = EditionProperties.minWindowWidth;
	}
	if( windowHeight < EditionProperties.minWindowHeight ){
		windowHeight = EditionProperties.minWindowHeight;
	}
	var folderLeft = marginGap;
	if( this.browser.visibility ){
		this.browser.position(marginGap,windowTop);
		this.browser.resize();
		this.browser.resizeContent();
		folderLeft += $(this.browser).width() + windowGap;
	}
	var j = 0;
	$.each(this.folders,function(i,folder){
		if( folder.visibility ){
			folder.position(folderLeft+j*(windowGap+windowWidth),windowTop);
			folder.setSize(windowWidth,windowHeight);
			folder.resize();
			folder.resizeContent();
			j++;
		}
	});
	if( typeof this.windowWidth == 'undefined' ){
		this.windowWidth = windowWidth;
	}
	this.checkHeight();	
};
	
/**
 * Opens a document with a given page, document type, fulltext position and/or activated facet. All of the 4 attributes are optional.
 *
 * @this {EditionGui}
 * @param {Object} event A mouseevent which is used to relatively position the created dialog window.
 * @param {Document} document The document to add to a folder.
 * @param {number} page A page to open when the document is shown.
 * @param {string} type The document type to be shown initially (e.g. 'pages').
 * @param {string} position A position to scroll to, when the selected document type is 'text' (used to navigate from the outline to the chapters in the fulltext).
 * @param {string} entity An entity, which should be initially colored (e.g. 'placeName').
 */
EditionGui.openDocument = function(evt,document,page,type,position,entity){
	var gui = this;
	var candidates = [];
	var doc = {
		document: document,
		page: page,
		type: type,
		position: position,
		entity: entity
	};
	$.each(this.folders, function(index,folder){
		if( folder.visibility && folder.documents.length < EditionProperties.maxDocuments ){
			candidates.push(folder);
		}
	});
	var openNewWindow = function(){
		gui.addFolder();
		gui.updateNames();
		gui.folders[gui.folders.length-1].addTab(doc);
		if( ( !EditionProperties.resizable && !EditionProperties.draggable ) || EditionGui.automaticGridLayout ){
			if( EditionProperties.guiConfig ){
				gui.initialLayout();
			}
			else {
				gui.gridLayout();
			}
		}
	}
	if( candidates.length == 0 ){
		openNewWindow();
	}
	else {
		var close;
		var inner = $('<div class="inner"/>');
		$.each(candidates, function(index,folder){
			var openButton = $('<a>'+folder.getName()+'</a>').appendTo(inner);
			openButton.click(function(){
				folder.addTab(doc);
				close();
			});
		});
		if( EditionGui.folders.length < EditionProperties.maxWindows ){
			var openNewButton = $('<a>'+Util.getString('newFolder')+'</a>').appendTo(inner);
			openNewButton.click(function(){
				openNewWindow();
				close();
			});
		}
		var dialog = this.createDialog(Util.getString('openDocument'),inner,evt,20,-20);
		close = function(){
			$(dialog).remove();
		}
	}
};		

/**
 * Computes a string, which represents the actual state of the main window. The string is used to generate a magnetic link. Currently part of the string representation are folders with all opened documents and the index of the selected tab, and for each opened document, the shown document type, the page, selected facets and its current "linked-status".
 *
 * @this {EditionGui}
 * @return {string} A string representation of the current state.
 */
EditionGui.getParams = function(){
	var gui = this;
	var getDelimitedString = function(delimiter,items){
		var string = '';
		for( var i=0; i<items.length; i++ ){
			if( i>0 ){
				string += delimiter;
			}
			string += items[i];
		}
		return string;
	};
	var getDocumentString = function(dialog){
		var items = [];
		items.push(dialog.document.title);
		items.push(dialog.document.nameShort);
		var type = dialog.getDocType();
		items.push(Util.getIdByType(type));
		items.push(dialog.page);
		if( dialog.linked ){
			items.push('1');
		}
		else {
			items.push('0');
		}
		var facets = dialog.facetSelection;
		var facetString = '';
		for( var i=0; i<facets.length; i++ ){
			if( facets[i] ){
				facetString += '1';
			}
			else {
				facetString += '0';
			}
		}
		items.push(facetString);
		return getDelimitedString(',',items);
	};
	var getFolderString = function(folder){
		var strings = [];
		strings.push(folder.getSelectedTab());
		for( var i=0; i<folder.documentDialogs.length; i++ ){
			strings.push(getDocumentString(folder.documentDialogs[i]));
		}
		return getDelimitedString(';',strings);
	};	
	var strings = [];
	for( var i=0; i<gui.folders.length; i++ ){
		strings.push(getFolderString(gui.folders[i]));
	}
	return getDelimitedString('_',strings);
};
	
/**
 * The method is used to utilize magnetic links. It extracts the information of the given magnetic-link-string and inizializes the main window dependent on the extracted parameters.
 *
 * @this {EditionGui}
 */
EditionGui.setParams = function(params){
	params = unescape(params);
	var data = params.split('_');
	this.initializeFolders(data.length);
	for( var i=0; i<data.length; i++ ){
		var folderParams = data[i].split(';');
		for( var j=1; j<folderParams.length; j++ ){
			var documentParams = folderParams[j].split(',');
			var document = Util.loadDocumentSync(documentParams[0],documentParams[1]);
			var type = Util.getTypeById(documentParams[1]);
			this.folders[i].addTab({
				document: document,
				page: parseInt(documentParams[2]),
				type: type
			});
			if( documentParams[3] == '1' ){
				this.folders[i].dialog().linkDialog();
			}
			var facets = [];
			var facetString = documentParams[4];
			for( var k=0; k<facetString.length; k++ ){
				if( facetString[k] == 0 ){
					facets.push(false);
				}
				else {
					facets.push(true);
				}
			}
			this.folders[i].dialog().setFacetSelection(facets);
		}
		this.folders[i].setSelectedTab(parseInt(folderParams[0]));
		this.folders[i].resize();
		this.folders[i].resizeContent();
	}
	this.gridLayout();
};

/**
 * This method adds the following controls to the main container window, if their corresponding parameters are set to 'true' in the configuration:
 * (1) add new folders (addable = true)
 * (2) generate magnetic links (magneticLink = true)
 * (3) automatic grid layout of the windows (gridLayout = true)
 * (4) browser fullscreen for the main container div (fullscreen = true)
 *
 * @this {EditionGui}
 */
EditionGui.addControls = function(){
	var gui = this;
	var controls = $('<div class="edition-tools"/>').appendTo(this.containerDiv);		
	if( EditionProperties.addable ){
		var addWindow = $('<a class="button-newwindow"><span class="visuallyhidden"></span>&nbsp;</a>').appendTo(controls);
		$(addWindow).attr('title',Util.getString('newFolder'));
		addWindow.click(function(){
			gui.addFolder();
			gui.updateNames();
			if( ( !EditionProperties.resizable && !EditionProperties.draggable ) || gui.automaticGridLayout ){
				if( EditionProperties.guiConfig ){
					gui.initialLayout();
				}
				else {
					gui.gridLayout();
				}
			}
		});
	}
	if( EditionProperties.magneticLink ){
		var linkList = $("<div/>");
		var updateLinks = function(){
			$(linkList).empty();
			if( gui.magneticLinks.length > 0 ){
				$("<p><hr/></p>").appendTo(linkList);
				var p = $("<p/>").appendTo(linkList);
				$("<div>"+Util.getString('generatedMagneticLinks')+"</div>").appendTo(p);
				for( var i=0; i<gui.magneticLinks.length; i++ ){
					var ml = gui.magneticLinks[i];
					var linkDiv = $("<div/>").appendTo(p);
					var link;
					if( ml.indexOf('goo.gl') == -1 ){
						link = $('<a target=_blank href="'+gui.magneticLinks[i]+'">MagneticLink</a>').appendTo(linkDiv);
					}
					else {
						link = $('<a target=_blank href="'+gui.magneticLinks[i]+'">'+gui.magneticLinks[i]+'</a>').appendTo(linkDiv);
					}
					$(link).css('border','none');
					$(link).css('box-shadow','none');
					$(link).css('background-color','white');
				}
			}
		}
		var generateMagneticLink = function(){
			var params = gui.getParams();
			var linkString = 'http://'+location.host+''+location.pathname+'#?params='+params;
			jsonlib.fetch({
				url: EditionProperties.urlShortenerRequest,
			    	header: 'Content-Type: application/json',
			    	data: JSON.stringify({longUrl: linkString})
			}, function(response){
			    	var result = null;
			    	try {
			      		result = JSON.parse(response.content).id;
			      		if (typeof result != 'string') result = null;
					if( result != null ){
						gui.magneticLinks.push(result);
						updateLinks();
					}
			    	} catch (e) {
				gui.magneticLinks.push(linkString);
					updateLinks();
			    	}
			});
		}
		var magneticLink = $('<a class="button-magneticlink"><span class="visuallyhidden"></span>&nbsp;</a>').appendTo(controls);
		$(magneticLink).attr('title',Util.getString('magneticLink'));
		magneticLink.click(function(evt){
			$(magneticLink).addClass('button-magneticlink-active');
			var content = $("<div class='inner'/>");
			$(content).css("text-align","center");
			var p = $("<p/>").appendTo(content);
			$("<div>"+Util.getString('newMagneticLink')+"</div>").appendTo(p);
			var generateButton = $('<a>'+Util.getString('generate')+'</a>').appendTo(p);
			generateButton.click(function(){
				generateMagneticLink();
			});
			$(linkList).appendTo(p);
			var onclose = function(){
				$(magneticLink).removeClass('button-magneticlink-active');
			}
			gui.createDialog(Util.getString('magneticLink'),content,evt,20,20,onclose);
		});
	}
	var gridDiv = $('<div class="gridselector"/>').appendTo(this.containerDiv);
	if( EditionProperties.gridLayout && ( EditionProperties.resizable || EditionProperties.draggable ) ){
		var gridButton = $('<a class="normal"><span class="visuallyhidden"></span>&nbsp;</a>').appendTo(gridDiv);
		if( EditionProperties.automaticGridLayout ){
			gridButton.attr('title',Util.getString('enableGridLayout'));
		}
		else {
			gridButton.attr('title',Util.getString('gridLayout'));
		}
		gridButton.click(function(){
			gui.toggleGridLayout();
		});
		gui.toggleGridLayout = function(){
			if( EditionProperties.automaticGridLayout ){
				gui.automaticGridLayout = !gui.automaticGridLayout;
				if( gui.automaticGridLayout ){
					gridButton.attr('class','active');
					gridButton.attr('title',Util.getString('disableGridLayout'));
					if( EditionProperties.guiConfig ){
						gui.initialLayout();
					}
					else {
						gui.gridLayout();
					}
				}
				else {
					gridButton.attr('class','normal');
					gridButton.attr('title',Util.getString('enableGridLayout'));
				}
			}
			else {
				if( EditionProperties.guiConfig ){
					gui.initialLayout();
				}
				else {
					gui.gridLayout();
				}
			}
			$.each(gui.folders.concat([gui.browser]),function(i,frame){
				frame.setFixed(gui.automaticGridLayout);
			});
		}
	}
	if( EditionProperties.fullscreen ){
		var fsButton = $('<a class="browser-fullscreen"><span class="visuallyhidden"></span>&nbsp;</a>').appendTo(gridDiv);
		fsButton.click(function(){
			if ($('.browser-fullscreen').hasClass('browser-fullscreen-off')) {
				$('#editionContainer').fullScreen(false);
				$('.browser-fullscreen').removeClass('browser-fullscreen-off');
			} else {
				$('#editionContainer').fullScreen(true);
				$('.browser-fullscreen').addClass('browser-fullscreen-off');
			}
		});
	}
};

/**
 * Checks, if the windows need to be realigned with initial or grid layout. (e.g. when adding a new folder)
 *
 * @this {EditionGui}
 */
EditionGui.checkGrid = function(){
	if( this.automaticGridLayout ){
		if( EditionProperties.guiConfig ){
			this.initialLayout();
		}
		else {
			this.gridLayout();
		}
	}		
};
