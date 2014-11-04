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

    that.$el.bind('gesturestart', function(e) {
      $('p').html('gesturestart');
    });

    that.$el.bind('gestureend', function(e) {
      $('p').html('gestureend');
    });

    that.$el.bind('gesturechange', function(e) {
      $('p').html('scale:' + e.scale);
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
      if(meta.loopX){
        newFrame += meta.perRow*(extraXRotations*-1);
      } else {
        if(extraXRotations<0){
          newFrame = 0;
        } else if(extraXRotations>0){
          newFrame = meta.perRow-1;
        }
      }

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
