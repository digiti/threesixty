# Threesixty

360° Photos Viewer

## Usage

### Create Threesixty component

```javascript
var vm = new Threesixty({
  width: 640,
  height: 480,
  $el: $('.threesixty')
});
```

### Load specifications

```javascript
vm.load({
  //Specs
  rows: 10,
  startRow: 4,
  startOnStatus: 1,

  //Loops
  loopX: true,
  loopY: false,

  //Animation
  swoosh: false,
  autoRotate: true,
  rotationTime: 3500,

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
this.autoRotate();

//In case you want to stop Auto Rotation:
this.stopAutoRotate();  

//In case you want no animation:
this.enableInteraction();
```

### Call animated zooming
```javascript
/*
  Animate to a specific zoomlevel, 
  providing a zoomfactor and duration
*/

vm.animatedZoom({
  factor: 0.5,
  duration: 1000
})
```

## License

MIT. See `LICENSE.txt` in this directory.