/**
 * Implementation for the pagination panel.
 *
 * @constructor
 * @this {Pagination}
 * @param {HTML} div The parent DIV to append the pagination panel.
 * @param {number} pages The number of pages (of the document) for the pagination.
 */
function Pagination(div,pages){
	this.div = div;
	this.pages = pages;
	this.page = 0;
	this.initialize();
}

/**
 * Initialization of the Pagination panel.
 *
 * @this {Pagination}
 */
Pagination.prototype.initialize = function(){
	var pagination = this;	
	var previousPageLi = $('<li/>').appendTo(this.div);
	this.previousPage = $('<a class="tools-paginationbackward"><span class="visuallyhidden"/></a>').appendTo(previousPageLi);
	this.previousPage.title = Util.getString('previousPage');
	this.previousPage.click(function(){
		if( pagination.page > 1 ){
			pagination.setPage(pagination.page-1);
		}
	});
	var form = $('<form/>').appendTo(this.div);
	form.css('display','inline');	
	this.selectPageDropdown = $('<select/>').appendTo(this.div);
	for( var i=0; i<this.pages; i++ ){
		$('<option value="'+(i+1)+'">'+(i+1)+'</option>').appendTo(this.selectPageDropdown);
	}
	$(this.selectPageDropdown).change(function(evt){
		pagination.page = parseInt(evt.currentTarget.value);
		pagination.update();
	});
	var nextPageLi = $('<li/>').appendTo(this.div);
	this.nextPage = $('<a class="tools-paginationforward"><span class="visuallyhidden"/></a>').appendTo(nextPageLi);
	this.nextPage.title = Util.getString('nextPage');
	this.nextPage.click(function(){
		if( pagination.page < pagination.pages ){
			pagination.page = parseInt(pagination.page + 1);
			pagination.setPage(pagination.page);
		}
	});
}

/**
 * Sets the pagination to the given page. If required, the trigger function will be called.
 *
 * @this {Pagination}
 * @param {number} page The new page for the pagination.
 * @param {boolean} avoidTrigger If this value is true, the trigger function will not be called (required to avoid infinite loops when views are linked).
 */
Pagination.prototype.setPage = function(page,avoidTrigger){
	var pagination = this;	
	this.page = page;
	$('select option:selected',this.selectPageDropdown).removeAttr('selected');
	$("option",this.selectPageDropdown).each(function(){
		if( pagination.page == parseInt($(this).html()) ){
			$(this).attr('selected','selected');
		}
	});
	this.update(avoidTrigger);
};

/**
 * Set new trigger function when the user triggers a page change. Required after the view of a document has been changed in the DocumentDialog (each DocumentDialog has only one assigned Pagination).
 *
 * @this {Pagination}
 * @param {Object} triggerFunc A trigger function to be called when a the user changes the page.
 */
Pagination.prototype.setTriggerFunc = function(triggerFunc){
	this.triggerFunc = triggerFunc;
};

/**
 * Updates the pagination buttons.
 *
 * @this {Pagination}
 * @param {boolean} avoidTrigger If this value is true, the trigger function will not be called.
 */
Pagination.prototype.update = function(avoidTrigger){
	if( this.page == 1 ){
		$(this.previousPage).addClass('disabled');
	}
	else {
		$(this.previousPage).removeClass('disabled');
	}
	if( this.page == this.pages ){
		$(this.nextPage).addClass('disabled');
	}
	else {
		$(this.nextPage).removeClass('disabled');
	}
	if( !avoidTrigger ){
		this.triggerFunc(this.page);
	}
};
