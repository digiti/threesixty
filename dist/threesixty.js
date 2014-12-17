// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik MÃ¶ller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function() {
    var lastTime = 0;
    var vendors = ['ms', 'moz', 'webkit', 'o'];
    for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
        window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
        window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] 
                                   || window[vendors[x]+'CancelRequestAnimationFrame'];
    }
 
    if (!window.requestAnimationFrame)
        window.requestAnimationFrame = function(callback, element) {
            var currTime = new Date().getTime();
            var timeToCall = Math.max(0, 16 - (currTime - lastTime));
            var id = window.setTimeout(function() { callback(currTime + timeToCall); }, 
              timeToCall);
            lastTime = currTime + timeToCall;
            return id;
        };
 
    if (!window.cancelAnimationFrame)
        window.cancelAnimationFrame = function(id) {
            clearTimeout(id);
        };
}());

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
    //turn to false to wait for it ...
    loadAfterinit: true,
    //auto start after ready status 1 (when first row is loaded)
    startOnStatus: 1,
    //startRow (first loaded row)
    startRow: -1,
    //init swoosh after first row is completed
    swoosh: true,
    //Start auto rotating when load is finished.
    //This automatically disables/overwrites the swoosh property to false.
    autoRotate: false,
    //The time the autoRotation needs to completely spin 1 row.
    rotationTime: 5000,

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

    if(options.hasOwnProperty(d)){
       options[d] = options[d];
    } else {
       options[d] =  _defaults[d];
    }
  }

  //Overwrite swoosh on autoRotate
  if(options.autoRotate==true){
    options.swoosh = false;
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

  if(this.renderMeta.loadAfterinit){
    this.show();
  }
}

Threesixty.prototype.show = function(){
  this.layout();

  this.frames = [];
  this.HDframes = [];

  var sources = this.renderMeta.normal.sources;
  var hdSources = this.renderMeta.HD.sources;

  var addHD = false;
  if(hdSources && hdSources.length>0 && sources.length == hdSources.length){
    addHD = true;
  }

  var rowsCount = this.renderMeta.rows;
  var perRow = Math.floor(sources.length / rowsCount);

  this.renderMeta.perRow = perRow;

  for (var i = 0; i < this.renderMeta.rows; i++) {
    this.frames.push([]);
    this.HDframes.push([]);
    for (var j = perRow - 1; j >= 0; j--) {
       this.frames[i].push(null);

       if(addHD===true){
        var hdFrame = hdSources[((perRow-j-1) + (perRow*i))];
        this.HDframes[i].push(hdFrame);
       }
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

        //Call onFirstRowLoaded for the first loaded row.
        if(that.hasOwnProperty('onFirstRowLoaded')) {
          that.onFirstRowLoaded({
            row: that.renderMeta.startRow
          });
        }

        //Also Call onRowLoaded for the first loaded row.
        if(that.hasOwnProperty('onRowLoaded')) {
          that.onRowLoaded({
            row: that.renderMeta.startRow
          });
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
              //Call onRowLoaded for this loaded row.
              if(that.hasOwnProperty('onRowLoaded')) {
                if(that.renderMeta.startRow!==rowLoaded){
                  that.onRowLoaded({
                    row: rowLoaded
                  });
                }
              }

              rowLoaded++;
              loadOtherRow();
            } else {
              that.ready = 2;
              that._$loader.width(0);

              if(that.renderMeta.startOnStatus==2) {
                that.renderer();
              }

              if(that.hasOwnProperty('onRowLoaded')) {
                that.onRowLoaded({
                  row: rowLoaded
                });
              }

              //Call onComplete for all rows loaded.
              if(that.hasOwnProperty('onComplete')) {
                that.onComplete();
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

  meta.currentRow = meta.startRow;
  meta.currentFrame = 0;

  meta.currentZoom = 1;
  meta.interactions = {
    enabled: false,
    isDragging: false,
    startFrame: null,
    startRow: null,
    dragPosition: null,
    targetFrame: null,
    targetRow: null,
    startZoom: 1,
    initHD: false
  }

  meta.rotation = {
    isPlaying: false,
    frame: 0
  }

  this.findFrame = function(options) {
    if(options.row!==meta.currentRow || options.frame!==meta.currentFrame){
      //console.log('rendering Row:' + options.row + ' & frame:' + options.frame);

      meta.currentRow = options.row;
      meta.currentFrame = options.frame;

      var img = that.frames[options.row][options.frame];

      var drawFrame = function(){
        that._context.clearRect( 0, 0, that._canvas.width, that._canvas.height);
        that._context.drawImage(img, 0, 0, normal.width, normal.height, 0, 0, that._canvas.width, that._canvas.height);
      }

      if(window.requestAnimationFrame){
        window.requestAnimationFrame(drawFrame);
      } else {
        setTimeout(drawFrame, 16);
      }
    }
  }

  this.drawHDFrame = function() {
    var imgSrc = that.HDframes[meta.currentRow][meta.currentFrame];

    if(imgSrc!==undefined && imgSrc!==null){
      that.lastHDimg = document.createElement("img");
      that.lastHDimg.onload = function() {
        that._context.clearRect( 0, 0, that._canvas.width, that._canvas.height);
        that._context.drawImage(that.lastHDimg, 0, 0, HD.width, HD.height, 0, 0, that._canvas.width, that._canvas.height);
      }

      that.lastHDimg.src = imgSrc;

      if(meta.interactions.initHD==false){
        meta.interactions.initHD = true;
      }
    }
  }

  this.swoosh = function(callback){
    meta.rotation = {frame: 0,isPlaying: false}

    $(meta.rotation).animate({frame: meta.perRow}, {
      duration: 1300,
      easing:'easeOutCubic', // can be anything
      step: function() { // called on every step
        that.findFrame({row: that.renderMeta.startRow, frame: Math.floor(this.frame)});
      }, complete: function(){
        that.enableInteraction();
      }
    });
  }

  this.autoRotate = function(callback){
    if(meta.rotation.isPlaying==false){
      meta.rotation.isPlaying = true;
      meta.rotation.frame = 0;

      $(meta.rotation).stop().animate({frame: meta.perRow}, {
        duration: meta.rotationTime,
        easing:'linear',
        step: function() { // called on every step
          meta.rotation.isPlaying = true;
          that.findFrame({row: that.renderMeta.startRow, frame: Math.floor(meta.rotation.frame)});
        },
        complete: function(){
          meta.rotation.isPlaying = false;
          that.autoRotate();
        }
      });

      that.enableInteraction();

      if(callback)
        callback(); 
    }
  }

  this.stopAutoRotate = function(callback){
    $(meta.rotation).stop();
    meta.rotation.isPlaying = false;

    if(callback)
      callback(); 
  }

  this.enableInteraction = function(){
    if(meta.interactions.enabled==false){
      meta.interactions.enabled = true;

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

        var touches = e.originalEvent.touches;
        if(meta.interactions.isDragging==true && touches.length<=1){
          move({
            x: touches[0].pageX,
            y: touches[0].pageY
          });
        }
      });

      //touch end
      $(window).bind('touchend', function(e) {
        e.preventDefault();
        up(e);
      });

      that.$el.bind('gesturestart', function(e) {
        e.preventDefault();
        meta.interactions.startZoom = meta.currentZoom;
      });

      that.$el.bind('gesturechange', function(e) {
        e.preventDefault();
        var zoom = meta.interactions.startZoom +  ((-1+e.originalEvent.scale)*meta.interactions.startZoom);

        if(zoom){
          applyZoom(zoom);
        }
      });

      that.$el.on('mousewheel', function(e) {
        e.preventDefault();
        var scrollSpeed = e.originalEvent.deltaY;
        var direction = Math.abs(scrollSpeed)/scrollSpeed;

        if(direction){
          applyZoom(meta.currentZoom + (direction/50));
        }
      });
    }

    function applyZoom(zoom){
      if(meta.interactions.initHD==false){
        that.drawHDFrame();
      }

      if(meta.rotation.hasOwnProperty('isPlaying') && 
        meta.rotation.isPlaying==true){
        that.stopAutoRotate();
      }

      meta.currentZoom = zoom;

      var maxZoom = HD.width/normal.width;

      if(zoom<1){
        meta.currentZoom = 1;
      } else if(zoom>maxZoom){
        meta.currentZoom = maxZoom;
      }

      that._$canvas.css('transform', 'matrix('+meta.currentZoom+', 0, 0, '+meta.currentZoom+', 0, 0)');
    }

    //on interaction down
    function down(param) {
      if(meta.rotation.hasOwnProperty('isPlaying') && 
        meta.rotation.isPlaying==true){
        that.stopAutoRotate();
      }

      meta.interactions.dragPosition = param;
      meta.interactions.startFrame = meta.currentFrame;
      meta.interactions.startRow = meta.currentRow;
      meta.interactions.isDragging = true;

      if(that.lastHDimg){
        that.lastHDimg.onload = null;
      }
    }

    //on interaction move
    function move(param) {
      //if view is completely zoomed out,
      //apply rotate functionality
      //if(meta.currentZoom<1.2){

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
          if(meta.loopY){
            newRow += that.frames.length*(extraYRotations*-1);
          } else {
            if(extraYRotations<0){
              newRow = 0;
            } else if(extraYRotations>0){
              newRow = that.frames.length-1;
            }
          }
        }

        //calculate offset in frames and track infinitife rotation on x
        var diffX = Math.round((param.x - meta.interactions.dragPosition.x)/20);
        var newFrame = meta.interactions.startFrame + diffX;
        var extraXRotations = newFrame/meta.perRow;

        //round extraXRotations to correct side
        if(extraXRotations>0){
          extraXRotations = Math.floor(extraXRotations);
        } else {
          extraXRotations = Math.floor(extraXRotations);
        }

        //fix infinitife rotation gap
        if(meta.loopX){
          newFrame += meta.perRow*(extraXRotations*-1);
        } else {
          if(extraXRotations<0){
            newFrame = 0;
          } else if(extraXRotations>0){
            newFrame = meta.perRow-1;
          }
        }

        that.findFrame({row: newRow, frame: newFrame});
    }

    //on interaction up
    function up(param) {
      if(meta.interactions.isDragging == true){
        meta.interactions.isDragging = false;
        that.drawHDFrame();
      }
    }
  }

  //First Code to Run
  if(meta.hasOwnProperty('swoosh') && meta.swoosh==true){
    //this.swoosh(enableInteraction);
  } else {
    if(meta.hasOwnProperty('autoRotate') && meta.autoRotate==true){
       //this.autoRotate();
    }

    that.findFrame({row: that.renderMeta.startRow, frame: 0});
    enableInteraction();
  }
}


// Version.
Threesixty.VERSION = '0.1.0';

// Export to the root, which is probably `window`.
root.Threesixty = Threesixty;

}(this));
