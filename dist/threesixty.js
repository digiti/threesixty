(function(root, undefined) {

  "use strict";


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


Threesixty.prototype.load = function(options){
  //overwrite loader
  this.renderMeta = {};

  //catch options if present
  options = options || {};

  var _defaults = {
    //specifies how many rotations per row
    rows: 1,
    //loop horrizontaly
    loopX: true,
    //loop vertically
    loopY: false,
    //animation speed while in play modus
    speed: 1,
    //animation easing while interacting
    easing: 0.5,
    //turn to false when only preloading.
    renderAfterLoad: true,
    //auto start after ready status 1 (when first row is loaded)
    startOnStatus: 1,
    //startRow (first loaded row)
    startRow: -1,

    normal: {
      //urls to the sequence images
      sources: [],
      width: 640,
      height: 480
    },

    HD: {
      //urls to the sequence images.
      sources: [],
      width: 1280,
      height: 960
    }
  };

  //fill blank mandatory default properties
  for (var d in _defaults) {
    options[d] = options[d] || _defaults[d];
  }

  //validate type of properties
  var p = this;
  for (var key in _defaults) {
    if(typeof(_defaults[key])==typeof(options[key])){
      p.renderMeta[key] = options[key];
    } else {
      console.warn('Threesixty: load option ' + key + ' must be of type ' + typeof(_defaults[key]));
    }
  }

  if(this.renderMeta.renderAfterLoad){
    this.layout();
  }

  this.frames = [];

  var sources = this.renderMeta.normal.sources;
  var rowsCount = this.renderMeta.rows;
  var perRow = Math.floor(sources.length / rowsCount);

  this.renderMeta.perRow = perRow;

  for (var i = 0; i < this.renderMeta.rows; i++) {
    this.frames.push([]);
    for (var j = perRow - 1; j >= 0; j--) {
       this.frames[i].push(null);
    }
  };

  if(this.renderMeta.startRow==-1){
    this.renderMeta.startRow = Math.floor(rowsCount/2);
  }

  var that = this;
  this.loadRow({
    row:that.renderMeta.startRow,
    render:true,
    onFrame:function(e){
      var perc = e.frame / perRow;
      var loaderwidth = perc*that.width;

      that._$loader.width(loaderwidth);
    },
    onComplete:function(e){
      that._$loader.width(0);
      that.ready = 1;
      if(rowsCount>1){
        if(that.renderMeta.startOnStatus==1) {
          that.renderer();
        }
        loadAllFrames(e);
      } else {
        that.renderer();
      }
    }
  });

  function loadAllFrames(event){
    var rowLoaded = 0;

    var loadOtherRow = function(){
        that.loadRow({
          row: rowLoaded,
          render:false,
          onFrame: function(e){
            var perc =  (e.frame + (perRow*e.row)) / (perRow*rowsCount);
            var loaderwidth = perc*that.width;
            that._$loader.width(loaderwidth);
          },
          onComplete: function(){
            if(rowLoaded<rowsCount-1){

              rowLoaded++;
              loadOtherRow();
            } else {
              that.ready = 2;
              that._$loader.width(0);

              if(that.renderMeta.startOnStatus==2) {
                that.renderer();
              }
            }
          }
        });
    }

    loadOtherRow();
  }
}

Threesixty.prototype.loadRow = function(options){
  var sources = this.renderMeta.normal.sources;
  var rowsCount = this.renderMeta.rows;
  var perRow = Math.floor(sources.length / rowsCount);

  var startIndex = options.row * perRow;
  var endIndex = startIndex + perRow-1;
  var currentLoad = startIndex;

  var needsLoading = false;
  for (var i = perRow -1; i >= 0; i--) {
    var slot = this.frames[options.row][i];
    if(slot === null){
      needsLoading = true;
    }
  };

  var that = this;
  if(needsLoading==true){
    var normal = that.renderMeta.normal;
    var HD = that.renderMeta.HD;
    var preload = function() {
      var asset = document.createElement("img");
      asset.onload = function() {
        var rowID = options.row;
        var rowFrame = currentLoad - (perRow*rowID);

        if(that.frames[rowID][rowFrame]==null){
          that.frames[rowID][rowFrame] = this;
        }

        currentLoad++;

        if(options.render==true){

          that._context.globalAlpha = 1;
          that._context.clearRect( 0, 0, that.width, that.height );
          that._context.drawImage(this, 0, 0, normal.width, normal.height, 0, 0, that._canvas.width, that._canvas.height);

          if(currentLoad <= endIndex) {
            that._context.globalAlpha = 0.8;

            that._context.beginPath();
            that._context.rect(0,0,that._canvas.width,that._canvas.height);
            that._context.fillStyle = '#000000';
            that._context.fill();
          }
        }

        if(currentLoad > endIndex) {
          //loading finished!

          if(options.hasOwnProperty('onComplete')) {
            var rowFrame = currentLoad - (perRow*rowID) -1;
            options.onComplete({row:options.row,frame:rowFrame});
          }

          currentLoad = undefined;
        } else {
          //loading unfinished.
          if(options.hasOwnProperty('onFrame')) {
            var rowFrame = currentLoad - (perRow*rowID) - 1;
            options.onFrame({row:options.row,frame:rowFrame});
          }

          preload();
        }
      }

      // Set asset-to-load source path.
      asset.src = sources[currentLoad];
    }

    //next frame
    preload();
  } else {
    if(that.renderMeta.startRow!==options.row){
      console.warn('Threesixty: loader row ' + options.row + ' is already loaded.');
    }
    if(options.hasOwnProperty('onComplete')) {
      options.onComplete({row:options.row,frame:perRow -1});
    }
  }
}


/*
Threesixty.prototype.getRow = function(index){
  var perRow = this.perRow;
  var rowsCount = Math.round(this.source.length/perRow);
  var result = [];

  if(index<rowsCount-1){
    result = this.source.slice(index*perRow, (index*perRow)+perRow);
  }

  return result;
}
*/


Threesixty.prototype.renderer = function(){
  var that = this;
  var meta = that.renderMeta;
  var normal = meta.normal;
  var HD = meta.HD;

  meta.currentFrame = 0;
  meta.currentRow = 0;
  meta.interactions = {
    isDragging: false,
    startFrame: null,
    startRow: null,
    dragPosition: null,
    targetFrame: null,
    targetRow: null
  }

  this.findFrame = function(row, frame) {
    if(row!==meta.currentRow || frame!==meta.currentFrame){
      meta.currentRow = row;
      meta.currentFrame = frame;

      var img = that.frames[row][frame];
      window.requestAnimationFrame(function(){
        that._context.clearRect( 0, 0, that._canvas.width, that._canvas.height);
        that._context.drawImage(img, 0, 0, normal.width, normal.height, 0, 0, that._canvas.width, that._canvas.height);
      });
    }
  }

  /*
  this.framer = function(){
    window.requestAnimationFrame(function(){

      var frame = meta.interactions.targetFrame - meta.currentFrame;

      //console.log(frame);


      that.framer();
    });
  }

  that.framer();
  */

  var enableInteraction = function(){
    //mouse down
    that.$el.mousedown(function(e) {
      down({x: e.pageX, y: e.pageY});
    });

    //mouse move
    $(window).mousemove(function(e) {
      if(meta.interactions.isDragging==true){
        move({x: e.pageX, y: e.pageY});
      }
    });

    //mouse up
    $(window).mouseup(up);

    //touch start
    that.$el.bind('touchstart', function(e) {
      e.preventDefault();
      down({
        x: e.originalEvent.touches[0].pageX,
        y: e.originalEvent.touches[0].pageY
      });
    });

    //touch move
    that.$el.bind('touchmove', function(e) {
      e.preventDefault();
      if(meta.interactions.isDragging==true){
        move({
          x: e.originalEvent.touches[0].pageX,
          y: e.originalEvent.touches[0].pageY
        });
      }
    });

    //touch end
    $(window).bind('touchend', function(e) {
      e.preventDefault();
      up(e);
    });

    //on interaction down
    function down(param) {
      meta.interactions.dragPosition = param;
      meta.interactions.startFrame = meta.currentFrame;
      meta.interactions.startRow = meta.currentRow;
      meta.interactions.isDragging = true;
    }

    //on interaction move
    function move(param) {
      var newRow = meta.currentRow;

      if(that.ready==2 && that.frames.length>1){
        //calculate offset in rows and track infinitife rotation on y
        var diffY = Math.round((param.y - meta.interactions.dragPosition.y)/60)*-1;
        newRow = meta.interactions.startRow + diffY;
        var extraYRotations = newRow/that.frames.length;

        //round extraYRotations to correct side
        if(extraYRotations>0){
          extraYRotations = Math.floor(extraYRotations);
        } else {
          extraYRotations = Math.floor(extraYRotations);
        }

        //fix infinitife rotation gap
        newRow += that.frames.length*(extraYRotations*-1);
      }

      //console.log(param.x - meta.interactions.dragPosition.x);


      //calculate offset in frames and track infinitife rotation on x
      var diffX = Math.round((param.x - meta.interactions.dragPosition.x)/30);
      var newFrame = meta.interactions.startFrame + diffX;
      var extraXRotations = newFrame/meta.perRow;

      //round extraXRotations to correct side
      if(extraXRotations>0){
        extraXRotations = Math.floor(extraXRotations);
      } else {
        extraXRotations = Math.floor(extraXRotations);
      }

      //fix infinitife rotation gap
      newFrame += meta.perRow*(extraXRotations*-1);

      //meta.interactions.targetFrame = newFrame;
      //meta.interactions.targetRow = newRow;
      that.findFrame(newRow, newFrame);
    }

    //on interaction up
    function up(param) {
      meta.interactions.isDragging = false;
    }
  }

  // Animate the element's value from 0% to 110%:
  $({introFrame: 0}).animate({introFrame: meta.perRow}, {
    duration: 1500,
    easing:'easeOutCubic', // can be anything
    step: function() { // called on every step
      that.findFrame(that.renderMeta.startRow,Math.floor(this.introFrame));
    },
    complete: function(){
      enableInteraction();
    }
  });
}


// Version.
Threesixty.VERSION = '0.1.0';

// Export to the root, which is probably `window`.
root.Threesixty = Threesixty;

}(this));
