/**
 * Implements an overlay window for a given div. Currently, it is required for displaying loader overlays and the TEI download dialog.
 *
 * @constructor
 * @this {OverlayWindow}
 * @param {HTML} div The parent div, the overlay window will be assigned to.
 */
OverlayWindow = function(div){
	this.div = div;
}

/**
 * Generates a loader overlay to be shown when data is retrieved from the server.
 *
 * @this {OverlayWindow}
 * @param {Object} onclose A trigger function to be called when the user closes/removes the overlay.
 */
OverlayWindow.prototype.loaderOverlay = function(onclose){
	var content = $("<div/>");
	content.css('position','absolute');
	content.append("<div class='loader'/>");
	this.setOverlay(content);
	if( typeof onclose != 'undefined' ){
		var close = $("<div/>").appendTo(this.overlayWindow.overlay);
		close.addClass('closeLoader');
		close.click(function(){
			onclose();
		});			
	}
}

/**
 * Generates a content overlay. Currently only used for the TEI download dialog.
 *
 * @this {OverlayWindow}
 * @param {HTML} contentDiv The HTML content to be shown in the overlay.
 */
OverlayWindow.prototype.contentOverlay = function(contentDiv){
	var fs = this;
	var content = $("<div class='blockContent'/>");
	var closeButton = $("<div class='closeOverlay'/>").appendTo(content);
	closeButton.click(function(){
		fs.removeOverlay();
	});
	$(contentDiv).appendTo(content);
	this.setOverlay(content);
}

/**
 * Calculates the bounds of the parent div.
 *
 * @this {OverlayWindow}
 * @return {JSON} The current width and height of the parent div.
 */
OverlayWindow.prototype.getBounds = function(){
	var w, h;
	if( this.div == 'body' ){
		w = $(document).width();
		h = $(document).height();
	}
	else {
		w = $(this.div).outerWidth();
		h = $(this.div).outerHeight();
	}
	var paddingX = parseInt($(this.div).css('padding-left'))+parseInt($(this.div).css('padding-right'));
	var paddingY = parseInt($(this.div).css('padding-top'))+parseInt($(this.div).css('padding-bottom'));
	return {
		width: w-paddingX,
		height: h-paddingY
	};
}

/**
 * Initializes the overlay window with the given content. (called by functions 'loaderOverlay' and 'contentOverlay')
 *
 * @this {OverlayWindow}
 * @param {HTML} content The HTML content to be shown in the overlay.
 */
OverlayWindow.prototype.setOverlay = function(content){
	var blockDiv = $("<div/>").appendTo(this.div);
	blockDiv.addClass("blockDiv");
	var bounds = this.getBounds();
	blockDiv.css('width',bounds.width+'px');
	blockDiv.css('height',bounds.height+'px');
	blockDiv.css('z-index',10000);
	blockDiv.css('top',parseInt($(this.div).css('padding-top'))+'px');
	var overlay = $("<div/>").appendTo(blockDiv);
	overlay.addClass("blockDivOverlay");
	overlay.css('width',bounds.width+'px');
	overlay.css('height',bounds.height+'px');
	$(content).appendTo(blockDiv);
	this.overlayWindow = {
		content: content,
		overlay: overlay,
		blockDiv: blockDiv
	};
	this.centerDiv(content);
}

/**
 * Centers the given content inside the parent div.
 *
 * @this {OverlayWindow}
 * @param {HTML} content The HTML content to be centered.
 */
OverlayWindow.prototype.centerDiv = function(content){
	var bounds = this.getBounds();
	var border = parseInt($(content).css('borderLeftWidth'));
	var left = Math.floor(bounds.width/2-content.width()/2) - border;
	var top = Math.floor(bounds.height/2-content.height()/2) - border;
	content.css('top', top+'px');
	content.css('left', left+'px');
}

/**
 * Removes the overlay from the parent div.
 *
 * @this {OverlayWindow}
 */
OverlayWindow.prototype.removeOverlay = function(){
	if( typeof this.overlayWindow != 'undefined' ){
		$(this.overlayWindow.blockDiv).remove();
		this.overlayWindow = undefined;
	}
}
	
/**
 * Resizes the overlay window.
 *
 * @this {OverlayWindow}
 */
OverlayWindow.prototype.resize = function(){
	if( typeof this.overlayWindow != 'undefined' ){
		this.overlayWindow.blockDiv.css('width',$(this.div).width()+'px');
		this.overlayWindow.blockDiv.css('height',$(this.div).height()+'px');
		this.overlayWindow.overlay.css('width',$(this.div).width()+'px');
		this.overlayWindow.overlay.css('height',$(this.div).height()+'px');
		this.centerDiv(this.overlayWindow.content);
	}
}
