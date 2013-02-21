/**
 * Browser Implementation to show the list of available documents and to allow search requests on them.
 *
 * @constructor
 * @this {Browser}
 */
Browser = function(){
}

/**
 * Initializes the Browsers GUI and interaction.
 *
 * @this {Browser}
 */
Browser.prototype.initialize = function(){
	var browser = this;
	var show = function(showSearch){
		if( showSearch ){
			browser.searchTypes.css('display','block');
			browser.documents.css('display','none');
			browser.searchTab.addClass('selected');
			browser.documentTab.removeClass('selected');
		} 
		else {
			browser.searchTypes.css('display','none');
			browser.documents.css('display','block');
			browser.searchTab.removeClass('selected');
			browser.documentTab.addClass('selected');
		} 
	}
	this.header = $("<div class='scope-selector'/>").appendTo(this.content);
	this.searchTab = $("<a>"+Util.getString('search')+"</a>").appendTo(this.header);
	this.documentTab = $("<a>"+Util.getString('documents')+"</a>").appendTo(this.header);
	this.searchTab.click(function(){
		show(true);
	});
	this.documentTab.click(function(){
		show(false);
	});
	var wa1 = $(this.searchTab).width();
	var wa2 = $(this.documentTab).width();
	var w1 = parseInt($(this.searchTab).css("padding-left"))*2+$(this.searchTab).width();
	var w2 = parseInt($(this.documentTab).css("padding-left"))*2+$(this.documentTab).width();
	var w = w1+w2;
	$(this.searchTab).css('padding-left',((w/2-wa1)/2)+'px');
	$(this.searchTab).css('padding-right',((w/2-wa1)/2)+'px');
	$(this.documentTab).css('padding-left',((w/2-wa2)/2)+'px');
	$(this.documentTab).css('padding-right',((w/2-wa2)/2)+'px');
	this.main = $("<div class='main'/>").appendTo(this.content);
	this.main.css('overflow-x','hidden');
	this.main.css('overflow-y','auto');
	this.main.css('position','relative');
	var selectedSearchType = 'simple';
	var toggleSearch = function(searchType){
		if( selectedSearchType == searchType ){
			browser.advancedSearch.css('display','none');
			selectedSearchType = 'simple';
		} 
		else if( searchType == 'advanced' ){
			browser.advancedSearch.css('display','block');
			selectedSearchType = searchType;
		} 
	}
	this.searchTypes = $('<div/>').appendTo(this.main);
	$(this.searchTypes).css('position','relative');
	var simpleSearch = $("<form/>").appendTo(this.searchTypes);
	this.searchField = $("<input type='text'/>").appendTo(simpleSearch);
	this.searchButton = $("<input type='submit' value=''/>").appendTo(simpleSearch);
	var search = function(){
		if( browser.searchField.val() != '' ){
			browser.clearSearch();
			if( selectedSearchType == 'simple' ){
				browser.search('');
			}
			else if( selectedSearchType == 'advanced' ){
				browser.doAdvancedSearch();
			}
		}
	};
	simpleSearch.submit(function(evt){
		evt.preventDefault();
		search();
	});
	this.as = $("<div class='advancedSearch'/>").appendTo(this.searchTypes);
	this.advancedSearchTab = $("<span>"+Util.getString('advancedSearch')+"</span>").appendTo(this.as);
	this.advancedSearchTab.click(function(){
		toggleSearch('advanced');
	});
	this.prepareAdvancedSearch();
	this.documents = $('<div/>').appendTo(this.main);
	this.documents.css('overflow','auto')
	this.searchResults = $('<ul class="hits"/>').appendTo(this.searchTypes);
	show(EditionProperties.browserSearch);
	$(this.label).html(Util.getString('browser'));
	this.overlay = new OverlayWindow(this.searchTypes);
	this.resizeContent();
};

/**
 * Empty the results of a previous search.
 *
 * @this {Browser}
 */
Browser.prototype.clearSearch = function(){
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
Browser.prototype.startProcessing = function(onclose){
	this.overlay.loaderOverlay(onclose);
};

/**
 * Removes the loader overlay div when processing is done.
 *
 * @this {Browser}
 */
Browser.prototype.stopProcessing = function(){
	this.overlay.removeOverlay();
};

/**
 * Prepares the GUI and interaction for the advanced search tab.
 *
 * @this {Browser}
 */
Browser.prototype.prepareAdvancedSearch = function(){
	var browser = this;
	this.advancedSearch = $("<div/>").appendTo(this.as);
	var div1 = $('<div/>').appendTo(this.advancedSearch);
	$("<input id='allDocsSearch' type='radio' name='scope'>"+Util.getString('allDocuments')+"</input> "+Util.getString('or')+"<input id='selectedDocsSearch' type='radio' name='scope'>"+Util.getString('selectDocuments')+"</input>").appendTo(div1);
	var allDocuments = $('#allDocsSearch')[0];
	var selectDocuments = $('#selectedDocsSearch')[0];
	var documents = $('<div class="selectedDocsDisplay"/>').appendTo(this.advancedSearch);
	var documentList = $('<ul/>').appendTo(documents);
	$(documents).css('overflow','hidden');
	$(allDocuments).attr('checked',true);
	var docsSelected = false;
	var docsHeight;
	var documentSelection = [];
	var addDocument = function(document,index){
		var entry = $("<li/>").appendTo(documentList);
		var checkbox = $("<input type='checkbox'>"+document.name+"</input>").appendTo(entry);
		documentSelection.push(false);
		checkbox.click(function(){
			documentSelection[index] = !documentSelection[index];
		});
	}
	var loadDocs = function(){
		$.each(Util.documents,function(i,document){
			addDocument(document,i);
		});
		docsHeight = $(documents).height();
		$(documents).css('height','0px');
		$(documents).css('display','block');
	}
	var checkDocumentVisibility = function(){
		if( $(selectDocuments).attr('checked') && !docsSelected ){
			if( documentSelection.length == 0 ){
				loadDocs();
			}
			$(documents).animate({
				height: "+="+docsHeight,
			});
			docsSelected = true;
		}
		else if( !$(selectDocuments).attr('checked') && docsSelected ){
			$(documents).animate({
				height: "-="+docsHeight,
			});
			docsSelected = false;
		}
	}
	$(allDocuments).click(checkDocumentVisibility);
	$(selectDocuments).click(checkDocumentVisibility);
	var div2 = $("<div/>").appendTo(this.advancedSearch);
	$("<input id='textsSearch' type='radio' name='type'>"+Util.getString('texts')+"</input> "+Util.getString('or')+"<input id='facetsSearch' type='radio' name='type'>"+Util.getString('facets')+"</input>").appendTo(div2);
	var inTexts = $('#textsSearch')[0];
	var inFacets = $('#facetsSearch')[0];
	$(inTexts).attr('checked',true);
	var facets = $('<div class="facetOptions"/>').appendTo(this.advancedSearch);
	$(facets).css('display','none');
	$(facets).css('overflow','hidden');
	var structureFacets = $('<div class="facetList"/>').appendTo(facets);
	var structureHeader = $('<span class="facetsHeader">'+Util.getString('documentStructure')+'</span>').appendTo(structureFacets);
	var structureList = $('<ul/>').appendTo(structureFacets);
	var entityFacets = $('<div class="facetList"/>').appendTo(facets);
	var entitiesHeader = $('<span class="facetsHeader">'+Util.getString('entities')+'</span>').appendTo(entityFacets);
	var entitiesList = $('<ul/>').appendTo(entityFacets);
	var facetsSelected = false;
	var facetsHeight;
	var facetSelection = [];
	var addFacet = function(facet,index,div){
		var entry = $("<li/>").appendTo(div);
		var checkbox = $("<input type='checkbox'>"+Util.getFacetLabel(facet)+"</input>").appendTo(entry);
		facetSelection.push(false);
		checkbox.click(function(){
			facetSelection[index] = !facetSelection[index];
		});
	}
	var loadFacets = function(){
		$.each(Util.facets,function(i,facet){
			if( facet.render ){
				addFacet(facet,i,entitiesList);
			}
			else {
				addFacet(facet,i,structureList);
			}
		});
		facetsHeight = $(facets).height();
		$(facets).css('height','0px');
		$(facets).css('display','block');
	}
	var checkFacetVisibility = function(){
		if( $(inFacets).attr('checked') && !facetsSelected ){
			if( facetSelection.length == 0 ){
				loadFacets();
			}
			$(facets).animate({
				height: "+="+facetsHeight,
			});
			facetsSelected = true;
		}
		else if( !$(inFacets).attr('checked') && facetsSelected ){
			$(facets).animate({
				height: "-="+facetsHeight,
			});
			facetsSelected = false;
		}
	}
	$(inTexts).click(checkFacetVisibility);
	$(inFacets).click(checkFacetVisibility);
	this.doAdvancedSearch = function(){
		var facet = '';
		if( $(inFacets).attr('checked') ){
			for( var i in Util.facets ){
				if( facetSelection[i] ){
					if( facet != '' ){
						facet += ',';
					}
					facet += Util.facets[i].facet.substring(Util.facets[i].facet.indexOf(':')+1);
				}
			}
		}
		browser.search(facet);
	};
	this.advancedSearch.css('display','none');
};

/**
 * Perfoms a search for the currently inserted term and a given facet-string. For each of the results (document with hits) it triggers the addCategory method.
 *
 * @this {Browser}
 * @param {string} facet A facets string to perform the search on selected facets instead of whole document texts.
 */
Browser.prototype.search = function(facet){
	var browser = this;
	var cancel = false;
	var onclose = function(){
		cancel = true;
		browser.stopProcessing();
	}
	this.startProcessing(onclose);
	var callback = function(xml){
		if( !cancel ){
	    		var results = [];
			$(xml).find('result').each(function(){
				var page = parseInt($(this).find('page').text());
				if( page == '' ){
					page = 1;
				}
				var text = $(this).find('fragment').find('body').find('p');
				var doc = $(this).find('doc').text();
				if( typeof results[doc] == 'undefined' ){
					results[doc] = [];
				}
			    	results[doc].push( { page: page, text: text } );
			});
			for( var i in Util.documents ){
				var id = Util.documents[i].title;
				if( typeof results[id] != 'undefined' ){
					browser.addCategory(Util.documents[i],results[id]);
				}
			}
			browser.stopProcessing();
		}
	}
	DocumentServerConnection.getSearchResults(this.searchField.val(),facet,callback);
};

/**
 * Resizes the browsers content.
 *
 * @this {Browser}
 */
Browser.prototype.resizeContent = function(){
	var height = $(this.content).height();
	var diff1 = parseInt($(this.header).css("padding-bottom"))+parseInt($(this.header).css("padding-top"));
	diff1 += parseInt($(this.header).css("margin-bottom"))+parseInt($(this.header).css("margin-top"));
	var diff2 = parseInt($(this.main).css("padding-bottom"))+parseInt($(this.main).css("padding-top"));
	diff2 += parseInt($(this.main).css("margin-bottom"))+parseInt($(this.main).css("margin-top"));
	$(this.main).css('height',(height-this.header.height()-diff1-diff2)+'px');
	$(this.searchTypes).css('height',(height-this.header.height()-diff1-diff2)+'px');
	$(this.searchTypes).css('width',$(this.main).width()+'px');
	this.overlay.resize();
};

/**
 * Adds a single document to the documents tab; the outline tree is generated and its root will ne shown. At the end, all documents from the server are listed in the documents tab.
 *
 * @this {Browser}
 * @param {Document} doc The document to add to the documents list.
 */
Browser.prototype.addDocument = function(doc){
	var browser = this;
	var callback = function(outline){
		var tempDiv = $("<div/>");
		$(outline).appendTo(tempDiv);
		var outlineTree = (new XHTMLProcessor(tempDiv)).generateOutlineTree(doc.name);
	    	var root = $("<div/>").appendTo(browser.documents);
		var setLinks = function(){
			var oldLinks = $('.dynatree-title',root);
			for( var i=0; i<oldLinks.length; i++ ){
				$(oldLinks[i]).remove();
			}
			var setEvents = function(node){
				var position = $(newLinks[i]).attr("name");
				$(node).unbind('click');
			    	$(node).click(function(evt){
					if( position == '' ){
				    		EditionGui.openDocument(evt,doc);
					}
					else {
				    		EditionGui.openDocument(evt,doc,undefined,'text',position);
					}
			    	});
				/*
					$(node).draggable({
						opacity: 0.7,
						helper: "clone",
						start: function( event, ui ) {
							var dragthing = $('.ui-draggable-dragging')[0];
							$(dragthing).appendTo($('#editionContainer')[0]);
							console.info($(node).position(),$(node).offset());
						}
					});
				*/
			}
			var newLinks = $('.head-anchor',root);
			for( var i=0; i<newLinks.length; i++ ){
				setEvents(newLinks[i]);
			}
		}
		var calcTree = function(){
			if( typeof $(root).dynatree == 'undefined' ){
				setTimeout(function(){ calcTree() }, 100);
			}
			else {
				$(root).dynatree({
					children: outlineTree,
					onRender: setLinks
				});
				setLinks();
			}
		}
		calcTree();
	}
	DocumentServerConnection.getDocumentOutline(doc,callback);
};

/**
 * Adds results for a document with hits for a performed search to the results list.
 *
 * @this {Browser}
 * @param {Document} doc The document with hitsto add to the documents list.
 * @param {Document} results The results within the given document.
 */
Browser.prototype.addCategory = function(doc,results){
	var browser = this;
	var searchTab = $('<li/>').appendTo(this.searchResults);
	var searchLink = $('<a>' + doc.name + ' (' + results.length + ')' + '</a>').appendTo(searchTab);
	var searchContent = [];
	var visible = false;
	$.each(results, function(index,result){
		var searchResult = $('<div class="clearfix"/>').appendTo(searchTab);
		searchContent.push(searchResult);
		$(searchResult).css('display','none');
		var thumb = $("<div class='searchresult-thumbnail'/>").appendTo(searchResult);
		var thumbDiv = $("<div class='dummyThumbSmall'/>").appendTo(thumb);
		$(thumbDiv).css('margin-bottom','20px');
		var thumbnail = $("<div class='loadme'/>").appendTo(thumbDiv);
		thumbnail.css('height',thumbDiv.height()+'px');
		thumbnail.css('width',thumbDiv.width()+'px');
		thumbnail.attr("innerHTML","<!--<img class='thumbnail' src='" + doc.imagePath+"80/"+doc.images[result.page-1] + "'/>-->");
	    	thumbDiv.click(function(evt){
	    		EditionGui.openDocument(evt,doc,result.page,"images");
	    	});
		var textDiv = $("<p/>").appendTo(searchResult);
		$(textDiv).html(result.text);
	    	$(textDiv).click(function(evt){
	    		EditionGui.openDocument(evt,doc,result.page,"pages");
	    	});
	});
    	$(searchLink).click(function(){
		visible = !visible;
		for( var i=0; i<searchContent.length; i++ ){
			if( visible ){
				$(searchContent[i]).css('display','block');
			}
			else {
				$(searchContent[i]).css('display','none');
			}
		}
		$('div.loadme',this.searchResults).lazyLoad(searchTab,imageLoad,1000);
    	});
};
