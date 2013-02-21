/**
 * Implementation of the general functionality of each frame (browser, folder).
 *
 * @constructor
 * @this {FrameWindow}
 */
FrameWindow = function(){
	/* if the frame is fixed, it cannot be resized anymore */
	this.fixed = false;
	/* when minimizing, a frame gets invisible */
	this.visibility = true;
	/* required to avoid dragging the frame during resize */
	this.dragLock = false;
}

/**
 * Initialization of the Frame Window with close/resize/drag functionality dependent on the given params.
 *
 * @this {FrameWindow}
 * @param {JSON} params Parameters to initialize the frame window, e.g. if a frame should be draggable,	resizable, concealable and/or removable.
 */
FrameWindow.prototype.initialize = function(params){
	var frame = this;
	this.params = params;
	this.addClass("frame "+params.class);
	this.toolbarDiv = $("<div class='clearfix'/>").appendTo(this);
	this.windowTools = $("<ul class='windowtools'/>").appendTo(this.toolbarDiv);
	var headline = $("<h4/>").appendTo(this.toolbarDiv);
	this.label = $("<span></span>").appendTo(headline);
	this.content = $("<div/>").appendTo(this);
	$(this.content).css('position','relative');
	$(this.content).mousedown(function(){
		frame.updateZIndex(false);
	});
	if( params.draggable ){
		this.mousedown(function(evt){
			if( !frame.fixed ){
				frame.dragFrame(evt);
			}
		});
		$(this.content).bind('mousedown',function(e){
			e.stopPropagation();
		});
	}
	if( params.concealable ){
		this.visibilityButton = $("<li/>").appendTo(this.windowTools);
		this.visibilityLink = $('<a class="button-minimize"><span class="visuallyhidden"/>&nbsp;</a>').appendTo(this.visibilityButton);
		this.visibilityLink.attr("title",Util.getString('minimizeWindow'));
		this.visibilityButton.click(function(){
			frame.toggleVisibility();
		});
	}
	if( params.removable ){
		this.removeButton = $("<li/>").appendTo(this.windowTools);
		var removeLink = $('<a class="button-close"/>').appendTo(this.removeButton);
		removeLink.attr("title",Util.getString('removeWindow'));
		this.removeButton.click(function(){
			frame.toolbarDiv.remove();
			if( typeof params.triggerRemove != 'undefined' ){
				params.triggerRemove();
			}
			EditionGui.checkGrid();
			$(frame).remove();
		});
	}
	$(this).mousedown(function(){
		frame.updateZIndex(false);
	});
	this.updateZIndex(true);
};

/**
 * Guarantees that the current active frame window has the highest z-index.
 *
 * @this {FrameWindow}
 * @param {boolean} set If a new z-index should be assigned. It avoids needless raising of the z-index when clicking one and the same frame multiple times.
 */
FrameWindow.prototype.updateZIndex = function(set){
	if( !set ){
		var zIndex = $(this).css('z-index');
		if( EditionGui.zIndex != zIndex ){
			set = true;
		}
	}
	if( set ){
		$(this).css('z-index',EditionGui.getZIndex());
	}
};
	
/**
 * Sets or removed fixed state of the frame (when toggling automatic grid layout).
 *
 * @this {FrameWindow}
 * @param {boolean} fixed If the new state is fixed or not.
 */
FrameWindow.prototype.setFixed = function(fixed){
	this.fixed = fixed;
	this.setResizability(!fixed);
};

/**
 * Sets the resizablity of the frame. When the frame is fixed or minimized, it cannot be resized.
 *
 * @this {FrameWindow}
 * @param {boolean} append If the frame should be resizable or not.
 */
FrameWindow.prototype.setResizability = function(append){
	var frame = this;
	if( this.params.resizable && append && !this.fixed && this.visibility ){
		$(this).resizable({
			helper: "ui-resizable-helper",
			minHeight: EditionProperties.minWindowHeight,
			minWidth: EditionProperties.minWindowWidth,
			stop: function() {
				frame.resize();
				if( typeof frame.params.triggerResize != 'undefined' ){
					frame.params.triggerResize();						
				}
			}
		});
		var resizeHandles = $('.ui-resizable-handle',frame);
		for( var i=0; i<resizeHandles.length; i++ ){
			$(resizeHandles[i]).mousedown(function(){
				frame.dragLock = true;
				$(document).mousemove(function(){
					EditionGui.checkHeight();
				});
				$(document).mouseup(function(){
					$(document).mousemove(null);
					frame.dragLock = false;
				});
			});
		}
	}
	else if( this.params.resizable ){
		try {
			$(this).resizable('destroy');
		}
		catch(e){
		}
	}
};

/**
 * Sets the size of the frame.
 *
 * @this {FrameWindow}
 * @param {number} width The desired width of the frame in pixel.
 * @param {number} height The desired height of the frame in pixel.
 */
FrameWindow.prototype.setSize = function(width,height){
	this.css('width', width+"px" );
	this.css('height',height+'px');
};

/**
 * Sets the (x,y) position of the frame.
 *
 * @this {FrameWindow}
 * @param {number} left The desired left distance of the frame in pixel.
 * @param {number} top The desired top distance of the frame in pixel.
 */
FrameWindow.prototype.position = function(left,top){
	this.css('left',left+'px');
	this.css('top',top+'px');
};

/**
 * Resizes the height of the content panel. Required to resize the embedded content (e.g. dedicated document view, search results).
 *
 * @this {FrameWindow}
 */
FrameWindow.prototype.resize = function(){
	var p = parseInt($(this).css("padding-top"))*2-4;
	this.content.css('height', ($(this).height()-p-this.toolbarDiv.height())+"px");
};
	
/**
 * Getter for the position and bounds of the frame (currently unused). May be used for additional parameters for the magnetic link.
 *
 * @this {FrameWindow}
 * @return {JSON} The width, height, top and left value of the frame in pixel.
 */
FrameWindow.prototype.getPosition = function(){
	if( this.visibility ){
		return {
			t: $(this).position().top,
			l: $(this).position().left,
			w: $(this).width(),
			h: $(this).height()
		};
	}
	return {
		t: this.top,
		l: this.left,
		w: this.width,
		h: this.height
	};
};

/**
 * Implements the frame's minimize/maximize functionality.
 *
 * @this {FrameWindow}
 */
FrameWindow.prototype.toggleVisibility = function(){
	var frame = this;
	var padding = parseInt($(this).css("padding-top"));
	this.visibility = !this.visibility;		
	if( this.visibility ){
		this.visibilityLink.removeClass("button-open");
		this.visibilityLink.addClass("button-minimize");
		$(this).animate({
			height: "-="+($(frame).height()-frame.height),
			top: "-="+($(frame).position().top-frame.top),
			left: "-="+($(frame).position().left-frame.left),
			width: "-="+($(frame).width()-frame.width)
		  }, 500, function(){
			frame.resize();
			EditionGui.checkGrid();
			EditionGui.checkHeight();
		});
		this.setResizability(true);
	}
	else {
		this.top = $(this).position().top;
		this.left = $(this).position().left;
		this.width = $(this).width();
		this.height = $(this).height();
		this.visibilityLink.removeClass("button-minimize");
		this.visibilityLink.addClass("button-open");
		$(this).animate({
			height: "-="+($(frame).height()-$(frame.toolbarDiv).height()+5),
			top: "-="+(frame.top-10),
			left: "+="+(frame.width/2-(frame.label.width()+frame.windowTools.width()+20)/2),
		    	width: "-="+($(frame).width()-frame.label.width()-frame.windowTools.width()-20)
		  }, 500, function(){
			frame.resize();
			EditionGui.checkGrid();
			EditionGui.checkHeight();
		});
		this.setResizability(false);
	}
};
	
/**
 * Implements the frame's drag functionality.
 *
 * @this {FrameWindow}
 * @param {Object} evt The mousedown event which indicates the start of the drag event.
 */
FrameWindow.prototype.dragFrame = function(evt){
	var frame = this;
	var startPos = Util.getMousePosition(evt);
	var windowLeft = $(frame).position().left;
	var windowTop = $(frame).position().top;
	document.onmouseup = function(){
		document.onmousemove = null;
		document.onmouseup = null;
	}
	document.onmousemove = function(e){
		if( !frame.dragLock ){
			var pos = Util.getMousePosition(e);
			frame.css('left',(windowLeft+pos.left-startPos.left)+'px');
			frame.css('top',(windowTop+pos.top-startPos.top)+'px');
			EditionGui.checkHeight();
		}
	}
};
