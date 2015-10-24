// ref: http://blog.vjeux.com/wp-content/uploads/2012/05/google-layout.html

HEIGHTS = [];

function getHeight(images, width) {
  width -= images.length * 5;
  var h = 0;
  for (var i = 0; i < images.length; ++i) {
    h += $(images[i]).data('width') / $(images[i]).data('height');
  }
  return width / h;
}

function setHeight(images, height) {
  HEIGHTS.push(height);
  for (var i = 0; i < images.length; ++i) {
    $(images[i]).css({
      width: height * $(images[i]).data('width') / $(images[i]).data('height'),
      height: height
    });
  }
}

function calculateLayout(max_height) {
  var windowWidth = window.innerWidth - 50;

  var n = 0;
  var images = $('img');
  w: while (images.length > 0) {
    for (var i = 1; i < images.length + 1; ++i) {
      var slice = images.slice(0, i);
      var h = getHeight(slice, windowWidth);
      if (h < max_height) {
        setHeight(slice, h);
        n++;
        images = images.slice(i);
        continue w;
      }
    }
    setHeight(slice, Math.min(max_height, h));
    n++;
    break;
  }
}
