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
		var node = $(context.pageHooks[page >= 2 ? page - 2 : 0]);
		// Force scrollTop(0) on first page
		// If page turning fails, check if .tei:pb elements are positioned correctly
		$(context.contentPanel).scrollTop(page <= 1 ? 0 : $(node).offset().top - $(context.contentPanel).offset().top + $(context.contentPanel).scrollTop());
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

		// Custom scroll trigger only triggers on manual scroll to prevent trigger cascade
		$(context.contentPanel).bind('scroll mousedown wheel DOMMouseScroll mousewheel keyup', function(e) {
			if ( e.which > 0 || e.type == "mousedown" || e.type == "mousewheel"){
				if (context.avoidScroll) {
					context.avoidScroll = false;
					return;
				}
				var scrollTop = $(context.contentPanel).scrollTop();
				var height = $(context.contentPanel).height();
				var found = false;
				// Get first pagehook in visible area
				for (var i = 0; i < context.pageHooks.length; i++) {
					var top = $(context.pageHooks[i]).position().top + scrollTop;
					if (top >= scrollTop && top < scrollTop + height) {
						found = i + 1;
						break;
					}
				}
				// No pagehook found in visible area, select first one above
				if (!found) {
					for (var i = 0; i < context.pageHooks.length - 1; i++) {
						var top = $(context.pageHooks[i]).position().top + scrollTop;
						var top2 = $(context.pageHooks[i + 1]).position().top + scrollTop;
						if (top < scrollTop && top2 > scrollTop) {
							found = i + 1;
							break;
						}
					}
				}
				context.parent.paginator.setPage(found, true);
				context.parent.pageChanged(found);
			}
		})

		if (context.parent.lineNumbers) {
			(new XHTMLProcessor(context.contentPanel)).insertLineNumbers(EditionProperties.lineNumbering);
		}
		if (typeof id != 'undefined') {
			var node = $(context.contentPanel).find("a[name='" + id + "']")[0];
			var nodeOffset = 0;
			if (node) {
				nodeOffset = $(node).offset().top;
			}
			$(context.contentPanel).scrollTop(nodeOffset - $(context.container).offset().top + $(context.contentPanel).scrollTop());
		}
		else
			if (context.parent.page > 0) {
				var node = $(context.pageHooks[context.parent.page - 1]);
				$(context.contentPanel).scrollTop($(node).offset().top - $(context.container).offset().top + $(context.contentPanel).scrollTop());
				context.parent.paginator.setPage(context.parent.page, true);
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
	else
		if (change.type == "positionChange") {
			var node = $(this.contentPanel).find("a[name='" + change.data + "']")[0];
			$(this.contentPanel).scrollTop($(node).offset().top - $(this.container).offset().top + $(this.contentPanel).scrollTop());
		}
		else
			if (change.type == "facetsChange") {
				this.linkProcessor.colorizeLinks($(this.contentPanel), change.data);
			}
};
