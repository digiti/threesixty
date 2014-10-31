// Base function.
var Threesixty = function(options) {
  /*jslint browser:true */

  //catch options if present
  options = options || {};
  //fill blank mandatory default properties
  for (var d in this._defaults) {
    options[d] = options[d] || this._defaults[d];
  }
  //validate type of properties
  var p = this;
  for (var key in this._defaults) {
    if(typeof(this._defaults[key])==typeof(options[key])){
      p[key] = options[key];
    } else {
      console.warn('Threesixty: constructor option ' + key + ' must be of type ' + typeof(this._defaults[key]));
    }
  }

  if(!this.$el) {
    this.$el = $(document.createElement("div"));
    this.$el.addClass('threesixty');
    $('body').append(this.$el);
  }

  this.create();
  this.layout();
};

Threesixty.prototype._defaults = {
  $el: null,
  width: 640,
  height: 480,

  ready: 0,
  renderMeta: {
    normal: {
      width: 640,
      height: 480
    },
    HD: {
      width: 1280,
      height: 960
    }
  }
};
