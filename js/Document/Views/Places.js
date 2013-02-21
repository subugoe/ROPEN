/**
 * Creates an instance of the Places View
 *
 * @constructor
 * @this {Places}
 * @param {Document} document The document to be shown in the Places view.
 * @param {DIV} container The conatiner div for the Places view.
 * @param {DocumentDialog} parent The parent document dialog.
 */
Places = function(document,container,parent){
	this.type = "map";
	this.images = document.images;
	this.pages = document.pages;
	this.document = document;
	this.container = container;
	this.parent = parent;
	this.documentScope = EditionProperties.documentScope;
	this.initialize();
}

/**
 * Initializes the map widget to display the places and activates pagination and/or scope selection panels
 *
 * @this {Places}
 */
Places.prototype.initialize = function(){
	var context = this;
	this.parent.paginator.setTriggerFunc(function(page){
		context.showPage(page);
		context.parent.pageChanged(page);
	});
	if( EditionProperties.scopeSelection ){
		this.buttonPanel = $('<div/>').appendTo(this.container);
		this.buttonPanel.addClass('buttonPanel');
		var id = 'scope'+EditionGui.getIndependentId();
		var documentPlaces = $("<input type='radio' name='"+id+"'>"+Util.getString('documentPlaces')+"</input>").appendTo(this.buttonPanel);
		var placesByPages = $("<input type='radio' name='"+id+"'>"+Util.getString('placesByPages')+"</input>").appendTo(this.buttonPanel);
		if( this.documentScope ){
			$(documentPlaces).attr('checked',true);
		}
		else {
			$(placesByPages).attr('checked',true);
		}
		var setScope = function(scope){
			if( context.documentScope != scope ){
				if( scope ){
					context.parent.hidePagination();
				}
				else {
					context.parent.showPagination();
				}
				context.documentScope = scope;
				context.display(context.parent.page);
				context.resize();
			}
		};
		$(documentPlaces).click(function(){
			setScope(true);
		});
		$(placesByPages).click(function(){
			setScope(false);
		});
	}
	this.contentPanel = $('<div/>').appendTo(this.container);
	$(this.contentPanel).css('z-index',1);
	$(this.contentPanel).css('overflow','hidden');
	$(this.contentPanel).css('position','relative');
	$(this.contentPanel).css('height',$(this.container).height()+'px');
	$(this.contentPanel).css('width','100%');
	this.map = new WidgetWrapper();
	new MapWidget(this.map,$(this.contentPanel)[0],{
		mapWidth: false,
		mapHeight: false,
		mapSelection: false,
		mapSelectionTools: false,
		dataInformation: false,
		mapCanvasFrom: '#DDD',
		mapCanvasTo: '#DDD',
		maxPlaceLabels: 8
	});
}

/**
 * Retrieves and shows the places for a given page by updating the map widget.
 *
 * @this {Places}
 * @param {number} page The places of the given page will be shown (p = 0 for all places of the document).
 */
Places.prototype.show = function(page){
	var context = this;
	if( !this.document.kmlCache[page] ){
		if( !this.stopped ){
			context.parent.stopProcessing();
		}
		this.stopped = false;
		context.parent.startProcessing();
		var callback = function(kml){
			context.document.kmlCache[page] = GeoTemConfig.loadKml(kml);
			if( !context.stopped ){
				context.map.display([new Dataset(context.document.kmlCache[page])]);
				context.parent.stopProcessing();
			}
		}
		DocumentServerConnection.getDocumentKml(this.document,page,callback);
	}
	else {
		this.map.display([new Dataset(this.document.kmlCache[page])]);
	}
};

/**
 * Display places mentioned on a given page.
 *
 * @this {Places}
 * @param {number} page The places of the given page will be shown.
 */
Places.prototype.showPage = function(page){
	if( this.contentPanel.width() == 0 ){
		return;
	}
	if( this.actualPage != page ){
		this.zoom = 0;
		this.center = undefined;
		this.actualPage = page;
	}
	this.show(page);
};

/**
 * Display all places of the document
 *
 * @this {Places}
 */
Places.prototype.showPlaces = function(){
	if( this.contentPanel.width() == 0 ){
		return;
	}
	this.show(0);
};

/**
 * Display the places for the document (page = 0) or a given page (page > 0)
 *
 * @this {Places}
 * @param {number} page The page to be shown.
 */
Places.prototype.display = function(page){
	if( this.documentScope ){
		this.showPlaces();
	}
	else {
		page ? this.parent.paginator.setPage(page,false) : this.parent.paginator.setPage(1,false);
	}
};

/**
 * Resizes the map widget.
 *
 * @this {Places}
 */
Places.prototype.resize = function(){
	if( EditionProperties.scopeSelection ){
		$(this.contentPanel).css('height',($(this.container).height()-$(this.buttonPanel).height())+'px');
	}
	else {
		$(this.contentPanel).css('height',$(this.container).height()+'px');
	}
	$(this.contentPanel).css('width','100%');
	this.map.widget.gui.resize();
};

/**
 * Updates this Places view if its parent document dialog is linked to other views for the same document and a 'pageChange' event was performed in one of these other linked views
 *
 * @this {Places}
 * @param {JSON} change The information for the view update. It contains a type (e.g. 'pageChange') and a data information (e.g. the new page number in case of a 'pageChange' event)
 */
Places.prototype.onChange = function(change){
	if( change.type == "pageChange" ){
		if( this.actualPage != change.data ){
			this.parent.page = change.data;
			this.parent.paginator.setPage(change.data,true);
			this.showPage(change.data);
		}
	}
};
