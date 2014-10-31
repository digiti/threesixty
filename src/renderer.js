Threesixty.prototype.renderer = function(){
  //TODO
  //unbind previous listeners (due to re-initiate)

  var currentFrame = 0;

  console.log('renderer init');

  console.log(this.frames);
  console.log(this.renderMeta);

  var that = this;
  var testFrame = 0;
  var testRow = 4;
  var handler = setInterval(function(){

    if(testFrame>29){
      testFrame = 0;
    }

    if(testRow>9){
      testRow = 0;
    }

    var frame = that.frames[testRow][testFrame];
    if(frame && frame!==null){
      that._context.clearRect( 0, 0, that._canvas.width, that._canvas.height );
      that._context.drawImage(frame, 0, 0, 640, 480, 0, 0, 1280, 960)
    }

    testFrame ++;
    //testRow ++;
  }, 60);
}
