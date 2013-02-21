/**
 * Creates an instance of the Text View
 *
 * @constructor
 * @this {Text}
 * @param {Document} document The document to be shown in the Text view.
 * @param {DIV} container The conatiner div for the Text view.
 * @param {DocumentDialog} parent The parent document dialog.
 */
Text = function(document,container,parent){
	this.type = "text";	
	this.document = document;
	this.container = container;
	this.parent = parent;
	this.lp = new LinkProcessor();
	this.initialize();
}

/**
 * Activates pagination and facet selection for coloring of entities
 *
 * @this {Text}
 */
Text.prototype.initialize = function(){
	var context = this;
	this.parent.paginator.setTriggerFunc(function(page){
		var node = $(context.pageHooks[page-1]);
		$(context.container).scrollTop($(node).offset().top-$(context.container).offset().top+$(context.container).scrollTop());
		context.parent.pageChanged(page);
	});
	this.parent.showPagination();
	if( EditionProperties.colorizeEntities ){
		this.parent.facetSelector.setTriggerFunc(function(facetSelection){
			context.lp.colorizeLinks($(context.container),facetSelection);
			context.parent.facetsChanged(facetSelection);
		});
		this.parent.showFacets();
	}
}

/**
 * Displays a specific page.
 *
 * @this {Text}
 * @param {number} page The page to be shown.
 */
Text.prototype.display = function(page,id){
	var context = this;
	$(this.container).empty();
	var show = function(text){
	    	$(text).appendTo(context.container);
		context.lp.appendTooltips($(context.container),context.parent);
		context.lp.colorizeLinks($(context.container),context.parent.facetSelection);
		context.pageHooks = $("hr[class='tei:pb']",context.container);
		var avoidScroll = false;
		$(context.container).scroll(function(){
			if( avoidScroll ){
				avoidScroll = false;
				return;
			}
			var scrollTop = $(context.container).scrollTop();
			var height = $(context.container).height();
			var found = false;
			for( var i=0; i<context.pageHooks.length; i++ ){
				var top = $(context.pageHooks[i]).position().top+scrollTop;
				if( scrollTop <= top && top < scrollTop+height ){
					context.parent.paginator.setPage(i+1,true);
					context.parent.pageChanged(i+1);
					found = true;
					break;
				}
			}
			if( !found ){
				for( var i=0; i<context.pageHooks.length-1; i++ ){
					var top = $(context.pageHooks[i]).position().top+scrollTop;
					var top2 = $(context.pageHooks[i+1]).position().top+scrollTop;
					if( scrollTop > top && scrollTop < top2 ){
						context.parent.paginator.setPage(i+1,true);
						context.parent.pageChanged(i+1);
						break;
					}
				}
			}
		});
		if( context.parent.lineNumbers ){
			(new XHTMLProcessor(context.container)).insertLineNumbers(EditionProperties.lineNumbering);
		}
		if( typeof id != 'undefined' ){
			var node = $(context.container).find("a[name='"+id+"']")[0];
			$(context.container).scrollTop($(node).offset().top-$(context.container).offset().top+$(context.container).scrollTop());
		}
		else if( context.parent.page > 0 ){
			avoidScroll = true;
			var node = $(context.pageHooks[context.parent.page-1]);
			$(context.container).scrollTop($(node).offset().top-$(context.container).offset().top+$(context.container).scrollTop());
			context.parent.paginator.setPage(context.parent.page,true);
		}
	}
	if( typeof this.document.fullText != 'undefined' ){
		show(this.document.fullText);
	}
	else {
		this.stopped = false;
		this.parent.startProcessing();
		var failure = function(errorObject){
			if( !context.stopped ){
				show(Util.getErrorMessage(errorObject.status));
				context.parent.stopProcessing();
			}
		}
		var success = function(text){
			context.document.fullText = text;
			if( !context.stopped ){
				show(context.document.fullText);
				context.parent.stopProcessing();
			}
		}
		DocumentServerConnection.getDocumentText(this.document,success,failure);
	}
};

/**
 * Updates this Text view if its parent document dialog is linked to other views for the same document and a 'pageChange', 'facetsChange' or 'positionChange' event was performed in one of these other linked views
 *
 * @this {Text}
 * @param {JSON} change The information for the view update. It contains a type (e.g. 'pageChange') and a data information (e.g. the new page number in case of a 'pageChange' event)
 */
Text.prototype.onChange = function(change){
	if( change.type == "pageChange" ){
		this.parent.page = change.data;
		this.parent.paginator.setPage(change.data,true);
		var node = $(this.pageHooks[change.data-1]);
		$(this.container).scrollTop($(node).offset().top-$(this.container).offset().top+$(this.container).scrollTop());
	}
	else if( change.type == "positionChange" ){
		var node = $(this.container).find("a[name='"+change.data+"']")[0];
		$(this.container).scrollTop($(node).offset().top-$(this.container).offset().top+$(this.container).scrollTop());
	}
	else if( change.type == "facetsChange" ){
		this.parent.facetSelector.setFacetSelection(change.data);
		this.lp.colorizeLinks($(this.container),change.data);
	}
};
