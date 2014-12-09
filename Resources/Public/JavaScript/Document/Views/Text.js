/**
 * Creates an instance of the Text View
 *
 * @constructor
 * @this {Text}
 * @param {Document} document The document to be shown in the Text view.
 * @param {DIV} container The conatiner div for the Text view.
 * @param {DocumentDialog} parent The parent document dialog.
 */
Text = function(document, container, parent) {
	this.type = "text";
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
 * @this {Text}
 */
Text.prototype.initialize = function() {
	var context = this;
	this.contentPanel = $('<div/>').appendTo(this.container);
	$(this.contentPanel).css('overflow', 'auto');
	this.parent.paginator.setTriggerFunc(function(page) {
		// Force scrollTop(0) on first page
		// Depends on correct CSS positioning of .tei:pb elements
		$(context.contentPanel).scrollTop(page == 1 ? 0 : $(context.pageHooks[page - 2]).offset().top - $(context.contentPanel).offset().top + $(context.contentPanel).scrollTop());
		context.parent.pageChanged(page);
	});
	this.parent.showPagination();
	if (EditionProperties.colorizeEntities) {
		this.parent.facetSelector.setTriggerFunc(function(facetSelection) {
			context.linkProcessor.colorizeLinks($(context.contentPanel), facetSelection);
			context.parent.facetsChanged(facetSelection);
		});
		this.parent.showFacets();
	}
}

/**
 * Resizes the text view.
 *
 * @this {Text}
 */
Text.prototype.resize = function() {
	$(this.contentPanel).css('height', $(this.container).height() + 'px');
	$(this.contentPanel).css('width', '100%');
};

/**
 * Displays a specific page.
 *
 * @this {Text}
 * @param {number} page The page to be shown.
 */
Text.prototype.display = function(page, id) {

	var context = this;
	$(this.contentPanel).empty();

	var show = function(text) {
		$(text).appendTo(context.contentPanel);
		context.linkProcessor.appendTooltips($(context.contentPanel), context.parent);
		context.linkProcessor.colorizeLinks($(context.contentPanel), context.parent.facetSelection);
		context.pageHooks = $('.tei\\:pb', context.contentPanel);
		context.avoidScroll = false;
		$(context.contentPanel).scroll(function() {
			if ( context.avoidScroll ) {
				context.avoidScroll = false;
				return;
			}
			var scrollTop = $(context.contentPanel).scrollTop();
			var height = $(context.contentPanel).height();
			var currentPage = 1;
			// If we are below the first pagehook, set page accordingly
			if ( $(context.pageHooks[0]).position().top < scrollTop - 45 ) { // TODO: Where does this value come from!? But it works.
				// Get first pagehook in visible area
				for (var i = 0; i < context.pageHooks.length; i++) {
					var pageHookTop = $(context.pageHooks[i]).position().top + scrollTop - 45; // TODO: See above.
					if (pageHookTop >= scrollTop && pageHookTop < scrollTop + height) {
						currentPage = i + 2;
						break;
					}
				}
				// No pagehook found in visible area, select first one above
				if ( currentPage <= 1 ) {
					for (var i = 0; i < context.pageHooks.length; i++) {
						var pageHookTop = $(context.pageHooks[i]).position().top + scrollTop - 45; // TODO: See above.
						if (pageHookTop > scrollTop) {
							currentPage = i + 1;
							break;
						}
					}
				}
			}
			context.parent.paginator.setPage(currentPage, true);
			context.parent.pageChanged(currentPage);
		});
		if (context.parent.lineNumbers) {
			(new XHTMLProcessor(context.contentPanel)).insertLineNumbers(EditionProperties.lineNumbering);
		}
		if (typeof id != 'undefined') {
			//var node = $(context.contentPanel).find("a[name='" + id + "']")[0];
			var node = $('#' + id)[0];
			if (node) {
				nodeOffset = $(node).offset().top;
			} else {
				nodeOffset = 0;
			}
			$(context.contentPanel).scrollTop(nodeOffset - $(context.container).offset().top + $(context.contentPanel).scrollTop()); // TODO: page is not updated
		} else if (page > 0) {
			// TODO: This code is duplicate code from setTriggerFunc, try to merge
			$(context.contentPanel).scrollTop(page == 1 ? 0 : $(context.pageHooks[page - 2]).offset().top - $(context.contentPanel).offset().top + $(context.contentPanel).scrollTop());
			context.parent.paginator.setPage(page, true);
		}
	}

	if (typeof this.document.fullText != 'undefined') {
		show(this.document.fullText);
	}
	else {
		var process = this.documentLoader.startProcess();
		this.parent.startProcessing();
		var failure = function(errorObject) {
			if (process.active) {
				show(Util.getErrorMessage(errorObject.status));
				context.parent.stopProcessing();
			}
		}
		var success = function(text) {
			context.document.fullText = text;
			if (process.active) {
				show(context.document.fullText);
				context.parent.stopProcessing();
			}
		}
		DocumentServerConnection.getDocumentText(this.document, success, failure);
	}

};

/**
 * Updates this Text view if its parent document dialog is linked to other views for the same document and a 'pageChange', 'facetsChange' or 'positionChange' event was performed in one of these other linked views
 *
 * @this {Text}
 * @param {JSON} change The information for the view update. It contains a type (e.g. 'pageChange') and a data information (e.g. the new page number in case of a 'pageChange' event)
 */
Text.prototype.onChange = function(change) {
	if (change.type == "pageChange") {
		var node = $(this.pageHooks[change.data - 1]);
		$(this.contentPanel).scrollTop($(node).offset().top - $(this.container).offset().top + $(this.contentPanel).scrollTop());
	}
	else if (change.type == "positionChange") {
		var node = $(this.contentPanel).find("a[name='" + change.data + "']")[0];
		$(this.contentPanel).scrollTop($(node).offset().top - $(this.container).offset().top + $(this.contentPanel).scrollTop());
	}
	else if (change.type == "facetsChange") {
		this.linkProcessor.colorizeLinks($(this.contentPanel), change.data);
	}
};
