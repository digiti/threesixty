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
            that._context.globalAlpha = 0.5;

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
