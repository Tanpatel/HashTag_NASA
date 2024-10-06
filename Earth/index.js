import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';

import getStarfield from "./src/getStarfield.js";
import { getFresnelMat } from "./src/getFresnelMat.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(75, w / h, 0.1, 1000);
camera.position.z = 10;
const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(w, h);
document.body.appendChild(renderer.domElement);
// THREE.ColorManagement.enabled = true;
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
  map: loader.load("./textures/00_earthmap1k.jpg"),
  specularMap: loader.load("./textures/02_earthspec1k.jpg"),
  bumpMap: loader.load("./textures/01_earthbump1k.jpg"),
  bumpScale: 0.04,
});
// material.map.colorSpace = THREE.SRGBColorSpace;
const earthMesh = new THREE.Mesh(geometry, material);
earthGroup.add(earthMesh);
earthGroup.position.x = 5

const lightsMat = new THREE.MeshBasicMaterial({
  map: loader.load("./textures/03_earthlights1k.jpg"),
  blending: THREE.AdditiveBlending,
});
const lightsMesh = new THREE.Mesh(geometry, lightsMat);
earthGroup.add(lightsMesh);

const cloudsMat = new THREE.MeshStandardMaterial({
  map: loader.load("./textures/04_earthcloudmap.jpg"),
  transparent: true,
  opacity: 0.8,
  blending: THREE.AdditiveBlending,
  alphaMap: loader.load('./textures/05_earthcloudmaptrans.jpg'),
  // alphaTest: 0.3,
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
sunLight.position.set(-12, 0.5, 5.5);
scene.add(sunLight);

function animate() {
  requestAnimationFrame(animate);

  earthMesh.rotation.y += 0.002;
  lightsMesh.rotation.y += 0.002;
  cloudsMesh.rotation.y += 0.0023;
  glowMesh.rotation.y += 0.002;
  stars.rotation.y -= 0.0002;
  renderer.render(scene, camera);
}

function addAurora() {
  const auroraGeometry = new THREE.CircleGeometry(0.35, 32); // Adjust size as needed
  const auroraMaterial = new THREE.MeshBasicMaterial({
    color: 0x00ff00, // Green color for the aurora
    transparent: true,
    opacity: 0.4, // Adjust opacity for desired transparency
    side: THREE.DoubleSide, // Render both sides
  });

  // Create Northern Aurora
  const northernAuroraMesh = new THREE.Mesh(auroraGeometry, auroraMaterial);
  northernAuroraMesh.rotation.x = Math.PI / 2; // Rotate to face upward
  northernAuroraMesh.position.y = 1; // Position it slightly above the Earth
  earthGroup.add(northernAuroraMesh);

  // Create Southern Aurora
  const southernAuroraMesh = new THREE.Mesh(auroraGeometry, auroraMaterial);
  southernAuroraMesh.rotation.x = Math.PI / 2; // Rotate to face upward
  southernAuroraMesh.position.y = -1; // Position it slightly below the Earth
  earthGroup.add(southernAuroraMesh);
}

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
          fieldLine.position.set(earthGroup.position.x, earthGroup.position.y, earthGroup.position.z); // Center the field lines with the Earth
          fieldLines.add(fieldLine);
      }
  }

  return fieldLines;
}

// Generate and add magnetic field to the scene
const magneticField = generateMagneticField();
scene.add(magneticField);


function createSolarWinds() {
  const particleCount = 100; // Number of solar wind particles
  const particleMaterial = new THREE.PointsMaterial({
      size: 0.05, // Size of the particles
      color: 0xffff00, // Yellow color for solar winds
      transparent: true,
      opacity: 0.8,
  });

  const particles = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 3);
  const velocities = new Float32Array(particleCount * 3); // Store velocity for movement
  const splitFlags = new Int8Array(particleCount); // Flag for up/down deviation

  // Initialize particles starting from the left side
  for (let i = 0; i < particleCount; i++) {
      positions[i * 3] = -5 + Math.random() * 2; // Initial x position (near the sun)
      positions[i * 3 + 1] = Math.random() * 2 - 1; // Random y position
      positions[i * 3 + 2] = (Math.random() - 0.5) * 2; // Random z position

      velocities[i * 3] = 0.05; // Velocity along x-axis (moving right)
      velocities[i * 3 + 1] = 0; // No initial y velocity
      velocities[i * 3 + 2] = 0; // No initial z velocity

      splitFlags[i] = Math.random() > 0.5 ? 1 : -1; // Randomly assign upward or downward deviation
  }

  particles.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  const particleSystem = new THREE.Points(particles, particleMaterial);
  scene.add(particleSystem); // Add the particle system to the scene

  // Function to deviate the velocity of a particle (deflect it)
  const deviateVelocity = (vx, vy, vz, nx, ny, nz, strength, splitFlag) => {
      // Tangent vector to normal at the point of contact
      const tangentX = vy * nz - vz * ny;
      const tangentY = vz * nx - vx * nz;
      const tangentZ = vx * ny - vy * nx;

      const splitFactor = splitFlag === 1 ? 1 : -1; // 1 for upward, -1 for downward deviation

      return {
          vx: vx + tangentX * strength,
          vy: vy + tangentY * strength * splitFactor, // Apply the split factor for deviation
          vz: vz + tangentZ * strength,
      };
  };

  // Animate the solar wind particles
  const animateParticles = () => {
      const positions = particleSystem.geometry.attributes.position.array;
      const magnetosphereRadius = 90; // Adjust radius of the magnetic sphere
      const deviationStrength = 0.009; // Control the strength of deviation

      for (let i = 0; i < particleCount; i++) {
          // Get particle position
          const x = positions[i * 3];
          const y = positions[i * 3 + 1];
          const z = positions[i * 3 + 2];

          // Move particles based on their velocities
          positions[i * 3] += velocities[i * 3]; // Move along x-axis
          positions[i * 3 + 1] += velocities[i * 3 + 1]; // Move along y-axis
          positions[i * 3 + 2] += velocities[i * 3 + 2]; // Move along z-axis

          // Calculate distance from the Earth's center to the particle (3D distance)
          const distance = Math.sqrt(x * x + y * y + z * z);

          // Check if the particle is near or inside the magnetic sphere
          if (distance < magnetosphereRadius) { 
              // Particle is inside or near the magnetic sphere

              // Calculate the normal vector at the point of interaction
              const normX = x / distance; // Normalized x (N.x)
              const normY = y / distance; // Normalized y (N.y)
              const normZ = z / distance; // Normalized z (N.z)

              // Deviate the velocity based on the tangential direction and split
              const deviated = deviateVelocity(
                  velocities[i * 3 ],
                  velocities[i * 3 + 1],
                  velocities[i * 3 + 2],
                  normX, normY, normZ,
                  deviationStrength,
                  splitFlags[i] // Use the split flag to choose upward or downward deviation
              );

              // Update the particle's velocity with the deviated velocity
              velocities[i * 3] = deviated.vx * 1.0008;
              velocities[i * 3 + 1] = deviated.vy * 1.0094;
              velocities[i * 3 + 2] = deviated.vz;
          }

          // Reset particles that move past the right boundary
          if (positions[i * 3] > 5) {
              positions[i * 3] = -5 + Math.random() * 2; // Reset to random position near the left
              positions[i * 3 + 1] = Math.random() * 2 - 1; // Randomize new y position
              positions[i * 3 + 2] = (Math.random() - 0.5) * 2; // Randomize new z position

              // Reset velocities and split flag as well
              velocities[i * 3] = 0.05; // Reset x velocity
              velocities[i * 3 + 1] = 0; // Reset y velocity
              velocities[i * 3 + 2] = 0; // Reset z velocity

              splitFlags[i] = Math.random() > 0.5 ? 1 : -1; // Re-randomize split direction
          }
      }

      particleSystem.geometry.attributes.position.needsUpdate = true; // Update positions
      requestAnimationFrame(animateParticles);
  };

  animateParticles(); // Start the animation
}


createSolarWinds();


// // Call the function and pass the earthGroup to it
// createMagnetosphereAnimation(earthGroup);

addAurora();
animate();

function handleWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);




