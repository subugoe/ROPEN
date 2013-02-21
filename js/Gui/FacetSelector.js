/**
 * Implementation for the facet selection panel.
 *
 * @constructor
 * @this {FacetSelector}
 * @param {HTML} div The parent DIV to append the facet selection panel.
 */
function FacetSelector(div){
	this.div = div;
	this.initialize();
}

/**
 * Initialization of the Facet Selector panel.
 *
 * @this {FacetSelector}
 */
FacetSelector.prototype.initialize = function(){
	var selector = this;	
	var facetsBar = document.createElement("div");
	$(this.div).append(facetsBar);
	this.checkboxes = [];
	this.facetSelection = [];
	var addFacet = function(facet,index){
		var entry = $("<div class='facetSelector'/>").appendTo(facetsBar);
		var checkbox = $("<input type='checkbox'/>").appendTo(entry);
		$("<span>"+Util.getFacetLabel(facet)+"</span>").appendTo(entry);
		$(entry).css('color',facet.color);
		selector.facetSelection.push(false);
		selector.checkboxes.push(checkbox);
		checkbox.click(function(){
			selector.facetSelection[index] = !selector.facetSelection[index];
			if( typeof selector.triggerFunc != 'undefined' ){
				selector.triggerFunc(selector.facetSelection);
			}
		});
	}
	$.each(Util.facets,function(i,facet){
		if( facet.render ){
			addFacet(facet,i);
		}
		else {
			selector.facetSelection.push(false);
			selector.checkboxes.push(false);
		}
	});
}

/**
 * Set new trigger function when facet selection changes (click on checkboxes). Required after the view of a document has been changed in the DocumentDialog (each DocumentDialog has only one assigned FacetSelector).
 *
 * @this {FacetSelector}
 * @param {Object} triggerFunc A trigger function to be called when a the facet selection changes.
 */
FacetSelector.prototype.setTriggerFunc = function(triggerFunc){
	this.triggerFunc = triggerFunc;
};

/**
 * Getter for the actual facet selection in form of an array of boolean values.
 *
 * @this {FacetSelector}
 * @return {Array} An array of boolean values (an entry is 'true', if the facet is selected; false, if not).
 */
FacetSelector.prototype.getFacetSelection = function(){
	return this.facetSelection;
};

/**
 * Getter for a string representation of the actual selected facets. Required for the Tags view when retrieving the tag data from the server.
 *
 * @this {FacetSelector}
 * @return {Array} The string representation of the actual selected facets, e.g. 'placeName,persName'
 */
FacetSelector.prototype.getFacetString = function(){
	var facets = '';
	for( var i=0; i<this.facetSelection.length; i++ ){
		if( this.facetSelection[i] ){
			if( facets != '' ){
				facets += ',';
			}
			facets += Util.facets[i].facet.substring(4);
		}
	}
	return facets;
};

/**
 * Setter for the facet selection in form of an array of boolean values. Required when views are linked to each other and for utilizing magnetic links.
 *
 * @this {FacetSelector}
 * @param {Array} facets An array of boolean values (an entry is 'true', if the facet is selected; false, if not).
 */
FacetSelector.prototype.setFacetSelection = function(facets){
	if( typeof facets == 'undefined' ){
		return;
	}
	this.facetSelection = facets;
	for( var i=0; i<facets.length; i++ ){
		if( !this.checkboxes[i] ){
			continue;
		}
		if( facets[i] ){
			$(this.checkboxes[i]).attr('checked',true);
		}
		else {
			$(this.checkboxes[i]).attr('checked',false);
		}
	}
};

/**
 * Activate only a specific facet.
 *
 * @this {FacetSelector}
 * @param {string} name The name of the facet to select.
 */
FacetSelector.prototype.activateFacet = function(name){
	var i = -1;
	for( var j=0; j<Util.facets.length; j++ ){
		if( Util.facets[j].render ){
			i++;
			if( Util.facets[j].facet == name ){
				$(this.checkboxes[i]).attr('checked',true);
				this.facetSelection[i] = true;
				break;
			}
		}
	}
};
