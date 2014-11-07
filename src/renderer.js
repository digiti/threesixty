Threesixty.prototype.renderer = function(){
  var that = this;
  var meta = that.renderMeta;
  var normal = meta.normal;
  var HD = meta.HD;

  meta.currentFrame = 0;
  meta.currentRow = 0;
  meta.currentZoom = 1;
  meta.interactions = {
    isDragging: false,
    startFrame: null,
    startRow: null,
    dragPosition: null,
    targetFrame: null,
    targetRow: null,
    startZoom: 1
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
        that._context.clearRect( 0, 0, that._canvas.width, that._canvas.height);
        that._context.drawImage(that.lastHDimg, 0, 0, HD.width, HD.height, 0, 0, that._canvas.width, that._canvas.height);
      }

      that.lastHDimg.src = imgSrc;
    }
  }

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

    function applyZoom(zoom){
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
      /*
      } else {
        var diffX = Math.round(param.x - meta.interactions.dragPosition.x);
        var diffY = Math.round(param.y - meta.interactions.dragPosition.y);

        console.log(diffX + ' | ' + diffY);
      }*/
    }

    //on interaction up
    function up(param) {
      if(meta.interactions.isDragging == true){
        meta.interactions.isDragging = false;
        that.drawHDFrame();
      }
    }
  }

  // Animate the element's value from 0% to 110%:
  $({introFrame: 0}).animate({introFrame: meta.perRow}, {
    duration: 1500,
    easing:'easeOutCubic', // can be anything
    step: function() { // called on every step
      that.findFrame({row: that.renderMeta.startRow, frame: Math.floor(this.introFrame)});
    },
    complete: function(){
      enableInteraction();
    }
  });
}
