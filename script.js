const apikey = "88811b01c2a5a564c01a85f859ac4dc8";

function flickr_image_url(params) {
  return `https://farm${params.farm}.staticflickr.com/${params.server}/${params.id}_${params.secret}_m.jpg`;
}

function flickr_get_sizes(id) {
  var api = "https://api.flickr.com/services/rest/?method=flickr.photos.getSizes";
  api += `&api_key=${apikey}&photo_id=${id}&format=json&nojsoncallback=1`;
  return new Promise((resolve) => {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", api);
    xhr.addEventListener("load", e => {
      resolve(JSON.parse(xhr.responseText));
    });
    xhr.send();
  });
}

function flickr_search_images(tags) {
  var tag = encodeURIComponent(tags.join(","));
  var number = 20;
  var sort = "date-taken-desc";
  var api = "https://api.flickr.com/services/rest/?method=flickr.photos.search";
  api += `&api_key=${apikey}&tags=${tag}&per_page=${number}&sort=${sort}&format=json&nojsoncallback=1`;
  return new Promise((resolve) => {
    var xhr = new XMLHttpRequest();
    xhr.open("GET", api);
    xhr.addEventListener("load", e => {
      resolve(JSON.parse(xhr.responseText));
    });
    xhr.send();
  });
}

function append_images_from_flickr(flickr) {
  var photos = flickr.photos.photo;
  var div = document.createElement("div");
  div.classList.add('grid');
  photos.forEach((photo) => {
    flickr_get_sizes(photo.id).then((aPhoto) => {
      var target = aPhoto.sizes.size[4];
      var img = document.createElement("img");
      img.setAttribute("alt", photo.title);
      img.setAttribute("src", target.source);
      img.setAttribute("data-width", target.width);
      img.setAttribute("data-height", target.height);
      div.appendChild(img);
      //XXX shouldn't call here
      calculateLayout(250);
    });
  });
  document.body.appendChild(div);
}

window.addEventListener('load', () => {
  flickr_search_images(['mozfest', '#MozFest']).then((flickr) => {
    append_images_from_flickr(flickr);
  });
});
