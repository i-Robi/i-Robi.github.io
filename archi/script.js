// # Let's get started

// First we gonna intenciate ```WebAudio```. This will initialize the layer.
// It will create the [AudioNode](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#AudioNode-section)`s
// for the end of the chain.
// By default it contains a
// [gainNode](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#AudioGainNode)
// and a
// [compressorNode](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#DynamicsCompressorNode).
// The gainNode is used to tune the volume. and the compressNode to smooth the peaks we could
// hit in the sound.
var webaudio = new WebAudio();

// Now that we go webaudio available, let's use it to create the sound we gonna play.
// ```.createSound()``` will create a ```WebAudio.Sound```. Then we ```.load()``` it
// from this url 'sounds/perfume.mp3'. The callback will be notified as soon as the sound
// is loaded. Then we simply start to play it. Don't forget to get ```.loop(true)```
// thus the sound will loop forever.
var sound = webaudio.createSound().load('moz.mp3', function(sound) {
  sound.loop(true).play();
});

// # Init the 3D

// First we initialize the world in 3D.
// With ```tQuery.createWorld()```, we create a ```tQuery.World```.
// With ```.boilerplate()```, we setup a boilerplate on this world. A boilerplate is
// a fast way to get you started on the right foot. It is the [learningthreejs
// boilerplate for three.js](http://learningthreejs.com/blog/2011/12/20/boilerplate-for-three-js/)
// With ```.start()```, we start the rendering loop. So from now on, the world scene
// gonna be rendered periodically, typically 60time per seconds.
var world = tQuery.createWorld().boilerplate().start();

// We Change the background color. This confusing line ensure the background of the
// 3D scene will be rendered as ```0x000000``` color, aka black.
world.tRenderer().setClearColorHex(0x000000, world.tRenderer().getClearAlpha());

// Here we setup the lights of our scene. This is a key factor for the look and feel
// of your scene. We add a ambient light and 2 directional lights.
tQuery.createAmbientLight().addTo(world).color(0x888888);
tQuery.createDirectionalLight().addTo(world).position(+1, +1, 1).color(0x88FF88);
tQuery.createDirectionalLight().addTo(world).position(-1, -1, 1).color(0x8888FF);

// # Some constants

// First we initialize ```nBar``` to store number of bars in our 3D vuemeter.
// This number MUST be odd, thus the vuemeter is symteric with the middle
// var nWidth = 30;
// var nHeight = 1;

var nWidth = 12;
var nHeight = 5;
var nCubes = nWidth * nWidth * nHeight;

cubeDimension = 50 / nWidth;

var cubes = [];

var group3d = tQuery.createObject3D().scale(1 / 20).addTo(world);

for (var k = 0; k < nWidth / 2; k++) {
  for (var j = 0; j < nWidth; j++) {
    for (var i = 0; i < nWidth; i++) {
      var eq = Math.pow(i - nWidth / 2, 2) + Math.pow(j - nWidth / 2, 2) + 2 * Math.pow(k - nWidth / 2, 2);
      var bound = Math.pow(nWidth / 2, 2);
      if (eq > bound) {
        var cube = tQuery.createCube(cubeDimension, cubeDimension, cubeDimension, new THREE.MeshLambertMaterial({
          ambient: 0x888888,
          color: 0xFFFFFF
        }));
        cube.addTo(group3d).position((i - nWidth / 2) * cubeDimension, (j - nWidth / 2) * cubeDimension, (k - nWidth / 2) * cubeDimension);
        cubes.push(cube);
      }
    }
  }
}



// # Update Vuemeter

// Here we hook a function to tQuery rendering loop, ```tQuery.Loop```. Thus
// this function gonna be executed everytime our 3D scene is rendered.
world.loop().hook(function() {
  // if the sound isnt yet loaded, do nothing
  if (sound.isPlayable() === false) return;
  // build the histogram of the sound based on
  // [RealtimeAnalyserNode](https://dvcs.w3.org/hg/audio/raw-file/tip/webaudio/specification.html#RealtimeAnalyserNode)
  // ```.getByteFrequencyData()```
  // var nBarHalf = Math.ceil(nBar / 2)
  var histo = sound.makeHistogram(nCubes);
  // We gonna loop over each bar3D of our vuemeter. We gonna update
  // each of them based on the sound histogram we just computed.
  cubes.forEach(function(cube, barIdx) {
    // We need to determine which value in the histogram match this vuemeter bar.
    // As our vuemeter is symetric, the vuemeter bar on the far left got the same
    // histogram value as the one on the far right. This make this computation
    // a bit confusing.
    var histoIdx = barIdx < nCubes ? nCubes - 1 - barIdx : barIdx - nCubes;
    // Now we need to compute the height of the vuemeter bar based on histogram value.
    // This is simple scaling from one to the other: vuemeter height === histo height / 256
    var height = histo[histoIdx] / 256;
    // Now that we computed all that, we update the ```cube```. We update ```.scale.y```
    // to change its size and ```.material.color``` to change its color. The formulas
    // i used "worked for me". Up to you to be creative and find the one that fit
    // your own needs
    // cube.get(0).scale.y = height * 3 + 0.001;
    cube.get(0).material.color.setHSL(0.3 + height * 0.7, 1, 0.5)
  });
});