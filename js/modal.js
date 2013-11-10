$(window).load(modalSize);
$(window).resize(modalSize);

function modalSize() {

  var maxHeight = $(window).height() - 60;
  var maxWidth = $(window).width() - 60;

  $('.md-content').find('img').each(function() {

    // Get on screen image
    var screenImage = $(this);

    // Create new offscreen image to test
    var theImage = new Image();
    theImage.src = screenImage.attr("src");

    // Get accurate measurements from that.
    var imageWidth = theImage.width;
    var imageHeight = theImage.height;


    if (this.width/this.height < maxWidth/maxHeight) {
      $(this).css('height', Math.min(maxHeight, imageHeight) + "px");
      $(this).css('width','auto');
    } else {
      $(this).css('width', Math.min(maxWidth, imageWidth) + "px");
      $(this).css('height','auto');
    }
  })
};