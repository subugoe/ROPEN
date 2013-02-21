/**
 * Creates a window to display external hyperlinks. (e.g. Getty)
 *
 * @constructor
 * @this {HyperlinkWindow}
 */
function HyperlinkWindow(url,title){
	this.url = url;
	this.title = title;
	this.initialize();
}

/**
 * Initializes the GUI of the Hyperlink Window.
 *
 * @this {HyperlinkWindow}
 */
HyperlinkWindow.prototype.initialize = function(){
	var frame = this;
	var window = $('<div/>').appendTo(EditionGui.containerDiv);
	$.extend(window,new FrameWindow());
	window.initialize({
		draggable: EditionProperties.draggable,
		resizable: true,
		concealable: EditionProperties.concealable,
		removable: EditionProperties.removable,
		triggerResize: function(){ frame.resize(); },
		class: 'window'
	});
	$.extend(this,window);
	$(this).css('width',EditionProperties.hyperlinkWindowWidth+'px');
	$(this.content).css('width',EditionProperties.hyperlinkWindowWidth+'px');
	$(this.content).css('height',EditionProperties.hyperlinkWindowHeight+'px');
	this.overlay = new OverlayWindow(this.content);
	this.overlay.loaderOverlay();
	this.hyperlinkWindow = $('<object type="text/html" data="'+this.url+'" width="'+EditionProperties.hyperlinkWindowWidth+'" height="'+EditionProperties.hyperlinkWindowHeight+'"/>');
	this.hyperlinkWindow.css('z-index',10001);
	this.hyperlinkWindow.css('position','absolute');
	$(this.content).append(this.hyperlinkWindow);
	var resizeHandles = $('.ui-resizable-handle',frame);
	for( var i=0; i<resizeHandles.length; i++ ){
		$(resizeHandles[i]).css('z-index',10002);
	}
	$(this.label).html(this.title);
};

/**
 * Resizes the Hyperlink Window.
 *
 * @this {HyperlinkWindow}
 */
HyperlinkWindow.prototype.resize = function(){
	this.overlay.removeOverlay();
	$(this.content).css('width',$(this).width()+'px');
	this.hyperlinkWindow.css('width',$(this.content).width()+'px');
	this.hyperlinkWindow.css('height',$(this.content).height()+'px');
};
