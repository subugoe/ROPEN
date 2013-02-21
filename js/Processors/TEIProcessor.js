/**
 * Generates a TEI tree for the given TEI document.
 *
 * @constructor
 * @this {TEIProcessor}
 * @param {XML} tei The TEI xml fragment.
 */
function TEIProcessor(tei){
	this.tei = tei;
}

/**
 * Computes the TEI tree.
 *
 * @this {TEIProcessor}
 * @return {JSON} The TEI tree in form of nested JSON objects. One JSON represents a node in the XML fragment.
 */
TEIProcessor.prototype.generate = function(){
	var teiRoot = $(this.tei).children(':first-child');
	var teiData = [];
	this.traverseNode($(teiRoot),teiData);
	var teiTree = { "title": "&lt;" + teiRoot[0].nodeName + "&gt;", "children": teiData };
	return teiTree;
}

/**
 * Recursive function to traverse an XML node. The recursion causes the nesting of the TEI tree. Required to separate nested XML nodes from text fragment in the HTML-like structure.
 *
 * @this {TEIProcessor}
 * @param {XML} node The XML node to traverse.
 * @param {Array} data An array to insert the child nodes of the given XML node.
 */
TEIProcessor.prototype.traverseNode = function( node, data ){
	var children = $(node).children();	
	for( var i=0; i<children.length; i++ ){
		var childData = [];
		this.traverseNode(children[i],childData);
		var attributes = this.traverseNodeAttributes(children[i]);
		var attributesString = "";
		if( attributes != null ){
			attributesString += ": ";
			for( var j=0; j<attributes.length; j++ ){
				if( j > 0 ){
					attributesString += ", ";
				}
				attributesString += attributes[j];
			}
		}
		if( children[i].hasChildNodes() ){
			var dummy = $.extend(true, [], childData);
			var counter = 0;
			childData = [];
			var k = children[i].firstChild;
			while (k != null) {
				var val = k.nodeValue;
				if( val != null ){
					if( val.replace(/\s+/g,'') != '' ){
						childData.push({"title": val})
					}
				}
				else {
					childData.push(dummy[counter]);
					counter++;
				}
				k = k.nextSibling;
			}
		}
		data.push({
			"title": "&lt;" + children[i].nodeName + "" + attributesString + "&gt;",
			"children": childData
		});
	}	
}

/**
 * Retrieve all attributes of a given node in form of a string.
 *
 * @this {TEIProcessor}
 * @param {XML} node The XML node to get the attributes.
 * @return {string} All attributes of the given node in form of a string.
 */
TEIProcessor.prototype.traverseNodeAttributes = function(node){
	var attributes = null;
	if( node.attributes != null && node.attributes.length > 0 ){
		attributes = [];
		for( var i=0; i<node.attributes.length; i++ ){
			attributes.push(node.attributes[i].nodeName + "=" + node.attributes[i].nodeValue);
		}
	}
	return attributes;
}
