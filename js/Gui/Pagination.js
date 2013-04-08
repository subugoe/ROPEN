/**
 * Implementation for the pagination panel.
 * Consists of three parts:
 * 	previous link
 * 	current page selector
 * 	next link
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

	// add link for previous page navigation
	var previousPageLi = document.createElement('li');

	var toolsPaginationBackward = document.createElement('a');
	toolsPaginationBackward.setAttribute('class', 'tools-paginationbackward');
	toolsPaginationBackward.setAttribute('title', Util.getString('previousPage'));

	var spanVisuallyHidden = document.createElement('span');
	spanVisuallyHidden.setAttribute('class', 'visuallyhidden');

	toolsPaginationBackward.appendChild(spanVisuallyHidden);

	previousPageLi.appendChild(toolsPaginationBackward);

	$(toolsPaginationBackward).click(function() {
		if (pagination.page > 1) {
			pagination.setPage(pagination.page - 1);
		}
	});

	this.div.append(previousPageLi);

	// add select field for selecting or showing the current page number
	var formLi = document.createElement('li');

	var form = document.createElement('form');

	form.setAttribute('style', 'display:inline');

	var selectPageDropdown = document.createElement('select');

	// iterate over pages
	for (var i = 0; i < this.pages; i++) {
		var pageNumber = i + 1;
		var option = document.createElement('option');
		option.setAttribute('value', pageNumber);

		var pageNumberText = document.createTextNode(pageNumber);
		option.appendChild(pageNumberText);

		selectPageDropdown.appendChild(option);
	}

	$(selectPageDropdown).change(function(evt) {
		pagination.page = parseInt(evt.currentTarget.value);
		pagination.update();
	});

	form.appendChild(selectPageDropdown);

	formLi.appendChild(form);

	this.div.append(formLi);

	// add element for next page navigation
	var nextPageLi = document.createElement('li');

	var toolsPaginationForward = document.createElement('a');
	toolsPaginationForward.setAttribute('class', 'tools-paginationforward');
	toolsPaginationForward.setAttribute('title', Util.getString('nextPage'));

	var spanVisuallyHidden = document.createElement('span');
	spanVisuallyHidden.setAttribute('class', 'visuallyhidden');

	toolsPaginationForward.appendChild(spanVisuallyHidden);

	nextPageLi.appendChild(toolsPaginationForward);

	$(toolsPaginationForward).click(function() {
		if (pagination.page < pagination.pages) {
			pagination.page = parseInt(pagination.page + 1);
			pagination.setPage(pagination.page);
		}
	});

	this.div.append(nextPageLi);

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
