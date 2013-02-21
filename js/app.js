requirejs.config({
					 shim: {
						 'EditionGui': {
							 //These script dependencies should be loaded before loading
							 //backbone.js
							 deps: [
								 'Config/EditionProperties',
								 'Config/EditionTooltips',
								 'System/DocumentServerConnection',
								 'System/Util',
								 'System/BrowserDetect',
								 'Processors/TEIProcessor',
								'Processors/XHTMLProcessor',
								'Processors/LinkProcessor',
								'Gui/Pagination',
								'Gui/FacetSelector',
								'Document/Document',
								'Document/Views/Text',
								'Document/Views/Images',
								'Document/Views/Pages',
								'Document/Views/Outline',
								'Document/Views/TEI',
								'Document/Views/Thumbnails',
								'Document/Views/Places',
								'Document/Views/Tags',
								'Gui/FrameWindow',
								'Gui/Folder',
								'Gui/HyperlinkWindow',
								'Gui/Browser',
								'Gui/DocumentDialog',
								'Gui/OverlayWindow',
								'Gui/Tooltip'
							 ]
						 }
					 }
				 });

require(["EditionGui"], function() {
	EditionGui.initialize();
});