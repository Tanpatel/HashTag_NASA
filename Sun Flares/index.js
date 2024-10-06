import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';

import getStarfield from "./src/getStarfield.js";
import { getFresnelMat } from "./src/getFresnelMat.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 5;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);
renderer.toneMapping = THREE.ACESFilmicToneMapping;
renderer.outputColorSpace = THREE.LinearSRGBColorSpace;

const earthGroup = new THREE.Group();
earthGroup.rotation.z = -23.4 * Math.PI / 180;
scene.add(earthGroup);
new OrbitControls(camera, renderer.domElement);
const detail = 12;
const loader = new THREE.TextureLoader();
const geometry = new THREE.IcosahedronGeometry(1, detail);
const material = new THREE.MeshPhongMaterial({
  map: loader.load("./textures/sun.png"),
  specularMap: loader.load("./textures/sun.png"),
  bumpMap: loader.load("./textures/sun.png"),
  bumpScale: 0.04,
});
const earthMesh = new THREE.Mesh(geometry, material);
earthGroup.add(earthMesh);

const lightsMat = new THREE.MeshBasicMaterial({
  map: loader.load("./textures/sun.png"),
  blending: THREE.AdditiveBlending,
});
const lightsMesh = new THREE.Mesh(geometry, lightsMat);
earthGroup.add(lightsMesh);

const cloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load("./textures/sun.png"),
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  alphaMap: loader.load('./textures/sun.png'),
});
const cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
cloudsMesh.scale.setScalar(1.003);
earthGroup.add(cloudsMesh);

const fresnelMat = getFresnelMat();
const glowMesh = new THREE.Mesh(geometry, fresnelMat);
glowMesh.scale.setScalar(1.01);
earthGroup.add(glowMesh);

const stars = getStarfield({numStars: 2000});
scene.add(stars);

const sunLight = new THREE.DirectionalLight(0xffffff, 2.0);
sunLight.position.set(-2, 0.5, 1.5);
scene.add(sunLight);

// Magnetic Field Functions
function createMagneticFieldLine(startLat, startLng, endLat, endLng, baseRadius, numPoints = 100) {
  const points = [];
  for (let i = 0; i <= numPoints; i++) {
      const t = i / numPoints;
      const lat = startLat + t * (endLat - startLat);
      const lng = startLng + t * (endLng - startLng);

      // Convert to 3D coordinates
      const phi = (90 - lat) * Math.PI / 180;
      const theta = (lng + 180) * Math.PI / 180;

      // Calculate radius to create a curvier line
      const r = baseRadius * (1 + 0.5 * Math.sin(Math.PI * t) * (1 - t));

      const x = -r * Math.sin(phi) * Math.cos(theta);
      const y = r * Math.cos(phi);
      const z = r * Math.sin(phi) * Math.sin(theta);

      points.push(new THREE.Vector3(x, y, z));
  }

  // Create TubeGeometry for thickness
  const curve = new THREE.CatmullRomCurve3(points);
  const geometry = new THREE.TubeGeometry(curve, numPoints, 0.02, 8); // Adjust the radius here for thickness
  const material = new THREE.MeshBasicMaterial({
      color: 0xf0f0f0,
      transparent: true,
      opacity: 0.7
  });

  return new THREE.Mesh(geometry, material); // Change Line to Mesh
}

//numLayers: number of layers of fields, more layer means more curved fields
//linesPerLayers: num of field lines in each layer
function generateMagneticField(numLayers = 3, linesPerLayer = 7) {
  const fieldLines = new THREE.Group();

  for (let layer = 0; layer < numLayers; layer++) {
      const baseRadius = 1 + layer * 0.5; // Increased spacing between layers
      for (let i = 0; i < linesPerLayer; i++) {
          const startLng = (i / linesPerLayer) * 360 - 180;
          const endLng = (startLng + 180) % 360 - 180;

          // Vary the start and end latitudes based on the layer
          const startLat = 90 - layer * 20; // Increased variation
          const endLat = -90 + layer * 20; // Increased variation

          const fieldLine = createMagneticFieldLine(startLat, startLng, endLat, endLng, baseRadius);
          fieldLines.add(fieldLine);
      }
  }

  return fieldLines;
}

// Generate and add magnetic field to the scene
const magneticField = generateMagneticField();
scene.add(magneticField);


// /// Solar Flare
// function createSolarFlare(idx) {
//     const points = [];
//     const numPoints = 150;
//     const radius = 2; // Slightly larger than the sun's radius
//     const height = 0.5;
//     const startAngle = Math.PI/2;
//     const angleSpan = 2*Math.PI; // Full circle span
//     const phase = (2 * Math.PI * idx) / 9; // Phase offset based on idx (assuming 9 total flares)

//     for (let i = 0; i <= numPoints; i++) {
//         const t = i / numPoints;
//         const angle = startAngle*idx + t * angleSpan + phase;
//         const x = radius * Math.cos(angle*idx);
//         const y = radius * Math.sin(angle*idx);
//         const z = height * Math.sin(t * Math.PI); // Arc upwards
//         points.push(new THREE.Vector3(x, y, z));
//     }

//     const curve = new THREE.CatmullRomCurve3(points);

//     // Create TubeGeometry for thickness
//     const flareGeometry = new THREE.TubeGeometry(curve, 200, 0.01, 8); // Adjust radius for thickness
//     const flareMaterial = new THREE.MeshBasicMaterial({ 
//         color: 0x0000ff,
//         transparent: true,
//         opacity: 0.7
//     });
    
//     return new THREE.Mesh(flareGeometry, flareMaterial);
// }

// // Create multiple flares
// const numFlares = 9;
// const solarFlares = [];

// for(let i = 0; i < numFlares; i++){
//     const flare = createSolarFlare(i);
//     solarFlares.push(flare);
//     earthGroup.add(flare);
// }

function animate() {
    requestAnimationFrame(animate);

    earthMesh.rotation.y += 0.002;
    lightsMesh.rotation.y += 0.002;
    cloudsMesh.rotation.y += 0.0023;
    glowMesh.rotation.y += 0.002;
    stars.rotation.y -= 0.0002;
    magneticField.rotation.y += 0.002;

    // // Animate solar flares
    // solarFlares.forEach((flare, index) => {
    //     flare.rotation.y += index * 0.005; // Vary rotation speed
    // });

    renderer.render(scene, camera);
}

animate();

function handleWindowResize () {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);
