# Threesixty

360° Photos Viewer

## Usage

### Create Threesixty Component

```javascript
var vm = new Threesixty({
  width: 640,
  height: 480,
  $el: $('.threesixty')
});
```

### Load Specifications

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

### Add Handles

```javascript
vm.onRowLoaded = function(data){
	console.log('onRowLoaded: ' + data.row);
}

vm.onComplete = function(data){
	console.log('onComplete');
}
```

## License

MIT. See `LICENSE.txt` in this directory.