/**
 * Creates an instance of the Outline View
 *
 * @constructor
 * @this {Outline}
 * @param {Document} document The document to be shown in the Outline view.
 * @param {DIV} container The conatiner div for the Outline view.
 * @param {DocumentDialog} parent The parent document dialog.
 */
Outline = function(document,container,parent){
	this.type = "outline";
	this.document = document;
	this.container = container;
	this.parent = parent;
}

/**
 * Displays the outline of the document.
 *
 * @this {Outline}
 */
Outline.prototype.display = function(){
	var context = this;
	$(this.container).empty();
	this.stopped = false;
	this.parent.startProcessing();
	var failure = function(errorObject){
		if( !context.stopped ){
			$(Util.getErrorMessage(errorObject.status)).appendTo(context.container);
			context.parent.stopProcessing();
		}
	}
	var success = function(outline){
		var outlineTmp = $(outline);
		if( !context.stopped ){
			$(outlineTmp).find('a').each(function(){
				$(this).click(function(){
					context.parent.showTextAtPosition($(this).attr('name'));
				});
			});
			$(outlineTmp).appendTo(context.container);
			context.parent.stopProcessing();
		}
	}
	DocumentServerConnection.getDocumentOutline(this.document,success,failure);
}
