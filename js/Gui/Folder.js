/**
 * Implements a folder to open different document in tabs.
 *
 * @constructor
 * @this {Folder}
 */
Folder = function(index){
	this.nameId = index;
	this.index = index;
	this.documents = [];
	this.documentDialogs = [];
	this.tabData = [];
	this.selection = 0;
}

/**
 * Initializes the content window by defining HTML containers.
 *
 * @this {Folder}
 */
Folder.prototype.initialize = function(){
	this.tabs = $("<ul class='tabs'/>").appendTo(this.content);
	this.documentDiv = $("<div class='inner'/>").appendTo(this.content);
	$(this.label).html(this.getName());
};

/**
 * Update this folder name (id) after another folder was removed.
 *
 * @this {Folder}
 * @param {number} index The new index of the folder.
 */
Folder.prototype.updateName = function(index){
	if( this.nameId != index ){
		this.nameId = index;
		$(this.label).html(this.getName());
	}
};

/**
 * Getter for the folder's name which is substituted of a 'Folder'-String + index.
 *
 * @this {Folder}
 * @return {string} The folders name.
 */
Folder.prototype.getName = function(){
	return Util.getString('folder')+" #"+this.nameId;
};

/**
 * Resizes the folder and all containing document dialogs.
 *
 * @this {Folder}
 */
Folder.prototype.resizeContent = function(){
	var cw = this;
	var padding = parseInt($(cw.documentDiv).css("padding-bottom"))+parseInt($(cw.documentDiv).css("padding-top"));
	$(this.documentDiv).css('height',(this.content.height()-this.tabs.height()-padding)+'px');
	var padding = parseInt($(cw.documentDiv).css("padding-bottom"))+parseInt($(cw.documentDiv).css("padding-top"));
	$.each(this.tabData,function(i,div){
		div.tabDiv.css('height',(cw.content.height()-cw.tabs.height()-padding)+'px');
	});
	var dialog = this.dialog();
	if( dialog != null ){
		dialog.resize();
	}
};

/**
 * Getter for the document dialog of the activated tab.
 *
 * @this {Folder}
 * @return {string} The actually displayed document dialog or null if there are no tabs opened.
 */
Folder.prototype.dialog = function(){
	if( this.documentDialogs.length > 0 ){
		return this.documentDialogs[ this.selection ];
	}
	return null;
};

/**
 * Displays a specific tab.
 *
 * @this {Folder}
 * @param {JSON} tab The tab data consists of divs for tab and content.
 */
Folder.prototype.selectTab = function(tab){
	if( typeof tab.tab != 'undefined' ){
		for( var i in this.tabData ){
			if( this.tabData[i] != tab ){
				$(this.tabData[i].tabDiv).css('display','none');
				$(this.tabData[i].tab).removeClass('selected');
			}
			else {
				this.selection = i;
				$(this.tabData[i].tabDiv).css('display','block');
				$(this.tabData[i].tab).addClass('selected');
			}
		}
	}
	else if( tab < this.tabData.length ){
		this.selection = tab;
		for( var i=0; i<this.tabData.length; i++ ){
			$(this.tabData[i].tabDiv).css('display','none');
			$(this.tabData[i].tab).removeClass('selected');
		}
		$(this.tabData[tab].tabDiv).css('display','block');
		$(this.tabData[tab].tab).addClass('selected');
	}
	this.resizeContent();
};

/**
 * Adds a new tab for a given document, optionally, a start page, a document type and/or a (fulltext) position are given
 *
 * @this {Folder}
 * @param {JSON} data It consists of the document and optional information (page, document type, fulltext position).
 */
Folder.prototype.addTab = function(data){
	var container = this;
	this.documents.push(data.document);
	var tab = $("<li/>").appendTo(this.tabs);
	var tabLink = $("<a>"+data.document.nameShort+"</a>").appendTo(tab);
	var tabClose = $("<img src='img/edition-window-tab-close-active.png'/>").appendTo(tab);
	var tabDiv = $("<div/>").appendTo(this.documentDiv);
	var tabData = {
		tab: tab,
		tabDiv: tabDiv
	};
	this.tabData.push(tabData);
	$(tabLink).click(function(){
		container.selectTab(tabData);
	});
	$(tabClose).click(function(){
		container.removeTab(tabData);
	});
	var padding = parseInt($(this.documentDiv).css("padding-bottom"))+parseInt($(this.documentDiv).css("padding-top"));
	tabDiv.css('height',(this.content.height()-this.tabs.height()-padding)+'px');
	var documentDialog = new DocumentDialog(this,data.document,tabDiv,data.page,data.position);
	documentDialog.activateFacet(data.entity);
	documentDialog.setDocType(data.type,data.position);
	this.documentDialogs.push(documentDialog);
	this.selectTab(tabData);
	this.resizeContent();
};

/**
 * Stops processing of the actual shown tab (if ESC was pressed).
 *
 * @this {Folder}
 */
Folder.prototype.stopProcessing = function(){
	var dialog = this.dialog();
	if( dialog != null ){
		dialog.stopProcessing();
	}
};

/**
 * Removes a tab from the folder.
 *
 * @this {Folder}
 * @param {JSON} tab The tab to remove.
 */
Folder.prototype.removeTab = function(tab){
	for( var i in this.tabData ){
		if( this.tabData[i] == tab ){
			$(this.tabData[i].tabDiv).remove();
			$(this.tabData[i].tab).remove();
			this.documents.splice(i,1);
			this.documentDialogs.splice(i,1);
			this.tabData.splice(i,1);
			break;
		}
	}
	if( this.tabData.length > 0 ){
		this.selectTab(this.tabData[0]);
	}
	else {
		this.resize();
	}
};

/**
 * Getter for the current selected tab index (required for constructing magnetic links).
 *
 * @this {Folder}
 * @return {number} The current tab index.
 */
Folder.prototype.getSelectedTab = function(){
	return this.selection;
};

/**
 * Setter to select a specific tab (required for utilizing magnetic links).
 *
 * @this {Folder}
 * @param {number} index The index of the tab to be shown.
 */
Folder.prototype.setSelectedTab = function(index){
	this.selectTab(index);
};
