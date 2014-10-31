Threesixty.prototype.layout = function(){
  //resize container
  this.$el.width(this.width);
  this.$el.height(this.height);

  this._$canvas.width(this.width);
  this._$canvas.height(this.height);

  this._$canvas.attr('width', this.renderMeta.HD.width);
  this._$canvas.attr('height', this.renderMeta.HD.height);

  //set container background
  this.$el.css('background', '#000000');

  //set container position
  this.$el.css('position', 'relative');

  //set container overflow
  this.$el.css('overflow', 'hidden');
}
