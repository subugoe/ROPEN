/**
 * Implements a tab of a folder to allow different views for a document.
 *
 * @constructor
 * @this {DocumentDialog}
 */
DocumentDialog = function(parent,document,div,page){	
	this.parent = parent;
	this.document = document;
	this.div = div;
	this.page = page || 0;
	this.doctypes = [];
	this.initialize();
}

/**
 * Initializes the GUI of the document dialog.
 *
 * @this {DocumentDialog}
 */
DocumentDialog.prototype.initialize = function(){
	this.container = $('<div/>').appendTo(this.div);
	this.container.css('position', 'relative' );
	this.overlay = new OverlayWindow(this.container);
	this.funcDiv = $('<div class="toolstop clearfix"/>').appendTo(this.container);
	this.facetDiv = $('<div class="toolstop clearfix facetSelectorDiv"/>').appendTo(this.container);
	this.docContainerDiv = $('<div class="windowcontent"/>').appendTo(this.container);
	this.docContainerDiv.css('overflow','auto');
	this.docTypeDiv = $('<div class="clearfix"/>').appendTo(this.container);
	this.initFunctions();
	this.initDocTypeSelector();
	this.resize();
};

/**
 * Initializes the top panel button functionality. (e.g. facet selection, pagination) of the document dialog (is part of the 'initialize' method).
 *
 * @this {DocumentDialog}
 */
DocumentDialog.prototype.initFunctions = function(){
	var dialog = this;
	var paginationTools = $("<ul/>").appendTo(this.funcDiv);
	this.paginator = new Pagination(paginationTools,this.document.pages);
	this.showPagination = function(){
		$(paginationTools).css('display','block');
	};
	this.hidePagination = function(){
		$(paginationTools).css('display','none');
	};
	var toolsList = $("<ul/>").appendTo(this.funcDiv);
	if( EditionProperties.lineNumbering ){
		var numberingLi = $('<li/>').appendTo(paginationTools);
		this.lineNumbering = $('<a class="tools-linecount"><span class="visuallyhidden"></span>&nbsp;</a>').appendTo(numberingLi);
		var setLineNumbering = function(){
			if( dialog.lineNumbers ){
				dialog.lineNumbering.addClass('active');
				dialog.lineNumbering.attr('title',Util.getString('hideLineNumbers'));
			}
			else {
				dialog.lineNumbering.removeClass('active');
				dialog.lineNumbering.attr('title',Util.getString('showLineNumbers'));
			}
		}
		this.lineNumbers = EditionProperties.numbersOnStart;
		setLineNumbering();
		this.lineNumbering.click(function(){
			dialog.lineNumbers = !dialog.lineNumbers;
			setLineNumbering();
			dialog.doctype.display();
		});
	}
	if( EditionProperties.pdfLink ){
		var pdfLi = $('<li/>').appendTo(toolsList);
		var pdf = $('<a class="tools-pdf"><span class="visuallyhidden"></span>&nbsp;</a>').appendTo(pdfLi);
		pdf.attr('title',Util.getString('pdf'));
		pdf.click(function(){
			var pdfLink = EditionProperties.pdfLink.replace('DOC_ID',dialog.document.title).replace('DOC_ID',dialog.document.title);
			window.open(pdfLink, '_blank');
		});
	}
	if( EditionProperties.dfgViewer ){
		var dfgLi = $('<li/>').appendTo(toolsList);
		var dfgViewer = $('<a class="tools-dfg"/>').appendTo(dfgLi);
		dfgViewer.attr('title',Util.getString('dfgViewer'));
		dfgViewer.click(function(){
			var metsLink = 'http://'+location.host+''+EditionProperties.metsUri.replace('DOC_ID',dialog.document.title);
			var link = EditionProperties.dfgViewer + '' + Util.asciiToHex(metsLink);
			window.open(link, '_blank');
		});
	}
	if( EditionProperties.connectable ){
		this.linked = false;
		var linkLi = $('<li/>').appendTo(toolsList);
		var link = $('<a class="tools-link"><span class="visuallyhidden"></span>&nbsp;</a>').appendTo(linkLi);
		link.attr('title',Util.getString('linkDeactivated'));
		this.linkDialog = function(){
			if( dialog.linked ){
				Publisher.Unsubscribe(dialog.document.title,dialog);
				$(link).removeClass('active');
				link.attr('title',Util.getString('linkDeactivated'));
			}
			else {
				Publisher.Subscribe(dialog.document.title,dialog,function(data){
					if( typeof dialog.doctype.onChange != 'undefined' ){
						dialog.doctype.onChange(data);
					}
				});
				$(link).addClass('active');
				link.attr('title',Util.getString('linkActivated'));
			}
			dialog.linked = !dialog.linked;
		}
		link.click(function(){
			dialog.linkDialog();
		});
		this.hideLink = function(){
			$(linkLi).css('display','none');
		};
		this.showLink = function(){
			$(linkLi).css('display','inline');
		};
	}
	this.facetSelector = new FacetSelector(this.facetDiv);
	this.facetSelection = this.facetSelector.getFacetSelection();
	this.showFacets = function(){
		$(dialog.facetDiv).css('display','block');
	};
	this.hideFacets = function(){
		$(dialog.facetDiv).css('display','none');
	};
};

/**
 * Initializes the bottom panel button functionality, more precisely, the buttons for the different views for a document and its interaction (is part of the 'initialize' method).
 *
 * @this {DocumentDialog}
 */
DocumentDialog.prototype.initDocTypeSelector = function(){
	var dialog = this;
	this.buttons = [];
	var viewsList = $('<ul class="pagination"/>').appendTo(this.docTypeDiv);
	var addButton = function(id){
		var li = $('<li/>').appendTo(viewsList);
		var button = $('<a class="tools-'+id+'"/>').appendTo(li);
		if( i==0 ){
			button = $('<a class="tools-'+id+'"><span class="visuallyhidden"></span>&nbsp;</a>').appendTo(li);
		}
		button.attr('title',Util.getString(id));
		button.click(function(){
			dialog.setDocType(id);
		});
		dialog.buttons.push({
			button: button,
			type: id
		});
	}
	for( var i in Util.docTypes ){
		addButton(Util.docTypes[i]);
	}
};

/**
 * Resizes this document dialog and the corresponding view.
 *
 * @this {DocumentDialog}
 */
DocumentDialog.prototype.resize = function(){
	var width = this.container.parent().width();
	var height = this.container.parent().height();
	height -= parseInt($(this.container.parent()).css("margin-top"))+parseInt($(this.container.parent()).css("margin-bottom"));
	this.container.css('height', height+"px" );
	this.container.css('width', width+"px" );
	var paddingX = parseInt($(this.docContainerDiv).css("padding-left"))+parseInt($(this.docContainerDiv).css("padding-right"));
	var paddingY = parseInt($(this.docContainerDiv).css("padding-top"))+parseInt($(this.docContainerDiv).css("padding-bottom"));
	this.docContainerDiv.css('height', (height-paddingY-this.docContainerDiv.offset().top+this.container.offset().top - this.docTypeDiv.height())+"px" );
	this.docContainerDiv.css('width', (width-paddingX)+"px" );
	this.docContainerDiv.css('maxHeight', (height-paddingY-this.docContainerDiv.offset().top+this.container.offset().top)+"px" );
	this.docContainerDiv.css('maxWidth', (width-paddingX)+"px" );
	if( this.doctype && typeof this.doctype.resize != 'undefined' ){
		this.doctype.resize();
	}
	this.overlay.resize();
};
	
/**
 * Displays a loader overlay div to highlight actual processing.
 *
 * @this {DocumentDialog}
 */
DocumentDialog.prototype.startProcessing = function(){
	var dialog = this;
	var stop = function(){
		dialog.doctype.stopped = true;
		dialog.overlay.removeOverlay();
	};
	this.overlay.loaderOverlay(stop);
};

/**
 * Removes the loader overlay div when processing is done.
 *
 * @this {DocumentDialog}
 */
DocumentDialog.prototype.stopProcessing = function(){
	this.doctype.stopped = true;
	this.overlay.removeOverlay();
};

/**
 * Shows the text of a document at a specific position. It is called by the Outline view when a link was clicked. Either the document dialog changes the view to 'text' or a 'positionChange' event is triggered (when the dialog is linked).
 *
 * @this {DocumentDialog}
 * @param {string} id The text position identifier.
 */
DocumentDialog.prototype.showTextAtPosition = function(id){
	if( this.linked ){
		Publisher.Publish(this.document.title, {
			type: 'positionChange',
			data: id
		}, this);
	}
	else {
		this.setDocType('text',id);
	}
};

/**
 * Triggers a 'pageChange' event for linked document dialogs.
 *
 * @this {DocumentDialog}
 * @param {number} page The new page.
 */
DocumentDialog.prototype.pageChanged = function(page){
	this.page = page;
	if( this.linked ){
		Publisher.Publish(this.document.title, {
			type: 'pageChange',
			data: page
		}, this);
	}
};

/**
 * Sets facet selection when magnetic links are utilized.
 *
 * @this {DocumentDialog}
 * @param {Array} facets An array of boolean values.
 */
DocumentDialog.prototype.setFacetSelection = function(facets){
	this.facetSelection = facets;
	if( typeof this.doctype.onChange != 'undefined' ){
		this.doctype.onChange({
			type: 'facetsChange',
			data: facets
		});
	}
};

/**
 * Activate a specific facet. Can be used to initially color entities of a specific type.
 *
 * @this {DocumentDialog}
 * @param {string} name The name of the facet (e.g. 'tei:placeName').
 */
DocumentDialog.prototype.activateFacet = function(name){
	if( typeof name != 'undefined' ){
		this.facetSelector.activateFacet(name);
		this.facetSelection = this.facetSelector.getFacetSelection();
	}
}	

/**
 * Triggers a 'facetsChange' event for linked document dialogs.
 *
 * @this {DocumentDialog}
 * @param {Array} facets An array of boolean values.
 */
DocumentDialog.prototype.facetsChanged = function(facets){
	this.facetSelection = facets;
	if( this.linked ){
		Publisher.Publish(this.document.title, {
			type: 'facetsChange',
			data: facets
		}, this);
	}
};

/**
 * Changes the view for the document and displays the corresponding content. Required buttons for a view are shown, others are hidden.
 *
 * @this {DocumentDialog}
 * @param {string} type An array of boolean values.
 * @param {string} id A fulltext id for jumping directly to a specific position.
 */
DocumentDialog.prototype.setDocType = function(type,id){
	if( typeof type == 'undefined' ){
		type = 'outline';
	}
	if( !this.doctype || this.doctype.type != type ){
		this.docContainerDiv.empty();
		if( type == 'pages' || type == 'text' ){
			this.lineNumbering.css('display','inline-block');
		}
		else {
			this.lineNumbering.css('display','none');
		}
		if( type == 'tei' || type == 'thumbnails' ){
			this.hideLink();
		}
		else {
			this.showLink();
		}
		if( type == 'outline' || type == 'thumbnails' || type == 'tei' || ( EditionProperties.documentScope && ( type == 'tags' || type == 'map' ) ) ){
			this.hidePagination();
		}
		else {
			this.showPagination();
		}
		if( type == 'outline' || type == 'thumbnails' || type == 'tei' || type == 'images' ){
			this.hideFacets();
		}
		else {
			this.showFacets();
		}
		if( type == 'text' ){
			this.doctype = new Text(this.document,this.docContainerDiv,this);
		}
		else if( type == 'pages' ){
			this.doctype = new Pages(this.document,this.docContainerDiv,this);
		}
		else if( type == 'thumbnails' ){
			this.doctype = new Thumbnails(this.document,this.docContainerDiv,this);
		}
		else if( type == 'images' ){
			this.doctype = new Images(this.document,this.docContainerDiv,this);
		}
		else if( type == 'tei' ){
			this.doctype = new TEI(this.document,this.docContainerDiv,this);
		}
		else if( type == 'outline' ){
			this.doctype = new Outline(this.document,this.docContainerDiv,this);
		}
		else if( type == 'map' ){
			this.doctype = new Places(this.document,this.docContainerDiv,this);
		}
		else if( type == 'tags' ){
			this.doctype = new Tags(this.document,this.docContainerDiv,this);
		}
		var dialog = this;
		$.each(this.buttons,function(i,button){
			$(button.button).removeClass('active');
			if( button.type == type ){
				$(button.button).addClass('active');
			}
		});
		this.resize();
	}
    	if( typeof id != 'undefined' && this.doctype.type == 'text' ){
		this.doctype.display(this.page,id);
    	}
    	else if( this.doctype.pages ){
		this.doctype.display(this.page);
    	}
    	else {
		this.doctype.display(id);
    	}
};
	
/**
 * Getter for the actual document type. (e.g. 'text'). Required to construct magnetic links.
 *
 * @this {DocumentDialog}
 */
DocumentDialog.prototype.getDocType = function(){
	if( this.doctype ){
		return this.doctype.type;
	}
	return undefined;
};
