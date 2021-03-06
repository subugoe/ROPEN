/**
 * Creates an instance of the Pages View
 *
 * @constructor
 * @this {Pages}
 * @param {Document} document The document to be shown in the Pages view.
 * @param {DIV} container The conatiner div for the Pages view.
 * @param {DocumentDialog} parent The parent document dialog.
 */
Pages = function(document, container, parent) {
	this.type = "pages";
	this.document = document;
	this.pages = document.pages;
	this.container = container;
	this.parent = parent;
	this.linkProcessor = new LinkProcessor();
	this.documentLoader = new DocumentLoader();
	this.initialize();
}

/**
 * Activates pagination and facet selection for coloring of entities
 *
 * @this {Pages}
 */
Pages.prototype.initialize = function() {
	var context = this;
	this.parent.paginator.setTriggerFunc(function(page) {
		context.showPage(page);
		context.parent.pageChanged(page);
	});
	this.parent.showPagination();
	if (EditionProperties.colorizeEntities) {
		this.parent.facetSelector.setTriggerFunc(function(facetSelection) {
			context.linkProcessor.colorizeLinks($(context.container), facetSelection);
			context.parent.facetsChanged(facetSelection);
		});
		this.parent.showFacets();
	}
}

/**
 * Retrieves and shows the text of the given page.
 *
 * @this {Pages}
 * @param {number} page The number of the page to be shown.
 */
Pages.prototype.showPage = function(page) {
	this.actualPage = page;
	var context = this;
	var checkBlank = function() {
		if (context.container.children().size() == 1) {
			var div = context.container.children()[0];
			if (div && $(div).children().size() == 1) {
				var innerDiv = $(div).children()[0];
				if (innerDiv && $(innerDiv).children().size() == 0) {
					$("<p style='text-align:center;font-style:italic;'>" + Util.getString('blankPage') + "</p>").insertBefore($(innerDiv));
				}
			}
		}
	};
	var show = function() {
		var text = context.document.pageCache[context.actualPage - 1];
		$(context.container).empty();
		$(context.container).html(text);
		checkBlank();
		context.linkProcessor.appendTooltips($(context.container), context.parent);
		context.linkProcessor.colorizeLinks($(context.container), context.parent.facetSelection);
		if (context.parent.lineNumbers) {
			(new XHTMLProcessor(context.container)).insertLineNumbers(EditionProperties.lineNumbering);
		}
	};
	if (!context.document.pageCache[page - 1]) {
		context.parent.stopProcessing();
		var process = context.documentLoader.startProcess();
		context.parent.startProcessing();
		var failure = function(errorObject) {
			if (process.active) {
				$(context.container).empty();
				$(context.container).html(Util.getErrorMessage(errorObject.status));
				context.parent.stopProcessing();
			}
		};
		var success = function(text) {
			context.document.pageCache[page - 1] = text;
			if (process.active) {
				show();
				context.parent.stopProcessing();
			}
		};
		DocumentServerConnection.getDocumentPage(context.document, page, success, failure);
	}
	else {
		show();
	}
};

/**
 * Displays a specific page.
 *
 * @this {Pages}
 * @param {number} page The page to be shown.
 */
Pages.prototype.display = function(page) {
	if (typeof page === 'undefined') {
		page = this.parent.actualPage;
	}
	page ? this.parent.paginator.setPage(page, false) : this.parent.paginator.setPage(1, false);
};

/**
 * Updates this Pages view if its parent document dialog is linked to other views for the same document and a 'pageChange' or 'facetsChange' event was performed in one of these other linked views
 *
 * @this {Pages}
 * @param {JSON} change The information for the view update. It contains a type (e.g. 'pageChange') and a data information (e.g. the new page number in case of a 'pageChange' event)
 */
Pages.prototype.onChange = function(change) {
	if (change.type === "pageChange") {
		if (this.actualPage !== change.data) {
			this.showPage(change.data);
		}
	}
	else
		if (change.type === "facetsChange") {
			this.linkProcessor.colorizeLinks($(this.container), change.data);
		}
};
