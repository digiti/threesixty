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
