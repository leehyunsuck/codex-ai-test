import * as THREE from 'https://cdn.jsdelivr.net/npm/three@0.164.1/build/three.module.js';
import { OrbitControls } from 'https://cdn.jsdelivr.net/npm/three@0.164.1/examples/jsm/controls/OrbitControls.js';

export function createScene(canvas) {
  const scene = new THREE.Scene();
  scene.background = new THREE.Color('#0f1324');

  const renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.shadowMap.enabled = true;
  renderer.shadowMap.type = THREE.PCFSoftShadowMap;
  renderer.physicallyCorrectLights = true;

  const camera = new THREE.PerspectiveCamera(52, window.innerWidth / window.innerHeight, 0.1, 100);
  camera.position.set(0, 7.5, 12);
  camera.lookAt(0, 2.8, 0);

  const controls = new OrbitControls(camera, renderer.domElement);
  controls.enablePan = false;
  controls.enableDamping = true;
  controls.minDistance = 7;
  controls.maxDistance = 17;
  controls.maxPolarAngle = Math.PI * 0.45;

  const ambient = new THREE.AmbientLight('#7ba4ff', 0.6);
  scene.add(ambient);

  const led = new THREE.PointLight('#dbe6ff', 130, 24, 2);
  led.position.set(0, 9.5, 0);
  led.castShadow = true;
  led.shadow.mapSize.set(2048, 2048);
  scene.add(led);

  const rim = new THREE.PointLight('#87f4ff', 55, 30, 1);
  rim.position.set(-5, 5, 6);
  scene.add(rim);

  const machine = new THREE.Group();
  scene.add(machine);

  const floor = new THREE.Mesh(
    new THREE.BoxGeometry(8, 0.5, 8),
    new THREE.MeshStandardMaterial({ color: '#111827', roughness: 0.85, metalness: 0.15 }),
  );
  floor.position.set(0, 0.25, 0);
  floor.receiveShadow = true;
  machine.add(floor);

  const glassMat = new THREE.MeshPhysicalMaterial({
    color: '#d6ecff',
    transparent: true,
    opacity: 0.15,
    roughness: 0.05,
    metalness: 0,
    transmission: 0.75,
    ior: 1.05,
    clearcoat: 0.2,
  });

  const wallThickness = 0.15;
  const wallHeight = 6;
  const wallLength = 8;

  const leftWall = new THREE.Mesh(new THREE.BoxGeometry(wallThickness, wallHeight, wallLength), glassMat);
  leftWall.position.set(-4, wallHeight / 2, 0);
  machine.add(leftWall);

  const rightWall = leftWall.clone();
  rightWall.position.x = 4;
  machine.add(rightWall);

  const backWall = new THREE.Mesh(new THREE.BoxGeometry(wallLength, wallHeight, wallThickness), glassMat);
  backWall.position.set(0, wallHeight / 2, -4);
  machine.add(backWall);

  const frontFrame = new THREE.Mesh(
    new THREE.BoxGeometry(wallLength, 0.2, wallThickness),
    new THREE.MeshStandardMaterial({ color: '#23355f', roughness: 0.5, metalness: 0.65 }),
  );
  frontFrame.position.set(0, 6, 4);
  machine.add(frontFrame);

  const prizeZone = new THREE.Mesh(
    new THREE.BoxGeometry(1.8, 0.2, 1.6),
    new THREE.MeshStandardMaterial({ color: '#3f145d', emissive: '#5f2e95', emissiveIntensity: 0.7 }),
  );
  prizeZone.position.set(2.9, 0.35, 2.6);
  machine.add(prizeZone);

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  return {
    THREE,
    scene,
    renderer,
    camera,
    controls,
    anchors: {
      prizeZone,
    },
  };
}
