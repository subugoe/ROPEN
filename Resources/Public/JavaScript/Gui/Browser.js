/**
 * Browser Implementation to show the list of available documents and to allow search requests on them.
 *
 * @constructor
 * @this {Browser}
 */
Browser = function() {
};

/**
 * Initializes the Browsers GUI and interaction.
 *
 * @this {Browser}
 */
Browser.prototype.initialize = function() {
	"use strict";
	var browser = this;

	var show = function(showSearch) {
		if (showSearch) {
			browser.searchTypes.css('display', 'block');
			browser.documents.css('display', 'none');
			browser.searchTab.addClass('selected');
			browser.documentsTab.removeClass('selected');
		}
		else {
			browser.searchTypes.css('display', 'none');
			browser.documents.css('display', 'block');
			browser.searchTab.removeClass('selected');
			browser.documentsTab.addClass('selected');
		}
	};

	this.header = $("<ul class='scope-selector'/>").appendTo(this.content);

	// which shall be shown first
	var alignTabs = function() {
		if (!EditionProperties.browserOrdering) {
			EditionProperties.browserOrdering = 'documents, search';
		}
		var sorter = EditionProperties.browserOrdering.split(',');
		for (var i = 0; i < sorter.length; i++) {
			var element = $.trim(sorter[i]);
			browser[element + 'Tab'] = $("<li><a class='link-scope-" +  element + "' + >" + Util.getString(element) + "</a></li>")
					.appendTo(browser.header);
		}
	};

	alignTabs();

	this.searchTab.click(function() {
		show(true);
	});

	this.documentsTab.click(function() {
		show(false);
	});

	var wa1 = $(this.searchTab).width();
	var wa2 = $(this.documentsTab).width();
	var w1 = parseInt($(this.searchTab).css("padding-left")) * 2 + $(this.searchTab).width();
	var w2 = parseInt($(this.documentsTab).css("padding-left")) * 2 + $(this.documentsTab).width();
	var w = w1 + w2;

	$(this.searchTab).css('padding-left', ((w / 2 - wa1) / 2) + 'px');
	$(this.searchTab).css('padding-right', ((w / 2 - wa1) / 2) + 'px');
	$(this.searchTab).addClass('search-scope-search');

	$(this.documentsTab).css('padding-left', ((w / 2 - wa2) / 2) + 'px');
	$(this.documentsTab).css('padding-right', (( w / 2 - wa2) / 2) + 'px');
	$(this.documentsTab).addClass('search-scope-documents');

	this.main = $("<div class='main'/>").appendTo(this.content);
	this.main.css('overflow-x', 'hidden');
	this.main.css('overflow-y', 'auto');
	this.main.css('position', 'relative');

	var selectedSearchType = 'simple';

	var toggleSearch = function(searchType) {
		if (selectedSearchType === searchType) {
			$('.advancedSearchLabel').removeClass('icon-chevron-down').addClass('icon-chevron-right');
			browser.advancedSearch.css('display', 'none');
			selectedSearchType = 'simple';
		}
		else
			if (searchType === 'advanced') {
				$('.advancedSearchLabel').removeClass('icon-chevron-right').addClass('icon-chevron-down');
				browser.advancedSearch.css('display', 'block');
				selectedSearchType = searchType;
			}
	};
	this.searchTypes = $('<div/>').appendTo(this.main);
	$(this.searchTypes).css('position', 'relative');

	var simpleSearch = $("<form/>").appendTo(this.searchTypes);

	this.searchField = $("<input type='search' class='edition-searchfield' placeholder='" + Util.getString('editionSearchfieldPlaceholder') + "' />").appendTo(simpleSearch);
	var searchButton = $("<button type='submit' class='icon-search edition-submitbutton' value='Submit' />").appendTo(simpleSearch);

	var search = function(evt) {
		if (browser.searchField.val() !== '') {
			browser.clearSearch();
			if (selectedSearchType === 'simple') {
				browser.search('');
			}
			else
				if (selectedSearchType === 'advanced') {
					browser.doAdvancedSearch(evt);
				}
		}
		else {
			var content = $("<div class='inner'/>");
			Util.getAlertMessage(Util.getString('noSearchString')).appendTo(content);
			EditionGui.createDialog(Util.getString('warning'), content, evt, 20, 20);
		}
	};

	searchButton.click(function(evt) {
		search(evt);
	});
	simpleSearch.submit(function(evt) {
		evt.preventDefault();
	});

	// Disabled broken advanced search, just uncomment the next line to enable
	//this.as = $("<div class='advancedSearch'/>").appendTo(this.searchTypes);
	this.advancedSearchTab = $("<span class='advancedSearchLabel icon-chevron-right'> " + Util.getString('advancedSearch') + "</span>").appendTo(this.as);

	this.advancedSearchTab.click(function() {
		toggleSearch('advanced');
	});

	this.prepareAdvancedSearch();
	this.documents = $('<div/>').appendTo(this.main);
	this.documents.css('overflow', 'auto');
	this.searchResults = $('<ul class="hits"/>').appendTo(this.searchTypes);

	show(EditionProperties.browserSearch);

	$(this.label).html(Util.getString('browser')).parent('h4').hide();
	this.overlay = new OverlayWindow(this.searchTypes);
	this.resizeContent();
};

/**
 * Empty the results of a previous search.
 *
 * @this {Browser}
 */
Browser.prototype.clearSearch = function() {
	"use strict";
	$(this.searchResults).empty();
	this.searchTabs = [];
	this.searchContents = [];
};

/**
 * Displays a loader overlay div to highlight actual search processing.
 *
 * @this {Browser}
 * @param {Object} onclose A trigger function to be called when the user closes/removes the overlay.
 */
Browser.prototype.startProcessing = function(onclose) {
	"use strict";
	this.overlay.loaderOverlay(onclose);
};

/**
 * Removes the loader overlay div when processing is done.
 *
 * @this {Browser}
 */
Browser.prototype.stopProcessing = function() {
	"use strict";
	this.overlay.removeOverlay();
};

/**
 * Prepares the GUI and interaction for the advanced search tab.
 *
 * @this {Browser}
 */
Browser.prototype.prepareAdvancedSearch = function() {
	"use strict";
	var browser = this;

	this.advancedSearch = $("<div/>").appendTo(this.as);

	var div1 = $('<div/>')
			.addClass('documentSelection')
			.appendTo(this.advancedSearch);

	$("<input id='allDocsSearch' type='radio' name='scope' /><label for='allDocsSearch'>" + Util.getString('allDocuments') + "</label><input id='selectedDocsSearch' type='radio' name='scope' /><label for='selectedDocsSearch'>" + Util.getString('selectDocuments') + "</label><br />").appendTo(div1);

	var allDocuments = $('#allDocsSearch')[0];
	var selectDocuments = $('#selectedDocsSearch')[0];
	var documents = $('<div class="selectedDocsDisplay"/>').appendTo(this.advancedSearch);
	var documentList = $('<ul/>').appendTo(documents);

	$(documents).css('overflow', 'hidden');
	$(allDocuments).attr('checked', true);

	var docsSelected = false;
	var docsHeight;
	var documentSelection = [];

	var addDocument = function(doc, index) {
		var entry = $("<li/>").appendTo(documentList);
		var checkbox = $("<input type='checkbox' id='advanced-document-" + index + "' /><label for='advanced-document-" + index + "'>" + doc.name + "</label>").appendTo(entry);
		documentSelection.push(false);
		checkbox.click(function() {
			documentSelection[index] = !documentSelection[index];
		});
	};

	var loadDocs = function() {
		$(Util.documents).each(function(i, doc) {
			addDocument(doc, i);
		});
		docsHeight = $(documents).height();
		$(documents).css('height', '0px');
		$(documents).css('display', 'block');
	};

	var checkDocumentVisibility = function() {
		if ($(selectDocuments).attr('checked') && !docsSelected) {
			if (documentSelection.length === 0) {
				loadDocs();
			}
			$(documents).animate({
									height: "+=" + docsHeight
								});
			docsSelected = true;
		}
		else
			if (!$(selectDocuments).attr('checked') && docsSelected) {
				$(documents).animate({
										height: "-=" + docsHeight
									});
				docsSelected = false;
			}
	};
	$(allDocuments).click(checkDocumentVisibility);
	$(selectDocuments).click(checkDocumentVisibility);

	var div2 = $("<div/>")
			.addClass('facetSelection')
			.appendTo(this.advancedSearch);

	$("<input id='textsSearch' type='radio' name='type'><label for='textsSearch'>" + Util.getString('texts') + "</label></input><input id='facetsSearch' type='radio' name='type'><label for='facetsSearch'>" + Util.getString('facets') + "</label></input>")
			.appendTo(div2);

	var inTexts = $('#textsSearch')[0];
	var inFacets = $('#facetsSearch')[0];

	$(inTexts).attr('checked', true);

	var facets = $('<div class="facetOptions"/>').appendTo(this.advancedSearch);

	$(facets).css('display', 'none');
	$(facets).css('overflow', 'hidden');

	var structureFacets = $('<div class="facetList"/>').appendTo(facets);
	var structureHeader = $('<span class="facetsHeader">' + Util.getString('documentStructure') + '</span>').appendTo(structureFacets);
	var structureList = $('<ul/>').appendTo(structureFacets);
	var entityFacets = $('<div class="facetList"/>').appendTo(facets);
	var entitiesHeader = $('<span class="facetsHeader">' + Util.getString('entities') + '</span>').appendTo(entityFacets);
	var entitiesList = $('<ul/>').appendTo(entityFacets);
	var facetsSelected = false;
	var facetsHeight;
	var facetSelection = [];

	// adds facets to advanced search with checkboxes and localized labels
	var addFacet = function(facet, index, div) {
		var entry = $("<li/>").appendTo(div);
		var checkbox = $("<input type='checkbox' id='" + facet.facet + "-" + index + "' /><label for='" + facet.facet + "-" + index + "'>" + Util.getFacetLabel(facet) + "</label>").appendTo(entry);
		facetSelection.push(false);
		checkbox.click(function() {
			facetSelection[index] = !facetSelection[index];
		});
	};

	var loadFacets = function() {
		$.each(Util.facets, function(i, facet) {
			if (facet.render) {
				addFacet(facet, i, entitiesList);
			}
			else {
				addFacet(facet, i, structureList);
			}
		});
		facetsHeight = $(facets).height();
		$(facets).css('height', '0px');
		$(facets).css('display', 'block');
	};

	var checkFacetVisibility = function() {
		if ($(inFacets).attr('checked') && !facetsSelected) {
			if (facetSelection.length === 0) {
				loadFacets();
			}
			$(facets).animate({
								height: "+=" + facetsHeight
							});
			facetsSelected = true;
		}
		else
			if (!$(inFacets).attr('checked') && facetsSelected) {
				$(facets).animate({
									height: "-=" + facetsHeight
								});
				facetsSelected = false;
			}
	};

	$(inTexts).click(checkFacetVisibility);
	$(inFacets).click(checkFacetVisibility);

	this.doAdvancedSearch = function(evt) {
		var facet = '';
		if ($(inFacets).attr('checked')) {
			for (var i in Util.facets) {
				if (facetSelection[i]) {
					if (facet !== '') {
						facet += ',';
					}
					facet += Util.facets[i].facet.substring(Util.facets[i].facet.indexOf(':') + 1);
				}
			}
			if (facet === '') {
				var content = $("<div class='inner'/>");
				Util.getAlertMessage(Util.getString('noFacetsSelected')).appendTo(content);
				EditionGui.createDialog(Util.getString('warning'), content, evt, 20, 20);
				return;
			}
		}
		var documents = '';
		if ($(selectDocuments).attr('checked')) {
			for (var j in Util.documents) {
				if (documentSelection[j]) {
					if (documents !== '') {
						documents += ',';
					}
					documents += Util.documents[j].title;
				}
			}
			if (documents === '') {
				var content = $("<div class='inner'/>");
				Util.getAlertMessage(Util.getString('noDocumentsSelected')).appendTo(content);
				EditionGui.createDialog(Util.getString('warning'), content, evt, 20, 20);
				return;
			}
		}
		browser.search(facet, documents);
	};

	this.advancedSearch.css('display', 'none');
};

/**
 * Perfoms a search for the currently inserted term and a given facet-string. For each of the results (document with hits) it triggers the addCategory method.
 *
 * @this {Browser}
 * @param {string} facet A facets string to perform the search on selected facets instead of whole document texts.
 */
Browser.prototype.search = function(facet, documents) {
	"use strict";
	var browser = this,
		cancel = false;

	var onclose = function() {
		cancel = true;
		browser.stopProcessing();
	};
	this.startProcessing(onclose);
	var callback = function(xml) {
		if (!cancel) {
			var results = [];
			$(xml).find('result').each(function() {
				var page = parseInt($(this).find('page').text());

				if (page === '') {
					page = 1;
				}

				var text = $(this).find('fragment').find('body').find('p');
				var doc = $(this).find('doc').text();

				if (typeof results[doc] === 'undefined') {
					results[doc] = [];
				}
				results[doc].push({
									page: page,
									text: text
								});
				// update length of array
				results.length++;
			});
			for (var i in Util.documents) {
				var id = Util.documents[i].title;
				if (typeof results[id] !== 'undefined') {
					browser.addCategory(Util.documents[i], results[id]);
				}
			}
			// in case we have no results
			if (results.length === 0) {
				browser.searchResults.html('<li>' + Util.getString('noResults') + '<em>»' + browser.searchField.val() + '«</em></li>');
			}
			browser.stopProcessing();
		}
	};
	DocumentServerConnection.getSearchResults(this.searchField.val(), facet, documents, callback);
};

/**
 * Resizes the browsers content.
 *
 * @this {Browser}
 */
Browser.prototype.resizeContent = function() {
	"use strict";
	var height = $(this.content).height();
	var diff1 = parseInt($(this.header).css("padding-bottom")) + parseInt($(this.header).css("padding-top"));

	diff1 += parseInt($(this.header).css("margin-bottom")) + parseInt($(this.header).css("margin-top"));

	var diff2 = parseInt($(this.main).css("padding-bottom")) + parseInt($(this.main).css("padding-top"));

	diff2 += parseInt($(this.main).css("margin-bottom")) + parseInt($(this.main).css("margin-top"));

	$(this.main).css('height', (height - this.header.height() - diff1 - diff2) + 'px');
	$(this.searchTypes).css('height', (height - this.header.height() - diff1 - diff2) + 'px');
	$(this.searchTypes).css('width', $(this.main).width() + 'px');

	this.overlay.resize();
};

/**
 * Adds a single document to the documents tab; the outline tree is generated and its root will ne shown. At the end, all documents from the server are listed in the documents tab.
 *
 * @this {Browser}
 * @param {Document} doc The document to add to the documents list.
 */
Browser.prototype.addDocument = function(doc) {
	"use strict";
	var browser = this;

	var callback = function(outline) {

		var tempDiv = $("<div/>");
		$(outline).appendTo(tempDiv);
		var outlineTree = (new XHTMLProcessor(tempDiv)).generateOutlineTree(doc.name);

		// Ugly fix to ensure alphabetical order of documents in browser
		// TODO: First document loaded is still the first to call back, while it should be the first in the list
		var titles = browser.documents.find('.head-anchor');
		var root;
		if ( titles.length > 0 ) {
			titles.each( function(index, title ) {
				if ( doc.name < $(title).text() ) {
					root = $("<div/>").insertBefore( $(title).closest('div') );
					return false;
				}
			});
			if ( root === undefined ) {
				root = $("<div/>").insertAfter( $(titles[titles.length - 1]).closest('div') );
			}
		} else {
			root = $("<div/>").appendTo(browser.documents);
		}

		var setLinks = function() {

			var oldLinks = $('.dynatree-title', root);

			for (var i = 0; i < oldLinks.length; i++) {
				$(oldLinks[i]).remove();
			}

			var setEvents = function(node) {
				$(node).unbind('click');
				$(node).click(function(evt) {
					var position = $(this).attr('name');
					if (position === '') {
						EditionGui.openDocument(evt, doc);
					} else {
						EditionGui.openDocument(evt, doc, undefined, 'text', position);
					}
				});
			};
			var newLinks = $('.head-anchor', root);
			for (var j = 0; j < newLinks.length; j++) {
				setEvents(newLinks[j]);
			}

		};

		var calcTree = function() {
			if (typeof $(root).dynatree === 'undefined') {
				setTimeout(function() {
					calcTree();
				}, 100);
			} else {
				$(root).dynatree({
					children: outlineTree,
					onRender: setLinks,
					debugLevel: 0
				});
				setLinks();
			}
		};
		calcTree();

	};
	DocumentServerConnection.getDocumentOutline(doc, callback);
};

/**
 * Adds results for a document with hits for a performed search to the results list.
 *
 * @this {Browser}
 * @param {Document} doc The document with hits to add to the documents list.
 * @param {Document} results The results within the given document.
 */
Browser.prototype.addCategory = function(doc, results) {
	"use strict";
	var browser = this;
	var searchTab = $('<li/>').appendTo(this.searchResults);
	var searchLink = $('<a class="result-title"><span class="icon-chevron-right">&nbsp;</span><span class="doc-name">' + doc.name + '</span><span class="results-counter">' + results.length + ' ' + Util.getString('searchResults') + '</span></a>').appendTo(searchTab);
	var searchContent = [];
	var visible = false;

	$.each(results, function(index, result) {

		var oddEven = index % 2 === 0 ? 'even' : 'odd';

		var searchResult = $('<div class="clearfix searchresult ' + oddEven + '"/>').appendTo(searchTab);
		searchContent.push(searchResult);

		$(searchResult).addClass('visuallyhidden');

		var thumb = $("<div class='searchresult-thumbnail'/>").appendTo(searchResult);

		// add class to hover
		$(thumb).hover(
			function() {
				// Unbinding click event, elsewise multiple click triggers will be assigned. Better solution would be to just change visibility.
				$('div').remove('.searchresult-thumbnail-link').unbind('click');
				$(this).append('<div class="searchresult-thumbnail-link" />').click(function(evt) {
					EditionGui.openDocument(evt, doc, result.page, "images");
				});
			},
			function() {
				$('div').remove('.searchresult-thumbnail-link');
			}
		);
		var thumbDiv = $("<img class='thumbnail lazy fat-border' src='ropen/Resources/Public/Images/dummySmall.png' data-original='" + doc.imagePath + "80/" + doc.images[result.page - 1] + "'/>").appendTo(thumb);

		$(thumbDiv).css('margin-bottom', '20px');

		var textDiv = $('<div class="result-text"/>').appendTo(searchResult);
		$(textDiv).html(result.text);
		// add class to hover
		$(textDiv).hover(
			function() {
				// Unbinding click event, elsewise multiple click triggers will be assigned. Better solution would be to just change visibility.
				$('div').remove('.searchresult-text-link').unbind('click');
				$(this).append('<div class="searchresult-text-link" />').click(function(evt) {
					EditionGui.openDocument(evt, doc, result.page, "pages");
				});
			},
			function() {
				$('div').remove('.searchresult-text-link');
			}
		);

	});

	$(searchLink).click(function() {
		visible = !visible;

		for (var i = 0; i < searchContent.length; i++) {
			if (visible) {
				$(this).children().first().removeClass('icon-chevron-right').addClass('icon-chevron-down');
				$(searchContent[i]).removeClass('visuallyhidden');
			}
			else {
				$(this).children().first().removeClass('icon-chevron-down').addClass('icon-chevron-right');
				$(searchContent[i]).addClass('visuallyhidden');
			}
		}
		$("img.lazy").lazyload();
	});
};