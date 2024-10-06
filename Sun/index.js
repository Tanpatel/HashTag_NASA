import * as THREE from "three";
import { OrbitControls } from 'jsm/controls/OrbitControls.js';

import getStarfield from "./src/getStarfield.js";
import { getFresnelMat } from "./src/getFresnelMat.js";

const w = window.innerWidth;
const h = window.innerHeight;
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(45, w / h, 0.1, 1000);
camera.position.z = 12;
camera.position.x = -1;
camera.position.y = 0;
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
earthGroup.position.x = 3;

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

function createMagnetosphereAnimation(earthGroup) {
  const ringCount = 5; // Number of rings
  const ringMaterial = new THREE.MeshBasicMaterial({
      color: 0x808080, // Gray color for the magnetosphere rings
      opacity: 0.6,
      transparent: true,
  });

  // Create an array to hold the magnetic rings
  let magneticRings = [];

  // Create the initial rings
  for (let i = 0; i < ringCount; i++) {
      const radius = 1.5 + i * 0.15; // Radius of the ring
      const tubeRadius = 0.02; // Thickness of the ring

      // Create torus geometry for horizontal rings
      const torusGeometry = new THREE.TorusGeometry(radius, tubeRadius, 16, 100);
      
      // Create a mesh for the torus
      const torusMesh = new THREE.Mesh(torusGeometry, ringMaterial);
      
      // Position the ring to come out of the Earth
      torusMesh.position.y = 0; // Centered vertically
      magneticRings.push(torusMesh); // Add to array
      earthGroup.add(torusMesh); // Add to the earthGroup
  }

  // Function to simulate the bending of rings during a solar storm
  const simulateSolarStorm = () => {
      const stormDuration = 5000; // Duration of the solar storm in milliseconds
      const startTime = Date.now();

      const animateStorm = () => {
          const elapsed = Date.now() - startTime;

          // Calculate the intensity of the solar storm effect
          const intensity = Math.min(elapsed / stormDuration, 1);

          magneticRings.forEach((ring, index) => {
              const bendFactor = Math.sin((elapsed / 500) + index) * (0.1 * intensity); // Bend effect
              ring.scale.y = 1 - bendFactor; // Change height to simulate bending
              ring.scale.x = 1 + bendFactor; // Widening effect to simulate distortion
              ring.position.y = -bendFactor * 0.5; // Shift downward slightly
          });

          if (elapsed < stormDuration) {
              requestAnimationFrame(animateStorm);
          } else {
              resetMagnetosphere(magneticRings); // Reset the rings after the storm
              setTimeout(simulateSolarStorm, 2000); // Wait for 2 seconds, then start the storm again
          }
      };

      animateStorm(); // Start the animation
  };

  // Function to reset the magnetosphere rings
  const resetMagnetosphere = (rings) => {
      rings.forEach((ring) => {
          ring.scale.set(1, 1, 1); // Reset scale
          ring.position.y = 0; // Reset position
      });
  };

  // Start the first solar storm simulation after 2 seconds
  setTimeout(simulateSolarStorm, 2000);
}


function createSolarWinds() {
  const particleCount = 200; // Number of solar wind particles
  const particleMaterial = new THREE.PointsMaterial({
      size: 0.05, // Size of the particles
      color: 0xffff00, // Yellow color for solar winds
      transparent: true,
      opacity: 0.8,
  });

  const particles = new THREE.BufferGeometry();
  const positions = new Float32Array(particleCount * 4);
  const velocities = new Float32Array(particleCount * 4); // Store velocity for movement
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
              velocities[i * 3] = deviated.vx * 1.00000008;
              velocities[i * 3 + 1] = deviated.vy * 1.042;
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


// Call the function and pass the earthGroup to it
createMagnetosphereAnimation(earthGroup);

addAurora();
animate();

function handleWindowResize () {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize(window.innerWidth, window.innerHeight);
}
window.addEventListener('resize', handleWindowResize, false);
