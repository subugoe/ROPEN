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
	var depth = -1;
	var findLinks = function(l,d){
		for( var i=0; i<Util.facets.length; i++ ){
			var entity = Util.facets[i].facet.replace(':','\\:');
			var el = $('.'+entity,l);
			for( var j=0; j<el.length; j++ ){
				findLinks(el[j],d++);
			}
		}
		if( d > depth ){
			depth = d;
		}
	}
	findLinks(link,depth);
	if( depth >= 0 ){
		$(link).css('border-width','1px');
		$(link).css('padding',depth+'px');
	}
};

/**
 * Appends mouseover-tooltips for all links/spans with facet-classes, all notes and all tei-references
 *
 * @this {LinkProcessor}
 * @param {DIV} div The div that contains the links and spans.
*/
LinkProcessor.prototype.appendLinkTooltips = function(div){
	var links = this.findLinks(div,'a');
	var generateTooltip = function(link,lc,spans,content){
		var appendHref = function(content){
			if( typeof content.hl1 != 'undefined' ){
				$(content.hl1).click(function(){
					window.open(content.href,'_blank');
				});
				if( typeof content.hl2 != 'undefined' ){
					$(content.hl2).click(function(){
						new HyperlinkWindow(content.href,content.altName);
					});
				}
			}
		}
		Tooltip.setTooltip(link,content,function(div){
			for( var k=0; k<spans.contents.length; k++ ){
				appendHref(spans.contents[k]);
			}
			appendHref(lc);
		});
	}
	for( var i=0; i<links.links.length; i++ ){
		var content = links.contents[i].content;
		var spans = this.findLinks(links.links[i],'span');
		for( var j=0; j<spans.contents.length; j++ ){
			$('<hr/>').appendTo(content);
			$(spans.contents[j].content).appendTo(content);
		}
		generateTooltip(links.links[i],links.contents[i],spans,content);
	}
};

LinkProcessor.prototype.appendTooltips = function(div,dialog){
	this.appendLinkTooltips(div);
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
					EditionGui.openDocument(evt,dialog.document,page,"pages");
					Tooltip.removeAllTooltips();
				});
			});
		});
	}
	catch(e){}
	// tei notes
	try {
		var processor = this;
		var notes = $('.tei\\:note',div);
		$.each(notes,function(index,note){
			var nameId = note.href.substring(note.href.indexOf('#')+1);
			var href = $('a[name='+nameId+']')[0];
			var content = $(href).parent()[0].innerHTML;
			Tooltip.setTooltip(note,content,function(div){
				processor.appendLinkTooltips(div);
				processor.colorizeLinks(div,dialog.facetSelection);
			});
		});	
	}
	catch(e){}
};

LinkProcessor.prototype.findLinks = function(div,type){
	var processor = this;
	var links = [];
	var contents = [];
	var entityId = -1;
	for( var i=0; i<Util.facets.length; i++ ){
		var facet = Util.facets[i];
		if( !facet.render ){
			continue;
		}
		entityId++;
		var entity = facet.facet.replace(':','\\:');
		var color = facet.color;
		$('.'+entity,div).addClass('entity entity'+entityId);
		var linksI = $(type+'.'+entity,div);
		$.each(linksI,function(index,link){
			links.push(link);
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
			var hyperl = link.href || Util.getAttribute(link,'xlink:to');
			if( hyperl ){
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
			contents.push({
				content: content,
				hl1: hyperlink1,
				hl2: hyperlink2,
				href: hyperl,
				altName: altName
			});
		});
	}
	return {
		links: links,
		contents: contents
	};
};


/**
 * Colorizes links inside a given div for all facets, which are 'true' in facetSelection
 * 
 * @this {LinkProcessor}
 * @param {DIV} div The div that contains the links.
 * @param {Array} facetSelection An array of boolean values; each 'true' triggers a coloring for the corresponding entity.
*/
LinkProcessor.prototype.colorizeLinks = function(div,facetSelection){
	var processor = this;
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
				if( facetSelection[i] ){
					processor.borderLink(link);
				}
				else {
					$(link).css('border-width','0px');
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
				var hyperl = link.href || Util.getAttribute(link,'xlink:to');
				if( typeof hyperl != 'undefined' ){
					$(link).css('color',EditionProperties.colors.validLink);
				}
				else {
					$(link).css('color',EditionProperties.colors.invalidLink);
				}
			});
		}
	}
};
