Threesixty.prototype.layout = function(){
  //resize container
  this.$el.width(this.width);
  this.$el.height(this.height);

  this._$canvas.width(this.width);
  this._$canvas.height(this.height);

  if(this.renderMeta.hasOwnProperty('HD')){
    if(this.renderMeta.HD.hasOwnProperty('width')){
      this._$canvas.attr('width', this.renderMeta.HD.width);
    }

    if(this.renderMeta.HD.hasOwnProperty('height')){
      this._$canvas.attr('height', this.renderMeta.HD.height);
    }
  } else {
    this._$canvas.attr('width', this.width);
    this._$canvas.attr('height', this.height);
  }

  //set container background
  this.$el.css('background', this.bgColor);

  //set container position
  this.$el.css('position', 'relative');

  //set container overflow
  this.$el.css('overflow', 'hidden');
}
