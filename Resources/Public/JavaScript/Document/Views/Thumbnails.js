/**
 * Creates an instance of the Thumbnails View
 *
 * @constructor
 * @this {Thumbnails}
 * @param {Document} document The document to be shown in the Thumbnails view.
 * @param {DIV} container The conatiner div for the Thumbnails view.
 * @param {DocumentDialog} parent The parent document dialog.
 */
Thumbnails = function(document, container, parent) {
	this.type = "thumbnails";
	this.path = document.imagePath;
	this.images = document.images;
	this.container = container;
	this.parent = parent;
}

/**
 * Displays the thumbnails of the document using the lazy loader. A click on an image switches to the Image view of the specific page.
 *
 * @this {Thumbnails}
 */
Thumbnails.prototype.display = function() {
	var doc = this;
	var thumbnails = [];
	var appendClickFunction = function(image, page) {
		image.click(function() {
			doc.parent.page = page;
			doc.parent.setDocType('images');
		});
	}
	$.each(this.images, function(i, image) {
		var thumbDiv = $("<div/>").appendTo(doc.container);
		thumbDiv.addClass("dummyThumb");
		var thumbnail = $("<img class='thumbnail loadme lazy' src='ropen/Resources/Public/Images/dummy.png' data-original='" + doc.path + "120/" + image + "'/>").appendTo(thumbDiv);
		thumbnail.css('height', thumbDiv.height() + 'px');
		thumbnail.css('width', thumbDiv.width() + 'px');
		appendClickFunction(thumbDiv, i + 1);
	});

	$("img.lazy").lazyload();
};

/**
 * Resizes the Thumbnails view. No common resize in performed, the resize just triggers a scroll event on the images to load possibly emerged thumbnails.
 *
 * @this {Thumbnails}
 */
Thumbnails.prototype.resize = function() {
	$('img.loadme').trigger('scroll');
};
