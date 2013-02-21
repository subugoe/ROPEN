/**
 * Creates a processor to handle design and interaction of links within documents
 *
 * @constructor
 * @this {LinkProcessor}
 */
function LinkProcessor(){
}

/**
 * Tries to find an alternative name if available in the given node
 *
 * @this {LinkProcessor}
 * @param {HTML} node The node to find an alternative name (checks if class attribute contains 'tei:addName').
 * @return {string} null or the alternative name.
 */
LinkProcessor.prototype.getAlternativeName = function(node){
	var nodes = node.childNodes;
	for( var i=0; i<nodes.length; i++ ){
		if( nodes[i].firstChild == null ){				
			if( i+1 < nodes.length ){
				if( nodes[i+1].firstChild == null ){
					continue;
				}
				if( nodes[i+1].getAttribute('class') == 'tei:addName' ){
					return nodes[i+1].innerHTML;
				}
			}
			return null;
		} 
	}
};

/**
 * Adds borders if there are nested links.
 *
 * @this {LinkProcessor}
 * @param {HTML} link The link to check if there are nested other links (spans).
 */
LinkProcessor.prototype.borderLink = function(link){
	for( var i=0; i<Util.facets.length; i++ ){
		var entity = Util.facets[i].facet.replace(':','\\:');
		if( $('.'+entity,link).length > 0 ){
			$(link).css('border-width','1px');
			return;
		}
	}
};

/**
 * Appends mouseover-tooltips for all links/spans with facet-classes, all notes and all tei-references
 *
 * @this {LinkProcessor}
 * @param {DIV} div The div that contains the links and spans.
 * @param {DocumentDialog} dialog The dialog that contains the div.
*/
LinkProcessor.prototype.appendTooltips = function(div,dialog){
	// links and spans
	var processor = this;
	for( var i=0; i<Util.facets.length; i++ ){
		var facet = Util.facets[i];
		if( !facet.render ){
			continue;
		}
		var entity = facet.facet.replace(':','\\:');
		var color = facet.color;
		$('.'+entity,div).addClass('entity');
		var links = $('.'+entity,div);
		$.each(links,function(index,link){
			$(link).css('text-decoration','none');
			var content = $('<div/>');
			var cert;
			var certainty = $('.type-certainty',link);
			if( typeof certainty[0] != 'undefined' ){
				cert = $(certainty[0]).html();
			}
			var altName = processor.getAlternativeName(this);
			if( altName == null ){
				altName = link.innerHTML;
			}
			if( typeof cert != 'undefined' ){
				altName += " &#040;"+cert+"&#041;";
			}
			$(content).append('<p>'+altName+'</p>');
			var p = $('<p class="data_link"/>').appendTo(content);
			$(p).append('<div class="thumb" style="background-color:'+color+';"/>');
			$(p).append('<div class="tooltipLabel" style="color:'+color+';">'+Util.getFacetLabel(facet)+'</div>');
			var hyperlink1 = undefined, hyperlink2 = undefined;
			if( typeof link.href != 'undefined' ){
				if( entity.indexOf('bibl') ){
					hyperlink1 = $('<a href="javascript:void(0)">'+Util.getString('database')+'<span class="extern_link"/></a>');
				}
				else {
					hyperlink1 = $('<a href="javascript:void(0)">'+Util.getString('bibl')+'<span class="extern_link"/></a>');
				}
				$(p).append('<br>');
				$(p).append('<div class="anchor"/>');
				$(p).append($(hyperlink1));
				if( EditionProperties.hyperlinkWindow ){
					hyperlink2 = $('<a href="javascript:void(0)"><span class="intern_link"/></a>');
					$(p).append($(hyperlink2));
				}
			}
			Tooltip.setTooltip(link,content,function(div){
				if( typeof hyperlink1 != 'undefined' ){
					$(hyperlink1).click(function(){
						Tooltip.removeAllTooltips();
						window.open(link.href,'_blank');
					});
					if( typeof hyperlink2 != 'undefined' ){
						$(hyperlink2).click(function(){
							Tooltip.removeAllTooltips();
							new HyperlinkWindow(link.href,altName);
						});
					}
				}
				processor.appendTooltips(div,dialog);
				processor.colorizeLinks(div);
			});
			processor.borderLink(link);
			if( EditionProperties.tooltipMode == 'click' ){
				link.href = 'javascript:void(0)';
			}
		});
	}
	// tei references
	try {
		var notes = $('.tei\\:ref',div);
		$.each(notes,function(index,note){
			var page = parseInt($(note).html());
			var content = $('<div/>');
			$(content).append('<p>'+Util.getString('reference')+' '+page+'</p>');
			var p = $('<p/>').appendTo(content);
			var a1 = $('<a href="javascript:void(0)">'+Util.getString('showPage')+'</a>').appendTo(p);
			$('<br/>').appendTo(p);
			var a2 = $('<a href="javascript:void(0)">'+Util.getString('showPageWindow')+'</a>').appendTo(p);
			Tooltip.setTooltip(note,content,function(div){
				$(a1).click(function(){
					dialog.pageChanged(page);
					dialog.setDocType('pages');
					Tooltip.removeAllTooltips();
				});
				$(a2).click(function(evt){
					processor.openDocument(evt,dialog.document,page,"pages");
					Tooltip.removeAllTooltips();
				});
			});
		});
	}
	catch(e){}
	// tei notes
	try {
		var notes = $('.tei\\:note',div);
		$.each(notes,function(index,note){
			var nameId = note.href.substring(note.href.indexOf('#')+1);
			var href = $('a[name='+nameId+']')[0];
			var content = $(href).parent()[0].innerHTML;
			Tooltip.setTooltip(note,content,function(div){
				processor.appendTooltips(div,dialog);
				processor.colorizeLinks(div);
			});
		});	
	}
	catch(e){}
};

/**
 * Colorizes links inside a given div for all facets, which are 'true' in facetSelection
 * 
 * @this {LinkProcessor}
 * @param {DIV} div The div that contains the links.
 * @param {Array} facetSelection An array of boolean values; each 'true' triggers a coloring for the corresponding entity.
*/
LinkProcessor.prototype.colorizeLinks = function(div,facetSelection){
	var plain = true;
	if( typeof facetSelection != 'undefined' ){
		for( var i=0; i<Util.facets.length; i++ ){
			var facet = Util.facets[i];
			var entity = facet.facet.replace(':','\\:');
			var links = $('.'+entity,div);
			$.each(links,function(index,link){
				if( facetSelection[i] ){
					$(link).css('color',facet.color);
				}
				else {
					$(link).css('color','black');
				}
			});
			if( facetSelection[i] ){
				plain = false;
			}
		}
	}
	// if no facet is true, the plain (wikipedia) coloring is done
	if( plain ){
		for( var i=0; i<Util.facets.length; i++ ){
			var facet = Util.facets[i];
			if( !facet.render ){
				continue;
			}
			var entity = facet.facet.replace(':','\\:');
			var links = $('.'+entity,div);
			$.each(links,function(index,link){
				if( typeof link.href != 'undefined' ){
					$(link).css('color',EditionProperties.colors.validLink);
				}
				else {
					$(link).css('color',EditionProperties.colors.invalidLink);
				}
			});
		}
	}
};
