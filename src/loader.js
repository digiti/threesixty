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
