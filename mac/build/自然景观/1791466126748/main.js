import * as THREE from 'three';
import { OrbitControls } from 'three/addons/controls/OrbitControls.js';

// --- CONFIGURATION ---
const WORLD_SIZE = 64; // Size of the grid
const VOXEL_SIZE = 1.0;
const WATERFALL_POS = { x: 32, z: -15 };
const SUN_COLOR = 0xffaa44; // Warm sunset orange

// --- SCENE SETUP ---
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x1a1a2e);
scene.fog = new THREE.FogExp2(0x3d2b5e, 0.015); // Purplish sunset fog

const camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
camera.position.set(40, 30, 60);

const renderer = new THREE.WebGLRenderer({ antialias: true });
renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
renderer.shadowMap.enabled = true;
document.body.appendChild(renderer.domElement);

const controls = new OrbitControls(camera, renderer.domElement);
controls.enableDamping = true;
controls.autoRotate = true;
controls.autoRotateSpeed = 0.5;

// --- LIGHTING ---
const ambientLight = new THREE.AmbientLight(0x404060, 1);
scene.add(ambientLight);

const sunLight = new THREE.DirectionalLight(SUN_COLOR, 2.5);
sunLight.position.set(50, 50, 20);
sunLight.castShadow = true;
// Shadow setup (limited area for performance)
sunLight.shadow.camera.left = -50;
sunLight.shadow.camera.right = 50;
sunLight.shadow.camera.top = 50;
sunLight.shadow.camera.bottom = -50;
scene.add(sunLight);

// --- TERRAIN GENERATION ---
const geometry = new THREE.BoxGeometry(VOXEL_SIZE, VOXEL_SIZE, VOXEL_SIZE);
const materialMap = [
    new THREE.MeshStandardMaterial({ color: 0x3d5e3a }), // Grass
    new THREE.MeshStandardMaterial({ color: 0x5e4a3c }), // Dirt
    new THREE.MeshStandardMaterial({ color: 0x8a8a8a }), // Stone
    new THREE.MeshStandardMaterial({ color: 0xffffff })  // Snow/Peak
];

const terrainGroup = new THREE.Group();

function getHeight(x, z) {
    let h = Math.sin(x * 0.12) * 3 + Math.cos(z * 0.12) * 3;
    h += Math.sin(x * 0.06 + z * 0.06) * 5;
    const distToWaterfall = Math.sqrt(Math.pow(x - WATERFALL_POS.x, 2) + Math.pow(z - WATERFALL_POS.z, 2));
    h += (10 - distToWaterfall) * 0.5;
    if (distToWaterfall < 12) h += (12 - distToWaterfall);
    return Math.max(2, Math.floor(h));
}

for (let x = 0; x < WORLD_SIZE; x++) {
    for (let z = 0; z < WORLD_SIZE; z++) {
        const h = getHeight(x, z);
        const materialIdx = h > 12 ? 3 : (h > 8 ? 2 : (h > 4 ? 0 : 1));
        const material = materialMap[materialIdx];

        // Optimization: Only render the surface and a few layers below
        for (let y = Math.max(0, h - 3); y < h; y++) {
            const mesh = new THREE.Mesh(geometry, material);
            mesh.position.set(x - WORLD_SIZE/2, y, z - WORLD_SIZE/2);
            mesh.receiveShadow = true;
            mesh.castShadow = true;
            terrainGroup.add(mesh);
        }
    }
}
scene.add(terrainGroup);

// --- WATERFALL ---
const waterfallMaterial = new THREE.MeshStandardMaterial({ 
    color: 0x4488ff, 
    transparent: true, 
    opacity: 0.7,
    emissive: 0x112244
});

const waterfallGroup = new THREE.Group();
for (let i = 0; i < 20; i++) {
    const wMesh = new THREE.Mesh(geometry, waterfallMaterial);
    wMesh.position.set(WATERFALL_POS.x - WORLD_SIZE/2, 4 + i * 0.8, WATERFALL_POS.z - WORLD_SIZE/2);
    waterfallGroup.add(wMesh);
}
scene.add(waterfallGroup);

// --- VEGETATION (InstancedMesh) ---
const treeGeometry = new THREE.BoxGeometry(VOXEL_SIZE * 0.7, VOXEL_SIZE * 3.5, VOXEL_SIZE * 0.7);
const treeMaterial = new THREE.MeshStandardMaterial({ color: 0x2d4c1e });
const treeCount = 300;
const treeMesh = new THREE.InstancedMesh(treeGeometry, treeMaterial, treeCount);
treeMesh.castShadow = true;
treeMesh.receiveShadow = true;

let treeIdx = 0;
const dummy = new THREE.Object3D();
for (let i = 0; i < treeCount; i++) {
    const x = Math.floor(Math.random() * WORLD_SIZE);
    const z = Math.floor(Math.random() * WORLD_SIZE);
    const h = getHeight(x, z);
    
    // Only place trees on "Grass" blocks and avoid the waterfall area
    if (h > 5 && h <= 12 && Math.random() > 0.8) {
        const distToWF = Math.sqrt(Math.pow(x - WATERFALL_POS.x, 2) + Math.pow(z - WATERFALL_POS.z, 2));
        if (distToWF > 8) {
            dummy.position.set(x - WORLD_SIZE/2, h - 0.5, z - WORLD_SIZE/2);
            dummy.scale.set(1, 1, 1);
            dummy.updateMatrix();
            treeMesh.setMatrixAt(treeIdx++, dummy.matrix);
        }
    }
}
scene.add(treeMesh);

// --- CLOUDS ---
const cloudGeometry = new THREE.BoxGeometry(6, 1.5, 6);
const cloudMaterial = new THREE.MeshStandardMaterial({ 
    color: 0xffffff, 
    transparent: true, 
    opacity: 0.4 
});

const clouds = [];
for (let i = 0; i < 25; i++) {
    const cloud = new THREE.Mesh(cloudGeometry, cloudMaterial);
    cloud.position.set(
        (Math.random() - 0.5) * 120,
        30 + Math.random() * 15,
        (Math.random() - 0.5) * 120
    );
    scene.add(cloud);
    clouds.push(cloud);
}

// --- ANIMATION LOOP ---
function animate() {
    requestAnimationFrame(animate);
    const time = Date.now() * 0.001;

    // Animate Waterfall
    waterfallGroup.children.forEach((mesh, i) => {
        // Move down slightly and change opacity to simulate flow
        mesh.position.y += 0.15;
        if (mesh.position.y > 20) {
            mesh.position.y = 4;
        }
    });

    // Animate Clouds (Slow float)
    clouds.forEach((cloud, i) => {
        cloud.position.x += 0.02 + (Math.sin(time + i) * 0.01);
        cloud.position.y += Math.sin(time * 0.5 + i) * 0.01;
        if (cloud.position.x > 60) cloud.position.x = -60;
    });

    controls.update();
    renderer.render(scene, camera);
}

window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
});

animate();
