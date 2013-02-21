/**
 * Creates an instance of the TEI View
 *
 * @constructor
 * @this {TEI}
 * @param {Document} document The document to be shown in the TEI view.
 * @param {DIV} container The conatiner div for the TEI view.
 * @param {DocumentDialog} parent The parent document dialog.
 */
TEI = function(document,container,parent){
	this.type = "tei";
	this.document = document;
	this.container = container;
	this.parent = parent;
	this.initialize();
}

/**
 * Initializes the views HTML items and the download button.
 *
 * @this {TEI}
 */
TEI.prototype.initialize = function(){
	var context = this;
	$(this.container).css('position','relative');
	this.teiDownload = $("<div/>");
	this.teiDownload.addClass("teiDownload");
	this.teiDownload.attr( "title", Util.getString('downloadTei') );
	this.teiDownload.click(function(){
		context.parent.overlay.contentOverlay(context.teiDownloadDialog());
	});
}

/**
 * Displays the TEI of the document as an interactive tree.
 *
 * @this {TEI}
 */
TEI.prototype.display = function(){
	var context = this;
	var show = function(data){
		$(context.container).empty();
		$(data).appendTo(context.container);
		$(context.teiDownload).appendTo(context.container);
	}
	var showTree = function(tree){
		context.treeDiv = $("<div/>");
		$(context.treeDiv).dynatree({
		      children: context.document.tree
		});
		show(context.treeDiv);
		context.parent.stopProcessing();
	}
	var generate = function(xml){
		var data = new TEIProcessor(xml,context.container);
		context.document.tree = data.generate();
		showTree(context.document.tree);
	}
	if( typeof context.document.tree != 'undefined' ){
		setTimeout( function(){ context.parent.startProcessing(); showTree(context.document.tree); }, 10 );
	}
	else {
		var failure = function(errorObject){
			show(Util.getErrorMessage(errorObject.status));
			context.parent.stopProcessing();
		}
		var success = function(xml){
			context.parent.startProcessing();
			setTimeout( function(){ generate(xml); }, 10 );
		}
		DocumentServerConnection.getDocumentTEI(this.document,success,failure);
	}
};

/**
 * Generates the TEI download dialog.
 *
 * @this {TEI}
 * @return {HTML} The TEI download dialog as a DIV.
 */
TEI.prototype.teiDownloadDialog = function(){
	var url = EditionProperties.teiUri.replace(/DOC_ID/g,this.document.title);
	var contentDiv = $("<div/>");
	contentDiv.css('margin','20px');
	var file = url.substring(url.lastIndexOf("/")+1);		
	contentDiv.append( "<h2 style='text-align:center;'>" + Util.getString('downloadHeader') + "</h2>" );
	contentDiv.append( "<p style='text-align:center;'>" + file + "</p>" );
	var save;
	var browser = (new BrowserDetect()).browser;
	if( browser == "Chrome" || browser == "Firefox" || browser == "Safari" || browser == "Opera" || browser == "Explorer" ){
	      save = Util.getString('downloadSave') + " <strong>" + Util.getString(browser+'Download') + "</strong>";
	}
	else {
	      save = Util.getString('DefaultDownload');
	}
	contentDiv.append( "<p>1. <strong>" + Util.getString('save') + "</strong>: <br>" + save + "</p>" );
  	var downloadCenter = "<a href='"+url+"'><div class='teiThumbnail'/></a>";
	contentDiv.append("<p style='text-align:center;'>"+downloadCenter+"</p>");
	var open = Util.getString('open');
	var open2 = Util.getString('downloadOpen');
	var link = "<a href='"+url+"' target='_blank'>" + Util.getString('here') + "</a>";
	contentDiv.append( "<p>2. <strong>" + open + "</strong>: <br>" + open2 + " <strong>" + link + "</strong> ...</p>" );
	return contentDiv;
};
