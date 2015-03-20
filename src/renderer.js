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
      that.$el.bind('touchmove', function(e) {
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
      $(window).bind('touchend', function(e) {
        e.preventDefault();
        up(e);
      });

      that.$el.bind('gesturestart', function(e) {
        // e.preventDefault();
        // meta.interactions.startZoom = meta.currentZoom;
      });

      that.$el.bind('gesturechange', function(e) {
        // e.preventDefault();
        // var scale = e.originalEvent.scale;
        // var zoom = 0;

        // if(scale>1){
        //   zoom = meta.interactions.startZoom + (((scale-1)/5)*2);
        // } else if(scale<1){
        //   zoom = meta.interactions.startZoom - ((1-(scale))*1.7);
        // }

        // if(zoom>=0 && zoom<=1){
        //   that.applyZoom(zoom);
        // }
      });

      that.$el.on('mousewheel', function(e) {
        e.preventDefault();
        var scrollSpeed = e.originalEvent.deltaY;
        var direction = Math.abs(scrollSpeed)/scrollSpeed;

        if(direction){
          that.applyZoom(meta.currentZoom + (direction/50));
        }
      });
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
