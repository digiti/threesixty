Threesixty.prototype.create = function(){
  //clear container
  this.$el.html('');

  //create canvas
  this._canvas = document.createElement("canvas");
  this._$canvas = $(this._canvas);
  this._$canvas.addClass('threesixty-canvas');
  this.$el.append(this._$canvas);

  //get canvas context
  this._context = this._canvas.getContext("2d");

  //create loader bar
  this._$loader = $(document.createElement("div"));
  this._$loader.addClass('threesixty-loader-bar');
  this._$loader.width('0px');
  this._$loader.height('3px');
  this._$loader.css('background', '#ff5c5c');
  this._$loader.css('position', 'absolute');
  this._$loader.css('top', '0px');
  this._$loader.css('left', '0px');
  this.$el.append(this._$loader);

  window.addEventListener("touchmove", function(event) {
    if (event.target.classList.contains('threesixty-canvas')) {
      // no more scrolling
      event.preventDefault();
    }
  }, false);
}
