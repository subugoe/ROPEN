/**
 * Creates an instance of the Images View
 *
 * @constructor
 * @this {Images}
 * @param {Document} document The document to be shown in the Images view.
 * @param {DIV} container The conatiner div for the Images view.
 * @param {DocumentDialog} parent The parent document dialog.
 */
Images = function(document,container,parent){
	this.type = "images";
	this.path = document.imagePath;
	this.images = document.images;
	this.pages = document.pages;
	this.container = container;
	this.parent = parent;
	this.initialize();
}

/**
 * Initializes the views HTML items and activates the required pagination panel in the parent document dialog.
 *
 * @this {Images}
 */
Images.prototype.initialize = function(){
	var context = this;
	this.parent.paginator.setTriggerFunc(function(page){
		context.showPage(page);
		context.parent.pageChanged(page);
	});
	this.parent.showPagination();
}

/**
 * Shows the image (digital copy) of a given page with openlayers
 *
 * @this {Images}
 * @param {number} page The page to be shown.
 */
Images.prototype.showPage = function(page){
	if( this.container.width() == 0 ){
		return;
	}
	if( this.actualPage != page ){
		this.zoom = 0;
		this.center = undefined;
	}
	this.actualPage = page;
	var doc = this;
	this.container.empty();
	var width = this.container.width()-4;
	var height = this.container.height()-4;
	var url = this.path+"1200/"+this.images[page-1];
	this.parent.startProcessing();
	var mapId = EditionGui.getIndependentId();
	var zoomDiv = $("<div id='imageZoom"+mapId+"'/>").appendTo(this.container);
	zoomDiv.css('width',width+'px');
	zoomDiv.css('height',height+'px');
	zoomDiv.css('position','relative');
	this.map = new OpenLayers.Map("imageZoom"+mapId, { fractionalZoom: true } );
	var navi = new OpenLayers.Control.Navigation();
	navi.wheelChange = function(evt, deltaZ){
		if( doc.zoom == 0 && deltaZ < 0 ){
			return;
		}
		var zf = EditionProperties.fractionalZoomFactor;
		var newZoom = Math.round( ( doc.zoom + deltaZ*zf ) * 10 ) / 10;
		doc.zoom = newZoom;	
		if (!this.map.isValidZoomLevel(newZoom)) {
			return;
		}
		var zoomPoint = this.map.getLonLatFromPixel(evt.xy);
		var size    = this.map.getSize();
		var deltaX  = size.w/2 - evt.xy.x;
		var deltaY  = evt.xy.y - size.h/2;
		var newRes  = this.map.baseLayer.getResolutionForZoom(newZoom);
		var x = zoomPoint.lon + deltaX * newRes;
		var y = zoomPoint.lat + deltaY * newRes;
		this.map.setCenter( new OpenLayers.LonLat(x,y), newZoom );
		doc.center = { x: x, y: y };
	};
	navi.defaultDblClick = function(evt){
	    var newCenter = this.map.getLonLatFromViewPortPx(evt.xy);
	    this.map.setCenter(newCenter, this.map.zoom + 1);
	    doc.zoom += 1;
	}
	this.map.zoomIn = function() {
		doc.zoom++;
       		this.zoomTo(doc.zoom);
	}
	this.map.zoomOut = function() {
		if( doc.zoom > 1 ){
			doc.zoom--;
		}
		else {
			doc.zoom = 0;
		}
       		this.zoomTo(doc.zoom);
	}
	this.map.zoomToMaxExtent = function(options) {
	        var restricted = (options) ? options.restricted : true;
		var maxExtent = this.getMaxExtent({
		    'restricted': restricted 
		});
		this.zoomToExtent(maxExtent);
		doc.zoom = 0;
	}
	this.map.addControl(navi);
	var graphic = new Image();
	graphic.onerror = function(){
		doc.container.empty();
		$(Util.getErrorMessage(404)).appendTo(doc.container);
		doc.parent.stopProcessing();
	}
	graphic.onload = function(){
		var w = graphic.naturalWidth || this.width;
		var h = graphic.naturalHeight || this.height;
		var ws, hs;
		if( height/h*w < width ){
			hs = height;
			ws = height/h*w;
		}
		else {
			ws = width;
			hs = width/w*h;       				
		}
   		var imageLayer = new OpenLayers.Layer.Image(
			'Page '+page,
			url,
			new OpenLayers.Bounds(-w/2, -h/2, w, h),
			new OpenLayers.Size(ws,hs),
			{isBaseLayer: true, displayInLayerSwitcher: false}
   		);
   		doc.map.addLayer(imageLayer);
		if( typeof doc.initialZoom != 'undefined' ){
			doc.map.zoomTo(doc.initialZoom);
			doc.zoom = doc.initialZoom;
			doc.initialZoom = undefined;
		}
		else {
			doc.map.zoomTo(doc.zoom);
		}
		if( typeof doc.initialCenter != 'undefined' ){
			doc.map.setCenter( new OpenLayers.LonLat(doc.initialCenter.x,doc.initialCenter.y) );
			doc.center = doc.initialCenter;
			doc.initialCenter = undefined;
		}
		else if( typeof doc.center != 'undefined' ){
			doc.map.setCenter( new OpenLayers.LonLat(doc.center.x,doc.center.y) );
		}
		else {
			doc.map.setCenter( new OpenLayers.LonLat(Math.round(ws/2),Math.round(hs/2)) );
			doc.center = { x: Math.round(ws/2), y: Math.round(hs/2) };
		}
		doc.parent.stopProcessing();
	}
	graphic.src = url;
};

/**
 * Display a page by triggering the parent document dialogs paginator
 *
 * @this {Images}
 * @param {number} page The page to be shown.
 */
Images.prototype.display = function(page){
	page ? this.parent.paginator.setPage(page,false) : this.parent.paginator.setPage(1,false);
};

/**
 * Resizes the Images view.
 *
 * @this {Images}
 */
Images.prototype.resize = function(){
	$(this.container).css('height',$(this.container).height()+'px');
	if( typeof this.actualPage != 'undefined' ){
		this.showPage(this.actualPage);
	}
};

/**
 * Updates this Images view if its parent document dialog is linked to other views for the same document and a 'pageChange' event was performed in one of these other linked views
 *
 * @this {Images}
 * @param {JSON} change The information for the view update. It contains a type (e.g. 'pageChange') and a data information (e.g. the new page number in case of a 'pageChange' event)
 */
Images.prototype.onChange = function(change){
	if( change.type == "pageChange" ){
		if( this.actualPage != change.data ){
			this.parent.page = change.data;
			this.parent.paginator.setPage(change.data,true);
			this.showPage(change.data);
		}
	}
};
