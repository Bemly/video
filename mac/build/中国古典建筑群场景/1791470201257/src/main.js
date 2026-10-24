import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

/**
 * Voxel Builder Utility
 * 用于在场景中快速创建体素结构
 */
class VoxelBuilder {
  constructor(scene) {
    this.scene = scene;
  }

  /**
   * 创建一个简单的体素盒子
   * @param {number} x - X 坐标
   * @param {number} y - Y 坐标
   * @param {number} z - Z 坐标
   * @param {number} w - 宽度
   * @param {number} h - 高度
   * @param {number} d - 深度
   * @param {string} color - 颜色 (Hex 或 CSS 颜色)
   */
  createBox(x, y, z, w = 1, h = 1, d = 1, color = '#ffffff') {
    const geometry = new THREE.BoxGeometry(w, h, d);
    const material = new THREE.MeshStandardMaterial({ 
      color: color,
      roughness: 0.7,
      metalness: 0.2
    });
    const mesh = new THREE.Mesh(geometry, material);
    mesh.position.set(x, y, z);
    this.scene.add(mesh);
    return mesh;
  }

  /**
   * 创建中式建筑风格的屋顶 (简化的飞檐翘角)
   * @param {number} x - 中心 X
   * @param {number} y - 基座高度
   * @param {number} z - 中心 Z
   * @param {number} width - 建筑宽度
   * @param {number} depth - 建筑深度
   * @param {string} color - 瓦片颜色
   */
  createRoof(x, y, z, width, depth, color = '#5d4037') {
    const group = new THREE.Group();
    const halfW = width / 2;
    const halfD = depth / 2;

    // 主屋顶层 (略微向上偏移)
    // 底部宽一点，顶部窄一点 (梯形效果)
    for (let i = 0; i < 3; i++) {
      const layerW = width - (i * 0.5);
      const layerD = depth - (i * 0.5);
      const layerH = 1;
      
      // 绘制底座层
      this.createBox(x, y + i, z, layerW, layerH, layerD, color);
      
      // 飞檐效果 (侧边凸起)
      if (i === 0) {
        this.createBox(x, y + i, z + halfD + 0.5, layerW, layerH, 0.5, color);
        this.createBox(x, y + i, z - halfD - 0.5, layerW, layerH, 0.5, color);
      }
    }

    group.add(this.scene.children.filter(c => c.position.y >= y && c.position.y <= y + 3).slice(-15)); // 这种做法在Group里不稳，直接操作Scene或优化逻辑
    // 简单化处理：直接把生成的Box放进Group
    // 为了代码简洁，我改为直接在Scene里按位置偏移
    return;
  }

  // 由于Group处理逻辑复杂，我直接写具体的建筑构造函数
}

export default class SceneManager {
  constructor() {
    this.scene = new THREE.Scene();
    this.scene.background = new THREE.Color(0x1a1a2e); // 深邃的夜空/晨昏色调
    this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.renderer.setSize(window.innerWidth, window.innerHeight);
    this.renderer.shadowMap.enabled = true;
    document.body.appendChild(this.renderer.domElement);

    this.controls = new OrbitControls(this.camera, this.renderer.domElement);
    this.controls.enableDamping = true;
    this.controls.target.set(0, 0, 0);

    this.initLights();
    this.initEnvironment();
    this.buildArchitecture();
    
    this.camera.position.set(40, 30, 40);
    this.animate();

    window.addEventListener('resize', () => this.onWindowResize());
  }

  initLights() {
    // 环境光
    const ambientLight = new THREE.AmbientLight(0x404040, 1.5);
    this.scene.add(ambientLight);

    // 主光源 (模拟晨昏的太阳)
    const sunLight = new THREE.DirectionalLight(0xffcc88, 2.0);
    sunLight.position.set(20, 50, 10);
    sunLight.castShadow = true;
    sunLight.shadow.mapSize.width = 1024;
    sunLight.shadow.mapSize.height = 1024;
    this.scene.add(sunLight);

    // 侧面装饰光 (增强氛围)
    const fillLight = new THREE.PointLight(0x3366ff, 1, 50);
    fillLight.position.set(-20, 10, -20);
    this.scene.add(fillLight);
  }

  initEnvironment() {
    // 地面 - 铺装广场
    const groundGeo = new THREE.PlaneGeometry(200, 200);
    const groundMat = new THREE.MeshStandardMaterial({ 
      color: 0x333333, 
      side: THREE.DoubleSide 
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.receiveShadow = true;
    this.scene.add(ground);

    // 草地区域
    const grassGeo = new THREE.PlaneGeometry(200, 200);
    const grassMat = new THREE.MeshStandardMaterial({ 
      color: 0x2d4c1e, 
      side: THREE.DoubleSide 
    });
    const grass = new THREE.Mesh(grassGeo, grassMat);
    grass.rotation.x = -Math.PI / 2;
    grass.position.y = 0.01; // 稍微高一点防止Z-fighting
    this.scene.add(grass);
  }

  buildArchitecture() {
    // 颜色定义
    const COLORS = {
      wall: 0x8B0000,      // 深红色墙
      roof: 0x4A4A4A,       // 深灰色瓦
      wood: 0x4b2e1e,       // 深木色
      stone: 0xcccccc,      // 石色
      gold: 0xd4af37         // 金色
    };

    // --- 山门 (Mountain Gate) ---
    // 位置: z = 40
    this.createGate(0, 0, 40, COLORS);

    // --- 主殿 (Main Hall) ---
    // 位置: z = 0
    this.createMainHall(0, 0, 0, COLORS);

    // --- 配殿 (Side Halls) ---
    // 左右对称
    this.createSideHall(-15, 0, 15, COLORS);
    this.createSideHall(15, 0, 15, COLORS);
    this.createSideHall(-20, 0, -15, COLORS);
    this.createSideHall(20, 0, -15, COLORS);

    // --- 宝塔 (Pagoda) ---
    // 位置: z = -40
    this.createPagoda(0, 0, -40, COLORS);
  }

  createGate(x, y, z, colors) {
    // 立柱
    for (let i = -2; i <= 2; i += 2) {
      for (let j = 0; j < 4; j++) {
        this.scene.add(new THREE.Mesh(
          new THREE.BoxGeometry(1, j + 1, 1),
          new THREE.MeshStandardMaterial({ color: colors.wood }),
          new THREE.Vector3(x + i, j + 0.5, z)
        ));
      }
    }
    // 横梁
    for (let j = 0; j < 4; j++) {
      this.scene.add(new THREE.Mesh(
        new THREE.BoxGeometry(5, 1, 1),
        new THREE.MeshStandardMaterial({ color: colors.wood }),
        new THREE.Vector3(x, j + 0.5, z)
      ));
    }
    // 屋顶
    this.scene.add(new THREE.Mesh(
      new THREE.BoxGeometry(8, 1.5, 5),
      new THREE.MeshStandardMaterial({ color: colors.roof }),
      new THREE.Vector3(x, 4.5, z)
    ));
  }

  createMainHall(x, y, z, colors) {
    // 台阶
    for (let i = 0; i < 3; i++) {
      this.scene.add(new THREE.Mesh(
        new THREE.BoxGeometry(15, 0.5, 4),
        new THREE.MeshStandardMaterial({ color: colors.stone }),
        new THREE.Vector3(x, 0.25 + i * 0.5, z + 5 + i)
      ));
    }

    // 柱子 (多立柱)
    const pillarCount = 6;
    for (let i = 0; i < pillarCount; i++) {
      const row = Math.floor(i / 3);
      const col = i % 3;
      const px = (col - 1) * 5;
      const pz = (row - 1) * 5;
      for (let h = 0; h < 6; h++) {
        this.scene.add(new THREE.Mesh(
          new THREE.BoxGeometry(1, 1, 1),
          new THREE.MeshStandardMaterial({ color: colors.wood }),
          new THREE.Vector3(x + px, h + 1, z + pz)
        ));
      }
    }

    // 墙体 (简单的红墙)
    this.scene.add(new THREE.Mesh(
      new THREE.BoxGeometry(10, 6, 1),
      new THREE.MeshStandardMaterial({ color: colors.wall }),
      new THREE.Vector3(x, 3.5, z + 7)
    ));

    // 屋顶 (多层结构)
    this.scene.add(new THREE.Mesh(
      new THREE.BoxGeometry(16, 2, 10),
      new THREE.MeshStandardMaterial({ color: colors.roof }),
      new THREE.Vector3(x, 7, z)
    ));
    
    // 飞檐
    this.scene.add(new THREE.Mesh(
      new THREE.BoxGeometry(18, 0.5, 12),
      new THREE.MeshStandardMaterial({ color: colors.roof }),
      new THREE.Vector3(x, 8, z)
    ));
  }

  createSideHall(x, y, z, colors) {
    // 简化的配殿
    // 立柱
    for (let i = 0; i < 4; i++) {
      for (let h = 0; h < 4; h++) {
        this.scene.add(new THREE.Mesh(
          new THREE.BoxGeometry(0.8, 1, 0.8),
          new THREE.MeshStandardMaterial({ color: colors.wood }),
          new THREE.Vector3(x + i, h + 0.5, z)
        ));
      }
    }
    // 屋顶
    this.scene.add(new THREE.Mesh(
      new THREE.BoxGeometry(6, 1.5, 5),
      new THREE.MeshStandardMaterial({ color: colors.roof }),
      new THREE.Vector3(x + 1.5, 4.5, z)
    ));
  }

  createPagoda(x, y, z, colors) {
    const floors = 3;
    for (let i = 0; i < floors; i++) {
      const size = 6 - i * 1.5;
      const height = 5 + i * 4;
      
      // 每一层的底座和柱子
      for (let j = 0; j < 4; j++) {
        for (let h = 0; h < 3; h++) {
          const px = (j - 1.5) * (size / 2);
          this.scene.add(new THREE.Mesh(
            new THREE.BoxGeometry(0.8, 1, 0.8),
            new THREE.MeshStandardMaterial({ color: colors.wood }),
            new THREE.Vector3(x + px, height + h, z)
          ));
        }
      }

      // 屋顶
      this.scene.add(new THREE.Mesh(
        new THREE.BoxGeometry(size + 1, 1.5, size + 1),
        new THREE.MeshStandardMaterial({ color: colors.roof }),
        new THREE.Vector3(x, height + 3, z)
      ));
    }
  }

  onWindowResize() {
    this.camera.aspect = window.innerWidth / window.innerHeight;
    this.camera.updateProjectionMatrix();
    this.renderer.setSize(window.innerWidth, window.innerHeight);
  }

  animate() {
    requestAnimationFrame(() => this.animate());
    this.controls.update();
    this.renderer.render(this.scene, this.camera);
  }
}

const scene = new SceneManager();
