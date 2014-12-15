# Threesixty

Threesixty Viewer

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

## License

MIT. See `LICENSE.txt` in this directory.