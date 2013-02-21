/**
 * Creates an instance of the Tags View
 *
 * @constructor
 * @this {Tags}
 * @param {Document} document The document to be shown in the Tags view.
 * @param {DIV} container The conatiner div for the Tags view.
 * @param {DocumentDialog} parent The parent document dialog.
 */
Tags = function(document,container,parent){	
	this.type = "tags";
	this.container = container;
	this.stopped = true;
	this.document = document;
	this.container = container;
	this.parent = parent;
	this.lp = new LinkProcessor();
	this.documentScope = EditionProperties.documentScope;
	this.initialize();
}

/**
 * Initializes the tag cloud to display the tags and activates pagination and/or scope selection panels
 *
 * @this {Tags}
 */
Tags.prototype.initialize = function(){
	var context = this;
	this.buttonPanel = $('<div/>').appendTo(this.container);
	this.buttonPanel.addClass('buttonPanel');
	this.contentPanel = $('<div/>').appendTo(this.container);
	$(this.contentPanel).css('overflow','auto');
	this.parent.facetSelector.setTriggerFunc(function(facetSelection){
		context.display();
		context.parent.facetsChanged(facetSelection);
	});
	this.parent.paginator.setTriggerFunc(function(page){
		context.showPage(page);
		context.parent.pageChanged(page);
	});
	if( EditionProperties.scopeSelection ){
		var id = 'scope'+EditionGui.getIndependentId();
		var documentTags = $("<input type='radio' name='"+id+"'>"+Util.getString('documentTags')+"</input>").appendTo(this.buttonPanel);
		var tagsByPages = $("<input type='radio' name='"+id+"'>"+Util.getString('tagsByPages')+"</input>").appendTo(this.buttonPanel);
		if( this.documentScope ){
			$(documentTags).attr('checked',true);
		}
		else {
			$(tagsByPages).attr('checked',true);
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
		$(documentTags).click(function(){
			setScope(true);
		});
		$(tagsByPages).click(function(){
			setScope(false);
		});
	}	
}

/**
 * Retrieves and shows the tags for a given page by updating the tag cloud.
 *
 * @this {Tags}
 * @param {number} page The tags of the given page will be shown (p = 0 for all tags of the document).
 */
Tags.prototype.show = function(page){
	var context = this;
	var facets = this.parent.facetSelector.getFacetString();
	if( facets == '' ){
		$(Util.getAlertMessage(Util.getString('selectFacetsAlert'))).appendTo(this.contentPanel);
		return;
	}
	if( !this.stopped ){
		this.parent.stopProcessing();
	}
	this.stopped = false;
	this.parent.startProcessing();
	var failure = function(errorObject){
		if( !context.stopped ){
			$(Util.getErrorMessage(errorObject.status)).appendTo(context.contentPanel);
			context.parent.stopProcessing();
		}
	}
	var success = function(xml){
		if( !context.stopped ){
			var tagArray = Util.getTags($(xml).find('tag'));
			context.tags = tagArray;
			var trigger = function(){
				context.lp.appendTooltips(context.contentPanel);
				context.parent.stopProcessing();
			};
			$(context.contentPanel).jQCloud(tagArray,{trigger:trigger});
		}
	}
	DocumentServerConnection.getDocumentTags(context.document,page,facets,success,failure);
};

/**
 * Display all tags of the document
 *
 * @this {Tags}
 */
Tags.prototype.showTags = function(){
	$(this.contentPanel).empty();
	this.show(0);
};

/**
 * Display tags mentioned on a given page.
 *
 * @this {Tags}
 * @param {number} page The tags of the given page will be shown.
 */
Tags.prototype.showPage = function(page){
	this.actualPage = page;
	$(this.contentPanel).empty();
	this.show(page);
};

/**
 * Display the tags for the document (page = 0) or a given page (page > 0)
 *
 * @this {Tags}
 * @param {number} page The page to be shown.
 */
Tags.prototype.display = function(page){
	if( this.documentScope ){
		this.showTags();
	}
	else {
		page ? this.parent.paginator.setPage(page,false) : this.parent.paginator.setPage(1,false);
	}
};

/**
 * Resizes the tag cloud.
 *
 * @this {Tags}
 */
Tags.prototype.resize = function(){
	var context = this;
	$(this.contentPanel).css('width','100%');
	$(this.contentPanel).css('height',($(this.container).height()-$(this.buttonPanel).height())+'px');
	if( typeof this.tags != 'undefined' ){
		$(this.contentPanel).empty();
		var trigger = function(){
			context.lp.appendTooltips(context.contentPanel);
		};
		$(this.contentPanel).jQCloud(this.tags,{trigger:trigger});
		this.lp.appendTooltips(this.contentPanel);
	}
};

/**
 * Updates this Tags view if its parent document dialog is linked to other views for the same document and a 'pageChange' or 'facetsChange' event was performed in one of these other linked views
 *
 * @this {Tags}
 * @param {JSON} change The information for the view update. It contains a type (e.g. 'pageChange') and a data information (e.g. the new page number in case of a 'pageChange' event)
 */
Tags.prototype.onChange = function(change){
	if( change.type == "facetsChange" ){
		this.parent.facetSelector.setFacetSelection(change.data);
		this.context.display(this.parent.page);
	}
	if( change.type == "pageChange" ){
		if( this.actualPage != change.data ){
			this.parent.page = change.data;
			this.parent.paginator.setPage(change.data,true);
			this.showPage(change.data);
		}
	}
};
