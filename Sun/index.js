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

// Load the textures for the sun
const sunTexture1 = loader.load("./textures/tp33.jpeg");
const sunTexture2 = loader.load("./textures/sunImage2.jpeg");
const sunTexture3 = loader.load("./textures/tt24.jpeg"); // Third texture

const material = new THREE.MeshPhongMaterial({
  map: sunTexture1,
  specularMap: sunTexture1,
  bumpMap: sunTexture1,
  bumpScale: 0.04,
});
const earthMesh = new THREE.Mesh(geometry, material);
earthGroup.add(earthMesh);

const lightsMat = new THREE.MeshBasicMaterial({
  map: sunTexture1,
  blending: THREE.AdditiveBlending,
});
const lightsMesh = new THREE.Mesh(geometry, lightsMat);
earthGroup.add(lightsMesh);

const cloudsMat = new THREE.MeshStandardMaterial({
  map: sunTexture1,
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  alphaMap: sunTexture1,
});
const cloudsMesh = new THREE.Mesh(geometry, cloudsMat);
cloudsMesh.scale.setScalar(1.003);
earthGroup.add(cloudsMesh);

const fresnelMat = getFresnelMat();
const glowMesh = new THREE.Mesh(geometry, fresnelMat);
glowMesh.scale.setScalar(1);
earthGroup.add(glowMesh);

const stars = getStarfield({ numStars: 2000 });
scene.add(stars);

const sunLight = new THREE.DirectionalLight(0xffffff, 1.0);
sunLight.position.set(-2, 0.5, 1.5);
scene.add(sunLight);

// Load the flare textures
const flareTexture1 = loader.load('./textures/tp33.jpeg'); // Initial flare texture
const flareTexture2 = loader.load('./textures/sunImage2.jpeg'); // Second flare texture
const flareTexture3 = loader.load('./textures/tt24.jpeg'); // Third flare texture

// Create a mesh for the flare effect
const flareGeometry = new THREE.PlaneGeometry(2, 2); // Size of the flare
const flareMaterial = new THREE.MeshBasicMaterial({
    map: flareTexture1,
    transparent: true,
    opacity: 0,
    depthWrite: false,
});
const flareMesh = new THREE.Mesh(flareGeometry, flareMaterial);
flareMesh.position.set(0, 0, 0); // Position at the center of the sun
flareMesh.rotation.x = 0; // Keep this horizontal (no rotation upwards)
flareMesh.rotation.y = Math.PI / 2; // Rotate on the y-axis for horizontal effect
earthGroup.add(flareMesh); // Add to the sun group

// Curve generation functions
function create3DCurve(startPosition, controlPoint1, controlPoint2, endPosition) {
    const curve = new THREE.CatmullRomCurve3([
        startPosition,
        controlPoint1,
        controlPoint2,
        endPosition
    ]);

    const points = curve.getPoints(1000);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const material = new THREE.LineBasicMaterial({ color: 0xffd700, linewidth: 2 });

    return new THREE.Line(geometry, material);
}

function createCurvesForState(state) {
  const curveGroup = new THREE.Group();
  const offsetX = 0; // Offset distance to the right of the object
  const startPos = earthMesh.position.clone().add(new THREE.Vector3(earthMesh.position.x, earthMesh.position.y-1.02, earthMesh.position.z)); // Move right of the sun
  const endPos = earthMesh.position.clone().add(new THREE.Vector3(earthMesh.position.x-0.2, earthMesh.position.y+0.9, earthMesh.position.z)); // Move right of the sun

  let controlPoint1, controlPoint2;

  if (state === 0) {
      controlPoint1 = new THREE.Vector3(earthMesh.position.x +2, earthMesh.position.y + 0.1, earthMesh.position.z);
      controlPoint2 = new THREE.Vector3(earthMesh.position.x +1.5, earthMesh.position.y + 1.5, earthMesh.position.z);
  } else if (state === 1) {
      controlPoint1 = new THREE.Vector3(earthMesh.position.x + 3.3, earthMesh.position.y + 0.5, earthMesh.position.z);
      controlPoint2 = new THREE.Vector3(earthMesh.position.x + 2.5, earthMesh.position.y + 2.3, earthMesh.position.z);
  } else if (state === 2) {
      controlPoint1 = new THREE.Vector3(earthMesh.position.x + 4.6, earthMesh.position.y + 1, earthMesh.position.z);
      controlPoint2 = new THREE.Vector3(earthMesh.position.x + 3.4, earthMesh.position.y + 3.5, earthMesh.position.z);
  }

  const curve = create3DCurve(startPos, controlPoint1, controlPoint2, endPos);
  curveGroup.add(curve);

  return curveGroup;
}



let currentCurves = createCurvesForState(0); // Initial curve set for first animation
earthGroup.add(currentCurves);

let textureState = 0; // Track the texture state
const switchDelay1 = 5000; // First delay (5 seconds)
const switchDelay2 = 10000; // Second delay (10 seconds)

function switchTextures() {
    const now = performance.now();
    if (textureState === 0 && now >= switchDelay1) {
        // Switch to second texture
        earthMesh.material.map = sunTexture2;
        lightsMesh.material.map = sunTexture2;
        cloudsMesh.material.map = sunTexture2;
        flareMesh.material.map = flareTexture2;

        earthMesh.material.needsUpdate = true;
        lightsMesh.material.needsUpdate = true;
        cloudsMesh.material.needsUpdate = true;
        flareMesh.material.needsUpdate = true;

        scene.remove(currentCurves); // Remove old curves
        currentCurves = createCurvesForState(1); // Create curves for the second state
        earthGroup.add(currentCurves);

        textureState = 1; // Update state
    } else if (textureState === 1 && now >= switchDelay2) {
        // Switch to third texture
        earthMesh.material.map = sunTexture3;
        lightsMesh.material.map = sunTexture3;
        cloudsMesh.material.map = sunTexture3;
        flareMesh.material.map = flareTexture3;

        earthMesh.material.needsUpdate = true;
        lightsMesh.material.needsUpdate = true;
        cloudsMesh.material.needsUpdate = true;
        flareMesh.material.needsUpdate = true;

        scene.remove(currentCurves); // Remove old curves
        currentCurves = createCurvesForState(2); // Create curves for the third state
        earthGroup.add(currentCurves);

        textureState = 2; // Final state, no further switching
    }
}

function animate() {
    requestAnimationFrame(animate);

    earthMesh.rotation.y += 0.002;
    lightsMesh.rotation.y += 0.002;
    cloudsMesh.rotation.y += 0.0023;
    glowMesh.rotation.y += 0.002;
    stars.rotation.y -= 0.0002;

    // Rotate the flare mesh for a dynamic effect
    flareMesh.position.y -= 30;
    flareMesh.position.x -=30;

    // Check if it's time to switch the textures
    switchTextures();

    renderer.render(scene, camera);
}

animate();

function handleWindowResize() {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);
