/*
 * LazyLoader - A jquery extension to render images and html content as the user scrolls down the page.
 *
 * Copyright (c) 2011 Michael Collins
 *
 * Licensed under the MIT license:
 *   http://www.opensource.org/licenses/mit-license.php
 *
 * Project home:
 *  http://ivorycity.com/blog/
 *
 */

( function($) {

jQuery.fn.extend(
{
	lazyLoad: function(container,imageLoad,delay)
	{

		var d = $(container).data('lazyloaders');
		if (!d)
		{
			d = [];
		}
		this.each( function() { d.push(this); } );
		$(container).data('lazyloaders', d );

		var update = function(){
			if( $(container).css('display') == 'none' ){
				return;
			}
			var d = $(container).data('lazyloaders');
			if (!d || !d.length)
			{
				return;
			}
			$( d ).each( function(i)
			{	
				var inViewport = $.insideViewport( this, container );
				if ( this && inViewport )
				{
					$(this).showComment(imageLoad);
				}
			});
		}
		
		var scrollIndex = -1;
		$(container).scroll( function(){
			scrollIndex++;
			var scroll = scrollIndex;
			setTimeout( function(){
				if( scrollIndex == scroll ){
					update();
				}
			}, delay);
		});
		
		$(container).trigger( 'scroll' );
		
	},
	
	showComment: function(imageLoad)
	{
		return this.each(function()
		{
			var child = this.firstChild;
			if (child.nodeType === 8) // 8 is a comment node
			{
				this.innerHTML = ''; // Fixes IE sometimes breaking with replaceWith() call
				var div = $(this);
				var image = $(child.nodeValue).load(function(){	imageLoad(this,image,div); });
				$(this).replaceWith(image);
			}
		});
	}

});

$.under = function(element,container) {
    return $(element).offset().top > $(container).height() + $(container).offset().top;
};

$.over = function(element,container) {
    return $(element).offset().top + $(element).height() - $(container).offset().top < 0;
};

$.rightOf = function(element,container) {
    return $(element).offset().left > $(container).width() + $(container).offset().left;
};

$.leftOf = function(element,container) {
	return $(element).offset().left + $(element).width() - $(container).offset().left < 0;
};

$.insideViewport = function(element,container) {
    return !$.rightOf(element,container) && !$.leftOf(element,container) && !$.under(element,container) && !$.over(element,container);
};

})(jQuery);
