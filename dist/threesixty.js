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
  //this.layout();
};

Threesixty.prototype._defaults = {
  $el: null,
  width: 640,
  height: 480,
  bgColor: '#000000',

  ready: 0,
  renderMeta: {
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

  if(this.renderMeta.hasOwnProperty('HD') &&
    this.renderMeta.HD.hasOwnProperty('width') &&
    this.renderMeta.HD.hasOwnProperty('height')){

      this._$canvas.attr('width', this.renderMeta.HD.width);
      this._$canvas.attr('height', this.renderMeta.HD.height);
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


Threesixty.prototype.load = function(options){
  //overwrite loader
  this.renderMeta = {};
  this.loadMeta = {};

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
    //Invert Dragging behavior on X.
    invertX: false,
    //Invert Dragging behavior on Y.
    invertY: false,
    //Manipulate the zoomlevel.
    extraZoom: 0,
    //Show the loading bar by default.
    showDefaultLoading: true,

    normal: {
      //urls to the sequence images
      sources: [],
      width: 640,
      height: 480
    },

    HD: {
      //urls to the sequence images.
      sources: [] //,
      //width: 1280,
      //height: 960
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

  if(!options.normal.width){
    options.normal.width = _defaults.normal.width;
  }

  if(!options.normal.height){
    options.normal.height = _defaults.normal.height;
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

  //console.log('this.renderMeta.HD:');
  //console.log(this.renderMeta.HD);

  if(this.renderMeta.loadAfterinit){
    this.layout();
    this.show();
  }
}

Threesixty.prototype.show = function(){
  this.frames = [];
  this.HDframes = [];

  this.loadMeta.total = 0;
  this.loadMeta.current = 0;

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

       this.loadMeta.total++;

       if(addHD===true){
        var hdFrame = hdSources[((perRow-j-1) + (perRow*i))];
        this.HDframes[i].push(hdFrame);
       }
    }
  };

  if(this.renderMeta.startRow==-1){
    this.renderMeta.startRow = Math.floor(rowsCount/2);
  } else if(this.renderMeta.startRow>=rowsCount){
    this.renderMeta.startRow = rowsCount-1;
  }

  // console.log('loadTotal: ' + this.loadMeta.total);

  var that = this;
  this.loadRow({
    row:that.renderMeta.startRow,
    render:true,
    onFrame:function(e){
      if(that.renderMeta.showDefaultLoading){
        var perc = e.frame / perRow;
        var loaderwidth = perc*that.width;
        that._$loader.width(loaderwidth);
      }
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

        if(that.renderMeta.startRow==(rowsCount-1)){
          //Call onFirstRowLoaded for the first and only loaded row.
          if(that.hasOwnProperty('onFirstRowLoaded')) {
            that.onFirstRowLoaded({
              row: that.renderMeta.startRow
            });
          }

          //Also Call onRowLoaded for the first and only loaded row.
          if(that.hasOwnProperty('onRowLoaded')) {
            that.onRowLoaded({
              row: that.renderMeta.startRow
            });
          }

          //Call onComplete for single row loaded.
          if(that.hasOwnProperty('onComplete')) {
            that.onComplete();
          }
        }
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

            if(that.renderMeta.showDefaultLoading){
              var loaderwidth = perc*that.width;
              that._$loader.width(loaderwidth);
            }
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
  if(this.frames){
    var sources = this.renderMeta.normal.sources;
    var rowsCount = this.renderMeta.rows;
    var perRow = Math.floor(sources.length / rowsCount);

    var startIndex = options.row * perRow;
    var endIndex = startIndex + perRow;
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
          if(that.frames){
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
                that._context.fillStyle = that.bgColor;
                that._context.fill();
              }
            }

            that.loadMeta.current++;

            if(currentLoad >= endIndex) {
              //loading finished!

              if(that.hasOwnProperty('onFrameLoaded')) {
                that.onFrameLoaded({
                  frame: that.loadMeta.current,
                  total: that.loadMeta.total
                });
              }

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

              if(that.hasOwnProperty('onFrameLoaded')) {
                that.onFrameLoaded({
                  frame: that.loadMeta.current,
                  total: that.loadMeta.total
                });
              }

              preload();
            }
          }
        }

        // Set asset-to-load source path.
        if(currentLoad!==undefined){
          asset.src = sources[currentLoad];
        } else {
          if(options.hasOwnProperty('onComplete')) {
            var rowFrame = currentLoad - (perRow*rowID) -1;
            options.onComplete({row:options.row,frame:rowFrame});
          }
        }

      }

      //next frame
      preload();
    } else {
      if(that.renderMeta.startRow!==options.row){
        console.warn('Threesixty: loader row ' + options.row + ' is already loaded.');
      }



      // console.log('no need loading');
      // console.log('perRow: ' + rowsCount);
      // that.loadMeta.current+=rowsCount;


      // if(that.hasOwnProperty('onFrameLoaded')) {
      //   that.onFrameLoaded({
      //     frame: that.that.loadMeta.current
      //     total: that.loadMeta.total
      //   });
      // }



      if(options.hasOwnProperty('onComplete')) {
        options.onComplete({row:options.row,frame:perRow -1});
      }
    }
  }
}

Threesixty.prototype.destroy = function(){
  //stop pending animation
  if(this.hasOwnProperty('stopAutoRotate')){
    this.stopAutoRotate();
  }

  //clean listeners
  if(this.$el){
    this.$el.off();
    // console.log('unchaining listeners');
  }

  //destroy url buckets
  if(this.renderMeta){
    delete this.renderMeta.normal;
    delete this.renderMeta.HD;
    // console.log('unchaining renderMeta');
  }

  //cleanup frames
  if(this.frames){
    for (var i = this.frames.length - 1; i >= 0; i--) {
      var _row = this.frames[i];

      for (var j = _row.length - 1; j >= 0; j--) {
        _row[j] = null;
      };

      _row = null;
    };

    // console.log('unchaining frames');
  }

  if(this.loadRow){
    // console.log('unchaining loadRow');
    delete this.loadRow;
  }

  if(this.hasOwnProperty('onFirstRowLoaded')){
    // console.log('unchaining onFirstRowLoaded');
    delete this.onFirstRowLoaded;
  }

  if(this.hasOwnProperty('onRowLoaded')){
    // console.log('unchaining onRowLoaded');
    delete this.onRowLoaded;
  }

  if(this.hasOwnProperty('onFrameLoaded')){
    // console.log('unchaining onFrameLoaded');
    delete this.onFrameLoaded;
  }

  if(this.hasOwnProperty('onComplete')){
    // console.log('unchaining onComplete');
    delete this.onComplete;
  }

  var that = this;
  for (var prop in that) {
    if (that.hasOwnProperty(prop)) {
      delete that[prop];
      // console.log('delete property ' + prop);
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
  meta.currentZoom = 0;

  meta.interactions = {
    enabled: false,
    isDragging: false,
    startFrame: null,
    startRow: null,
    dragPosition: null,
    targetFrame: null,
    targetRow: null,
    startZoom: 0,
    startDistance: 0,
    zoom: 1,
    initHD: false
  }

  meta.rotation = {
    isPlaying: false,
    frame: 0
  }

  this.findFrame = function(options) {
    if(options.row!==meta.currentRow || options.frame!==meta.currentFrame){

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
        if(HD.width==undefined || HD.width==0){
          HD.width = this.width;
        }

        if(HD.height==undefined || HD.height==0){
          HD.height = this.height;
        }

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

  this.autoRotate = function(direction){

    var direction = (direction) ? direction : 1;
    var duration = meta.rotationTime;
    var target;

    if(meta.rotation.isPlaying==false){
      meta.rotation.isPlaying = true;

      if(direction==1){
        // meta.rotation.frame = 0;

        if(meta.currentFrame==(meta.perRow-1)){
          meta.rotation.frame = 0;
        } else {
          meta.rotation.frame = meta.currentFrame;

          var diff = meta.perRow - meta.currentFrame;
          var relative = diff/meta.perRow;

          duration *= relative;
        }

        target = meta.perRow;
      } else if(direction==-1){
        // meta.rotation.frame = meta.perRow-1;

        if(meta.currentFrame==0){
          meta.rotation.frame = meta.perRow-1;
        } else {
          meta.rotation.frame = meta.currentFrame;

          var relative = meta.currentFrame/meta.perRow;

          duration *= relative;
        }

        target = 0;
      }



      $(meta.rotation).stop().animate({frame: target}, {
        duration: duration,
        easing:'linear',
        step: function() { // called on every step
          meta.rotation.isPlaying = true;

          var requestedFrame = Math.floor(meta.rotation.frame);
          if(meta.currentFrame!==requestedFrame){
            that.findFrame({row: meta.currentRow, frame:requestedFrame});
          }
        },
        complete: function(){
          meta.rotation.isPlaying = false;
          that.autoRotate(direction);
        }
      });

      that.enableInteraction();
    }
  }

  this.stopAutoRotate = function(callback){
    $(meta.rotation).stop();
    meta.rotation.isPlaying = false;

    if(callback)
      callback();
  }

  this.animatedZoom = function(params){
    var maxZoom = HD.width/normal.width;

    if(params.factor>1){
      params.factor = 1;
    } else if(params.factor<=0){
      params.factor = 0;
    }

    var zoom = params.factor;

    if(!params.duration){
      params.duration = 600;
    }

    if(params.factor!==meta.currentZoom){
      $({factor: meta.currentZoom}).animate({factor: zoom}, {
        duration: params.duration,
        easing:'easeOutCubic',
        step: function() {
          that.applyZoom(this.factor);
        }, complete: function(){
          if(params.callback)
            params.callback();
        }
      });
    }
  }

  this.applyZoom = function(zoom){
    var maxZoom = HD.width/normal.width;

    if(meta.extraZoom!==0){
      maxZoom += meta.extraZoom;
    }

    var zoom = zoom;

    if(meta.interactions.initHD==false){
      that.drawHDFrame();
    }

    if(meta.rotation.hasOwnProperty('isPlaying') &&
      meta.rotation.isPlaying==true){
      that.stopAutoRotate();
    }

    if(zoom<0){
      zoom = 0;
    } else if(zoom>1){
      zoom = 1;
    }

    meta.currentZoom = zoom;

    that._$canvas.css('transform', 'matrix('+ (1+((maxZoom-1)*zoom)) +', 0, 0, '+ (1+((maxZoom-1)*zoom)) +', 0, 0)');
  }

  this.enableInteraction = function(){
    if(meta.interactions.enabled==false){
      meta.interactions.enabled = true;

      //alert('that.drawHDFrame();');
      that.drawHDFrame();

      // mouse down
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
      that.$el.on('touchstart', function(e) {
        e.preventDefault();

        var touches = e.originalEvent.touches;

        down({
          x: touches[0].pageX,
          y: touches[0].pageY
        });

        if(touches.length>1){
          meta.interactions.startDistance = getFingerRangeByTouches(touches);
          meta.interactions.startZoom = meta.currentZoom
          $('#output').html('Startzoom: ' + String(meta.interactions.startZoom));
        }
      });

      //touch move
      that.$el.on('touchmove', function(e) {
        e.preventDefault();

        var touches = e.originalEvent.touches;
        if(meta.interactions.isDragging==true && touches.length==1){
          move({
            x: touches[0].pageX,
            y: touches[0].pageY
          });

        } else if(meta.interactions.isDragging==true && touches.length==2){
          var diff = getFingerRangeByTouches(touches) - meta.interactions.startDistance;

          var zoom = 0;

          zoom = meta.interactions.startZoom + (diff/200);



          $('#output').html('diff: ' + String(diff));

          if(zoom>=0 && zoom<=1){
            that.applyZoom(zoom);
          }
        }
      });

      //touch end
      that.$el.on('touchend', function(e) {
        e.preventDefault();
        up(e);
      });


      // that.$el.on('mousewheel', function(e) {
      //   e.preventDefault();
      //   var scrollSpeed = e.originalEvent.deltaY;
      //   var direction = Math.abs(scrollSpeed)/scrollSpeed;

      //   if(direction){
      //     that.applyZoom(meta.currentZoom + (direction/50));
      //   }
      // });
    }

    function getFingerRangeByTouches(touches){
      var p1 = {
        x: touches[0].pageX,
        y: touches[0].pageY
      };

      var p2 = {
        x: touches[1].pageX,
        y: touches[1].pageY
      };

      return distanceBetweenPoints(p1, p2);
    }

    function distanceBetweenPoints(point1,point2) {
      var xs = 0;var ys = 0;

      xs = point2.x - point1.x;
      xs = xs * xs;

      ys = point2.y - point1.y;
      ys = ys * ys;

      return Math.round(Math.sqrt( xs + ys ));
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
          if(meta.invertY==true){diffY*=-1;}

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
        if(meta.invertX==true){diffX*=-1;}

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
  that.findFrame({row: that.renderMeta.startRow, frame: 0});
}


// Version.
Threesixty.VERSION = '0.1.0';

// Export to the root, which is probably `window`.
root.Threesixty = Threesixty;

}(this));
