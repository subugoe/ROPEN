/**
 * Implementation of the Tooltip Panels to be shown when the user hovers or clicks on links of a certain entity. Static implementation to always be possible to remove stranded tooltips that independent from other ones.
 *
 * @constructor
 * @this {Tooltip}
 */
var Tooltip = new function(){
	this.activeTooltips = [];
	if( EditionProperties.tooltipMode == 'hover' ){
		//remove all inactive tooltips
		$(window).mousemove(function(e){
			Tooltip.checkActivity();
	       	});
		//remove tooltips when mouse exits window/document
		function windowExitEvent(object,oEvent,fnctn){
			if(object.addEventListener) object.addEventListener(oEvent,fnctn,false);
			else if(object.attachEvent) object.attachEvent("on" + oEvent, fnctn);
		}
		windowExitEvent(window,"load",function(e){
			windowExitEvent(document,"mouseout",function(e){
				e = e ? e : window.event;
				var from = e.relatedTarget || e.toElement;
				if(!from || from.nodeName == "HTML"){
					Tooltip.removeAllTooltips();
				}
			});
		});
	}
}

/**
 * Avoid multiple creation of the same popup.
 *
 * @this {Tooltip}
 * @param {HTML} parent The parent of the tooltip, usually a link or a span tag.
 * @return {boolean} TRue, if there is already a tooltip for the given parent.
 */
Tooltip.isActive = function(parent){
	for( var i in this.activeTooltips ){
		if( this.activeTooltips[i].parent == parent ){
			return true;
		}
	}
	return false;
}

/**
 * Remove all current displayed tooltips.
 *
 * @this {Tooltip}
 */
Tooltip.removeAllTooltips = function(){
	for( var i=this.activeTooltips.length; i>0; i-- ){
		$(this.activeTooltips[i-1].tooltip).remove();
		this.activeTooltips.pop();
	}
};

/**
 * Checks the activity of the tooltip stack top-down. Unrequired tooltips are removed. Required procedure for nested tooltips.
 *
 * @this {Tooltip}
 */
Tooltip.checkActivity = function(){
	var check = true;
	while( check ){
		if( this.activeTooltips.length > 0 ){
			var activeTooltip = this.activeTooltips[ this.activeTooltips.length - 1 ];
			if( !activeTooltip.mouseOverParent && !activeTooltip.mouseOverTooltip ){
				$(activeTooltip.tooltip).remove();
				this.activeTooltips.pop();
			}
			else {
				check = false;
			}
		}
		else {
			check = false;
		}
	}
}

/**
 * Generates a tooltip for the given parent, with the given content and a given trigger function to be called when the tooltip was created.
 *
 * @this {Tooltip}
 * @param {HTML} parent The parent div for which the tooltip is generated.
 * @param {HTML} content The content to be shown in the tooltip.
 * @param {Object} trigger The trigger function to be called when the tooltip was created.
 */
Tooltip.setTooltip = function(parent,content,trigger){
	var tt = this;
	if( EditionProperties.tooltipMode == 'hover' ){
		$(parent).mouseenter(function(e){
			if( tt.isActive(parent) ){
				return;	
			}
			tt.checkActivity();
			if ( typeof content != 'undefined' ){
				var tooltip = $("<div class='info'/>").appendTo(EditionGui.containerDiv);
				$(tooltip).css('z-index','99999');
				$(content).appendTo(tooltip);
				var activeTooltip = {
					tooltip: tooltip,
					parent: parent,
					mouseOverParent: true,
					mouseOverTooltip: false
				};
				tt.activeTooltips.push(activeTooltip);
				tooltip.css("top",(e.pageY - tooltip.height() - $(EditionGui.containerDiv).offset().top) + "px");
				tooltip.css("left",(e.pageX) + "px");
				tooltip.fadeIn("fast");
	  			$(tooltip).hover(function(e){
	      				activeTooltip.mouseOverTooltip = true;
	  			},function(){	
	      				activeTooltip.mouseOverTooltip = false;
  				});
	  			$(parent).hover(function(e){
	      				activeTooltip.mouseOverParent = true;
	  			},function(){	
	      				activeTooltip.mouseOverParent = false;
  				});
				if( trigger ){
					trigger(tooltip);
				}
			}
		});
	}
	else if( EditionProperties.tooltipMode == 'click' ){
		$(parent).mouseenter(function(e){
			if ( typeof content != 'undefined' && content != '' ){			
				var tooltip = $("<div class='info'/>").appendTo(EditionGui.containerDiv);
				$(tooltip).css('z-index','99999');
				$(content).appendTo(tooltip);
				var clicked = false;
				tooltip.css("top",($(parent).offset().top + $(parent).height()) + "px");
				tooltip.css("left",($(parent).offset().left) + "px");
				tooltip.fadeIn("fast");
				$(parent).mouseleave(function(e){
					if(!clicked){
						$(tooltip).remove();
					}
				});
				$(parent).click(function(e){
					clicked = true;
					$(tooltip).draggable();
					var close = $('<div class="closeTooltip"/>').appendTo(tooltip);
					close.click(function(e){
						$(tooltip).remove();
					});
				});
				if( trigger ){
					trigger(tooltip);
				}
			}
		});
	}
};
