/**
 * Processor for XHTML fragments. Used to generate Outline Trees for the Browser window and to insert line numbers into XHTML text fragments.
 *
 * @constructor
 * @this {XHTMLProcessor}
 * @param {XHTML} xhtml The XHTML fragment.
 */
function XHTMLProcessor(xhtml){
	this.nodeStack = [];
	this.traverseNodes(xhtml[0]);
}

/**
 * Computes an Outline tree of the given XHTML fragment. The result is used for inspecting the chapters of a document within the Browser Window.
 *
 * @this {XHTMLProcessor}
 * @param {string} title The title of the corresponding document.
 * @return {JSON} The Outline tree in form of nested JSON objects. One JSON represents a marked chapter within the XHTML fragment.
 */
XHTMLProcessor.prototype.generateOutlineTree = function(title){
	this.title = title;
	var chapters = [{
		"title": "<a class='head-anchor'>"+this.title+"</a>",
		depth: -1,
		"children": []
	}];
	for( var i in this.nodeStack ){
		var node = this.nodeStack[i];
		var nodeName = node.nodeName;
		if( nodeName.match(/^H\d{1,2}$/g) ){
			var depth = parseInt(nodeName.substring(1));
			chapters.push({
				"title": node.innerHTML,
				depth: depth,
				"children": []
			});
		}
	}
	for( var i=1; i<chapters.length; i++ ){
		for( var j=i-1; j>=0; j-- ){
			if( chapters[j].depth < chapters[i].depth ){
				chapters[j].children.push(chapters[i]);
				break;
			}
		}
	}
	return chapters[0];
}

/**
 * Inserts line numbers into the given XHTML fragment. The result is used for displaying line numbers in the Pages and Text views of the document.
 *
 * @this {XHTMLProcessor}
 * @param {number} steps An information which line numbers should be inserted (e.g. steps = 5 inserts line number DIVs for lines 5, 10, 15, 20, ...)
 */
XHTMLProcessor.prototype.insertLineNumbers = function(steps){
	this.steps = steps;
	var lineCounter = 1;
	for( var i in this.nodeStack ){
		var node = this.nodeStack[i];
		if( node.nodeName == 'HR' && this.hasAttributeValue(node,'class','tei:pb') ){
			lineCounter = 1;
		}
		if( node.nodeName == 'BR' && this.hasAttributeValue(node,'class','tei:lb') ){
			for( var j=i; j>0; j-- ){
				var node2 = this.nodeStack[j-1];
				if( node2.nodeName == 'BR' || node2.nodeName == 'HR' || node2.nodeName == 'DIV' || node2.nodeName == 'P' ){
					var node3 = this.nodeStack[j];
					if( lineCounter % this.steps == 0 ){
						$("<div class='lineNumber'>"+lineCounter+"</div>").insertBefore(node3);
					}
					lineCounter++;
					break;
				}
			}
		}
	}
}

/**
 * Detects if a certain HTML node has an attribute with a specific value.
 *
 * @this {XHTMLProcessor}
 * @param {HTML} node The node to check.
 * @param {string} attribute The attribute of the node to check (e.g. 'class').
 * @param {string} value The value to check for.
 * @return {boolean} If the node has the attribute with the specific value or not.
 */
XHTMLProcessor.prototype.hasAttributeValue = function(node,attribute,value){
	if( node.attributes != null && node.attributes.length > 0 ){
		for( var i=0; i<node.attributes.length; i++ ){
			var a = node.attributes[i];
			if( a.nodeName == attribute && a.nodeValue.indexOf(value) != -1 ){
				return true;
			}
		}
	}
	return false;
}

/**
 * Traverses all nodes in the given XHTML fragment recursively. The result is a multidimensional ordering of the HTML text nodes in form of an array; the depth of a text node in the XHTML tree corresponds to its depth in the array. Required to separate all HTML text nodes that contain nested nodes of a different kind.
 *
 * @this {XHTMLProcessor}
 * @param {HTML} node The root node of the XHTML fragment.
 */
XHTMLProcessor.prototype.traverseNodes = function(node){
	if( node.hasChildNodes() ){
		var k = node.firstChild;
		while (k != null) {
			this.nodeStack.push(k);
			var val = k.nodeValue;
			if( val == null ){
				this.traverseNodes(k);
			}
			k = k.nextSibling;
		}
	}
}
