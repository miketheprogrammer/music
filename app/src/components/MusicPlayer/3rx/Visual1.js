import * as THREE from 'three'
import alphaTexture from './textures/stripes_gradient.jpg';
/*global SimplexNoise*/
/*global alphaTexture*/
export default (scene, context, audio) => {
  var noise = new SimplexNoise();
  var analyser = context.createAnalyser();
  let audioSrc = context.createMediaElementSource(audio);
  audioSrc.connect(analyser);
  audioSrc.connect(context.destination);
  analyser.connect(context.destination);
  analyser.fftSize = 512;
  var bufferLength = analyser.frequencyBinCount;
  var dataArray = new Uint8Array(bufferLength);

  const group = new THREE.Group();
  // var camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  // camera.position.set(0,0,100);
  // camera.lookAt(scene.position);
  // scene.add(camera);

  var planeGeometry = new THREE.PlaneGeometry(800, 800, 20, 20);
  var planeMaterial = new THREE.MeshLambertMaterial({
      color: 0x6904ce,
      side: THREE.DoubleSide,
      wireframe: true
  });

  var plane = new THREE.Mesh(planeGeometry, planeMaterial);
  plane.rotation.x = -0.5 * Math.PI;
  plane.position.set(0, 30, 0);
  group.add(plane);

  var plane2 = new THREE.Mesh(planeGeometry, planeMaterial);
  plane2.rotation.x = -0.5 * Math.PI;
  plane2.position.set(0, -30, 0);
  group.add(plane2);

  var icosahedronGeometry = new THREE.IcosahedronGeometry(10, 4);
  var lambertMaterial = new THREE.MeshLambertMaterial({
      color: 0xff00ee,
      wireframe: true
  });

  var ball = new THREE.Mesh(icosahedronGeometry, lambertMaterial);
  ball.position.set(0, 0, 0);
  group.add(ball);

  var ambientLight = new THREE.AmbientLight(0xaaaaaa);
  scene.add(ambientLight);

  var spotLight = new THREE.SpotLight(0xffffff);
  spotLight.intensity = 0.9;
  spotLight.position.set(-10, 40, 20);
  spotLight.lookAt(ball);
  spotLight.castShadow = true;
  scene.add(spotLight);

  // var orbitControls = new THREE.OrbitControls(camera);
  // orbitControls.autoRotate = true;

  // var gui = new dat.GUI();
  var guiControls = new function () {
      this.amp = 1.8;
      this.wireframe = true;
  }();

  scene.add(group);


  function makeRoughBall(mesh, bassFr, treFr) {
      mesh.geometry.vertices.forEach(function (vertex, i) {
          var offset = mesh.geometry.parameters.radius;
          var amp = guiControls.amp;
          var time = Date.now();
          vertex.normalize();
          var distance = (offset + bassFr ) + noise.noise3D(vertex.x + time * 0.00007, vertex.y +  time * 0.00008, vertex.z +  time * 0.00009) * amp * treFr;
          vertex.multiplyScalar(distance);
      });
      mesh.geometry.verticesNeedUpdate = true;
      mesh.geometry.normalsNeedUpdate = true;
      mesh.geometry.computeVertexNormals();
      mesh.geometry.computeFaceNormals();
  }


  function makeRoughGround(mesh, distortionFr) {
      mesh.geometry.vertices.forEach(function (vertex, i) {
          var amp = 2;
          var time = Date.now();
          var distance = (noise.noise2D(vertex.x + time * 0.0003, vertex.y + time * 0.0001) + 0) * distortionFr * amp;
          vertex.z = distance;
      });
      mesh.geometry.verticesNeedUpdate = true;
      mesh.geometry.normalsNeedUpdate = true;
      mesh.geometry.computeVertexNormals();
      mesh.geometry.computeFaceNormals();
  }

  // window.onload = vizInit();

  // document.body.addEventListener('touchend', function(ev) { context.resume(); });

  //some helper functions here
  function fractionate(val, minVal, maxVal) {
      return (val - minVal)/(maxVal - minVal);
  }

  function modulate(val, minVal, maxVal, outMin, outMax) {
      var fr = fractionate(val, minVal, maxVal);
      var delta = outMax - outMin;
      return outMin + (fr * delta);
  }

  function avg(arr){
      var total = arr.reduce(function(sum, b) { return sum + b; });
      return (total / arr.length);
  }

  function max(arr){
      return arr.reduce(function(a, b){ return Math.max(a, b); })
  }


  function update(time) {
    analyser.getByteFrequencyData(dataArray);

     var lowerHalfArray = dataArray.slice(0, (dataArray.length/2) - 1);
     var upperHalfArray = dataArray.slice((dataArray.length/2) - 1, dataArray.length - 1);

     var overallAvg = avg(dataArray);
     var lowerMax = max(lowerHalfArray);
     var lowerAvg = avg(lowerHalfArray);
     var upperMax = max(upperHalfArray);
     var upperAvg = avg(upperHalfArray);

     var lowerMaxFr = lowerMax / lowerHalfArray.length;
     var lowerAvgFr = lowerAvg / lowerHalfArray.length;
     var upperMaxFr = upperMax / upperHalfArray.length;
     var upperAvgFr = upperAvg / upperHalfArray.length;

     // ball.rotation.y += 0.008;
     // ball.rotation.x += 0.009;

     makeRoughGround(plane, modulate(upperAvgFr, 0, 1, 0.5, 4));
     makeRoughGround(plane2, modulate(lowerMaxFr, 0, 1, 0.5, 4));
     makeRoughBall(ball, modulate(Math.pow(lowerMaxFr, 0.5), 0, 1, 0, 8), modulate(upperAvgFr, 0, 1, 0, 4));

     group.rotation.y += 0.005;
  }

  return {
      update
  }
}
