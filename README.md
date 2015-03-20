# Threesixty

360° Photos Viewer

## Usage

### Create Threesixty component

```javascript
var vm = new Threesixty({
  //Dimensions
  width: 640,
  height: 480,

  //Predefined container
  $el: $('.threesixty'),

  //Background color
  bgColor: '#000000'
});
```

### Load specifications

```javascript
//Load example

vm.load({
  //Specs
  rows: 10,

  //Loops
  loopX: true,
  loopY: false,

  //Feeds
  normal: {
    sources: sourceFiles,
    width: 640,
    height: 480
  },
  HD: {
    sources: HDFiles,
    width: 1280,
    height: 960
  }
});
```

### Specifications

```javascript
{
  //Whether or not to show the default loading bar.
  showDefaultLoading: true,

  //The amount of rows the lib should calculate with.
  rows: 10,

  //The index of wich row is loaded and rendered first.
  startRow: 4,

  //Which status has the defenition of done.
  //Status 1 for 'after first row is loaded' &
  //Status 2 for 'after all rows are loaded.'
  startOnStatus: 1,

  //Whether or not the lib should compile immediately after
  //initialization. If set to false, call .show() to start loading.
  loadAfterinit: true,

  //Loops on x-axis.
  loopX: true,

  //Loops on y-axis.
  loopY: false,

  //Invert dragging on X-axis.
  invertX: true,

  //Invert dragging on Y-axis.
  invertY: true,

  //The Max Zoom Level is calculated based on the difference in size between the images 
  //of the normal and HD feed. If both are the same feed, the difference is 0. You can 
  //manipulate the zoom level by adding 'extraZoom'.
  extraZoom: 0,

  //Duration of 1 full rotation animation when using autoRotate.
  rotationTime: 3500,

  //Feed of normal images.
  normal: {
    sources: sourceFiles,
    width: 640, 
    height: 480
  },

  //Feed of HD images.
  HD: {
    sources: HDFiles,
    width: 1280,
    height: 960
  }
}
```

### Add handles

```javascript
vm.onFirstRowLoaded = function(data){
  console.log('onFirstRowLoaded: ' + data.row);
}

vm.onRowLoaded = function(data){
	console.log('onRowLoaded: ' + data.row);
}

vm.onComplete = function(){
	console.log('onComplete');
}
```

### Chain functionality to handles
```javascript
vm.onFirstRowLoaded = function(data){
  //Chaining 'Swoosh' to 'onFirstRowLoaded'
  //Check out the other functionality commands below.

  this.swoosh();
}
```

### Other chainable functionality commands
```javascript
//Show a soft eased-out animation on frames.
this.swoosh();

//In case you want to start Auto Rotation:
//param direction: 1 for normal, -1 for inverted.
this.autoRotate(1);

//In case you want to stop Auto Rotation:
this.stopAutoRotate();  

//In case you want no animation:
this.enableInteraction();
```

### Call animated zooming
```javascript
//Animate to a specific zoomlevel, 
//providing a zoomfactor and duration

vm.animatedZoom({
  factor: 0.5,
  duration: 1000
})
```

## License

MIT. See `LICENSE.txt` in this directory.
