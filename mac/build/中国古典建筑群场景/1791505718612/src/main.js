import * as THREE from 'three';

// ============================================================
// 全局变量声明（在模块作用域内）
// ============================================================



let scene, camera, renderer, controls;
const sceneObjects = []; // 收集所有场景对象

// ============================================================
// 工具函数：创建体素材质
// ============================================================

function createVoxelMaterial(color) {
  return new THREE.MeshStandardMaterial({
    color: color instanceof THREE.Color ? color : new THREE.Color(color),
    roughness: 0.85,
    metalness: 0.1,
  });
}

// ============================================================
// 模块：创建单个体素块（立方体）
// ============================================================

function createVoxelBlock(size = 1, color = new THREE.Color(0x8B4513)) {
  const geometry = new THREE.BoxGeometry(size, size, size);
  return new THREE.Mesh(geometry, createVoxelMaterial(color));
}

// ============================================================
// 模块：创建中式屋顶（体素化）
// ============================================================

function createChineseRoof(width = 8, depth = 6, height = 3, color = new THREE.Color(0xCC2244)) {
  const roofGroup = new THREE.Group();

  // 主屋顶（梯形）
  const mainRoofWidth = width;
  const mainRoofDepth = depth;

  // 生成多层飞檐（模拟中式屋顶的层次）
  const layers = 3; // 层数

  for (let layer = 0; layer < layers; layer++) {
    const overhang = layer * 1.2; // 每一层向外延伸
    const currentWidth = mainRoofWidth + overhang * 2;
    const currentDepth = mainRoofDepth + overhang * 2;

    // 屋顶底部（较厚）
    const bottomGeo = new THREE.BoxGeometry(currentWidth, 0.8, currentDepth);
    const bottomMat = createVoxelMaterial(color);
    const bottomMesh = new THREE.Mesh(bottomGeo, bottomMat);
    bottomMesh.position.y = 0.4; // 半高
    roofGroup.add(bottomMesh);

    // 屋顶顶部（薄层，形成飞檐）
    const topGeo = new THREE.BoxGeometry(currentWidth - 0.5, 0.4, currentDepth - 0.5);
    const topMat = createVoxelMaterial(color);
    const topMesh = new THREE.Mesh(topGeo, topMat);
    topMesh.position.y = 1.2; // 半高 + 底部高度
    roofGroup.add(topMesh);

    // 飞檐（突出部分）
    const eaveWidth = currentWidth + 1;
    const eaveDepth = currentDepth + 1;
    const eaveGeo = new THREE.BoxGeometry(eaveWidth, 0.4, eaveDepth);
    const eaveMat = createVoxelMaterial(color);
    const eaveMesh = new THREE.Mesh(eaveGeo, eaveMat);
    eaveMesh.position.y = -0.2; // 低于主屋顶
    roofGroup.add(eaveMesh);
  }

  return roofGroup;
}

// ============================================================
// 模块：创建中式门窗（体素化）
// ============================================================

function createChineseDoor(width = 2, height = 3, color = new THREE.Color(0x8B4513)) {
  const doorGroup = new THREE.Group();

  // 门框（外框）
  const frameGeo = new THREE.BoxGeometry(width + 0.4, height + 0.2, 0.3);
  const frameMat = createVoxelMaterial(new THREE.Color(0x6B4F3A));
  const frameMesh = new THREE.Mesh(frameGeo, frameMat);
  doorGroup.add(frameMesh);

  // 门板（内板）
  const panelGeo = new THREE.BoxGeometry(width - 0.2, height - 0.4, 0.2);
  const panelMat = createVoxelMaterial(color);
  const panelMesh = new THREE.Mesh(panelGeo, panelMat);
  doorGroup.add(panelMesh);

  // 门把手（小块）
  const handleGeo = new THREE.BoxGeometry(0.3, 0.3, 0.1);
  const handleMat = createVoxelMaterial(new THREE.Color(0xDAA520));
  const handleMesh = new THREE.Mesh(handleGeo, handleMat);
  handleMesh.position.set(width / 2 + 0.15, height / 2 - 0.3, 0.2);
  doorGroup.add(handleMesh);

  return doorGroup;
}

// ============================================================
// 模块：创建中式窗户（体素化）
// ============================================================

function createChineseWindow(width = 1.5, height = 2, color = new THREE.Color(0x8B4513)) {
  const windowGroup = new THREE.Group();

  // 窗框（外框）
  const frameGeo = new THREE.BoxGeometry(width + 0.3, height + 0.2, 0.15);
  const frameMat = createVoxelMaterial(new THREE.Color(0x6B4F3A));
  const frameMesh = new THREE.Mesh(frameGeo, frameMat);
  windowGroup.add(frameMesh);

  // 窗格（内格）- 传统中式格子
  const gridCols = 2;
  const gridRows = 2;

  for (let col = 0; col < gridCols; col++) {
    for (let row = 0; row < gridRows; row++) {
      const cellWidth = (width - 0.3) / gridCols;
      const cellHeight = (height - 0.2) / gridRows;

      // 窗格框架
      const cellGeo = new THREE.BoxGeometry(cellWidth, cellHeight, 0.1);
      const cellMat = createVoxelMaterial(new THREE.Color(0x6B4F3A));
      const cellMesh = new THREE.Mesh(cellGeo, cellMat);

      cellMesh.position.set(
        -width / 2 + col * (cellWidth + 0.1) + cellWidth / 2,
        -height / 2 + row * (cellHeight + 0.1) + cellHeight / 2,
        0.08
      );

      windowGroup.add(cellMesh);
    }
  }

  return windowGroup;
}

// ============================================================
// 模块：创建中式门楼（山门）
// ============================================================

function createChineseGate(width = 5, height = 4) {
  const gateGroup = new THREE.Group();

  // 左右门柱（粗立柱）
  const pillarWidth = 0.8;
  const pillarHeight = height;

  // 左柱
  const leftPillarGeo = new THREE.BoxGeometry(pillarWidth, pillarHeight, pillarWidth);
  const pillarMat = createVoxelMaterial(new THREE.Color(0x6B4F3A));
  const leftPillarMesh = new THREE.Mesh(leftPillarGeo, pillarMat);
  leftPillarMesh.position.set(-width / 2 + pillarWidth / 2, pillarHeight / 2, 0);
  gateGroup.add(leftPillarMesh);

  // 右柱
  const rightPillarGeo = new THREE.BoxGeometry(pillarWidth, pillarHeight, pillarWidth);
  const rightPillarMesh = new THREE.Mesh(rightPillarGeo, pillarMat);
  rightPillarMesh.position.set(width / 2 - pillarWidth / 2, pillarHeight / 2, 0);
  gateGroup.add(rightPillarMesh);

  // 横梁（连接左右柱）
  const beamGeo = new THREE.BoxGeometry(width - pillarWidth, 0.4, pillarWidth);
  const beamMat = createVoxelMaterial(new THREE.Color(0x6B4F3A));
  const beamMesh = new THREE.Mesh(beamGeo, beamMat);
  beamMesh.position.set(0, pillarHeight - 0.2, 0);
  gateGroup.add(beamMesh);

  // 门楼门楣（装饰性横幅）
  const lintelGeo = new THREE.BoxGeometry(width + 0.5, 0.3, pillarWidth);
  const lintelMat = createVoxelMaterial(new THREE.Color(0xDAA520));
  const lintelMesh = new THREE.Mesh(lintelGeo, lintelMat);
  lintelMesh.position.set(0, pillarHeight + 0.15, 0);
  gateGroup.add(lintelMesh);

  // 门楼门楣的装饰性图案（简单的色块）
  const decorGeo = new THREE.BoxGeometry(width - pillarWidth, 0.2, pillarWidth);
  const decorMat = createVoxelMaterial(new THREE.Color(0x8B4513));
  const decorMesh = new THREE.Mesh(decorGeo, decorMat);
  decorMesh.position.set(0, pillarHeight - 0.15, 0);
  gateGroup.add(decorMesh);

  // 门楼屋顶（简单的平顶）
  const roofGeo = new THREE.BoxGeometry(width + 1, 0.5, pillarWidth + 2);
  const roofMat = createVoxelMaterial(new THREE.Color(0xCC2244));
  const roofMesh = new THREE.Mesh(roofGeo, roofMat);
  roofMesh.position.set(0, pillarHeight + 0.5, 0);
  gateGroup.add(roofMesh);

  return gateGroup;
}

// ============================================================
// 模块：创建中式主殿（体素化）
// ============================================================

function createMainHall(width = 10, depth = 8) {
  const hallGroup = new THREE.Group();

  // === 地基/台基（高台）===
  const platformHeight = 1.5;
  const platformGeo = new THREE.BoxGeometry(width + 2, platformHeight, depth + 2);
  const platformMat = createVoxelMaterial(new THREE.Color(0x8B7355));
  const platformMesh = new THREE.Mesh(platformGeo, platformMat);
  platformMesh.position.y = -platformHeight / 2;
  hallGroup.add(platformMesh);

  // === 立柱（四根主柱）===
  const pillarCount = 4;
  const pillarWidth = 0.6;
  const pillarHeight = 5;

  // 定义柱子的位置（围绕中心）
  const pillarPositions = [
    [-width / 2 + pillarWidth / 2, -depth / 2 + pillarWidth / 2],
    [width / 2 - pillarWidth / 2, -depth / 2 + pillarWidth / 2],
    [-width / 2 + pillarWidth / 2, depth / 2 - pillarWidth / 2],
    [width / 2 - pillarWidth / 2, depth / 2 - pillarWidth / 2],
  ];

  const pillarMat = createVoxelMaterial(new THREE.Color(0x6B4F3A));

  for (let i = 0; i < pillarCount; i++) {
    const pillarGeo = new THREE.BoxGeometry(pillarWidth, pillarHeight, pillarWidth);
    const pillarMesh = new THREE.Mesh(pillarGeo, pillarMat);
    pillarMesh.position.set(
      pillarPositions[i][0],
      platformHeight / 2 + pillarHeight / 2,
      pillarPositions[i][1]
    );
    hallGroup.add(pillarMesh);

    // 柱头（斗拱的底部）
    const pillarHeadGeo = new THREE.BoxGeometry(pillarWidth + 0.3, 0.5, pillarWidth + 0.3);
    const pillarHeadMat = createVoxelMaterial(new THREE.Color(0xDAA520));
    const pillarHeadMesh = new THREE.Mesh(pillarHeadGeo, pillarHeadMat);
    pillarHeadMesh.position.set(
      pillarPositions[i][0],
      platformHeight / 2 + pillarHeight - 0.25,
      pillarPositions[i][1]
    );
    hallGroup.add(pillarHeadMesh);
  }

  // === 墙壁（四面墙）===
  const wallHeight = pillarHeight - 1; // 墙壁比柱子稍短

  // 前墙（面向观察者）
  const frontWallGeo = new THREE.BoxGeometry(width, wallHeight, pillarWidth);
  const wallMat = createVoxelMaterial(new THREE.Color(0xCC2244));
  const frontWallMesh = new THREE.Mesh(frontWallGeo, wallMat);
  frontWallMesh.position.set(0, platformHeight / 2 + wallHeight / 2, depth / 2 - pillarWidth / 2);
  hallGroup.add(frontWallMesh);

  // 后墙
  const backWallGeo = new THREE.BoxGeometry(width, wallHeight, pillarWidth);
  const backWallMesh = new THREE.Mesh(backWallGeo, wallMat);
  backWallMesh.position.set(0, platformHeight / 2 + wallHeight / 2, -depth / 2 + pillarWidth / 2);
  hallGroup.add(backWallMesh);

  // 左墙
  const leftWallGeo = new THREE.BoxGeometry(pillarWidth, wallHeight, depth);
  const leftWallMesh = new THREE.Mesh(leftWallGeo, wallMat);
  leftWallMesh.position.set(-width / 2 + pillarWidth / 2, platformHeight / 2 + wallHeight / 2, 0);
  hallGroup.add(leftWallMesh);

  // 右墙
  const rightWallGeo = new THREE.BoxGeometry(pillarWidth, wallHeight, depth);
  const rightWallMesh = new THREE.Mesh(rightWallGeo, wallMat);
  rightWallMesh.position.set(width / 2 - pillarWidth / 2, platformHeight / 2 + wallHeight / 2, 0);
  hallGroup.add(rightWallMesh);

  // === 门窗（前墙）===
  const doorWidth = 2.5;
  const doorHeight = 3.5;

  // 主门（中轴）
  const mainDoor = createChineseDoor(doorWidth, doorHeight);
  mainDoor.position.set(0, platformHeight / 2 + doorHeight / 2, depth / 2);
  hallGroup.add(mainDoor);

  // 左右门（侧门）
  const sideDoor = createChineseDoor(1.8, doorHeight);

  // 左门
  const leftSideDoor = sideDoor.clone();
  leftSideDoor.position.set(-width / 2 + pillarWidth + doorWidth, platformHeight / 2 + doorHeight / 2, depth / 2);
  hallGroup.add(leftSideDoor);

  // 右门
  const rightSideDoor = sideDoor.clone();
  rightSideDoor.position.set(width / 2 - pillarWidth - doorWidth, platformHeight / 2 + doorHeight / 2, depth / 2);
  hallGroup.add(rightSideDoor);

  // === 窗户（前墙两侧）===
  const windowWidth = 1.5;
  const windowHeight = 2.5;

  // 左窗（在门和墙之间）
  const leftWindow = createChineseWindow(windowWidth, windowHeight);
  leftWindow.position.set(
    -width / 2 + pillarWidth + doorWidth + windowWidth,
    platformHeight / 2 + windowHeight / 2,
    depth / 2
  );
  hallGroup.add(leftWindow);

  // 右窗（在门和墙之间）
  const rightWindow = createChineseWindow(windowWidth, windowHeight);
  rightWindow.position.set(
    width / 2 - pillarWidth - doorWidth - windowWidth,
    platformHeight / 2 + windowHeight / 2,
    depth / 2
  );
  hallGroup.add(rightWindow);

  // === 屋顶（飞檐翘角）===
  const roofColor = new THREE.Color(0xCC2244); // 琉璃瓦
  const roof = createChineseRoof(width + 3, depth + 3, pillarHeight - wallHeight + 2, roofColor);
  roof.position.set(0, platformHeight / 2 + pillarHeight - wallHeight + 1, 0);
  hallGroup.add(roof);

  // === 装饰：门前的石狮（简化版，用色块表示）===
  const lionColor = new THREE.Color(0x6B4F3A);

  // 左门前的石狮
  const leftLionGeo = new THREE.BoxGeometry(1.5, 2, 1);
  const leftLionMat = createVoxelMaterial(lionColor);
  const leftLionMesh = new THREE.Mesh(leftLionGeo, leftLionMat);
  leftLionMesh.position.set(-doorWidth / 2 - 0.5, platformHeight / 2 + 1, depth / 2 + pillarWidth);
  hallGroup.add(leftLionMesh);

  // 右门前的石狮
  const rightLionGeo = new THREE.BoxGeometry(1.5, 2, 1);
  const rightLionMat = createVoxelMaterial(lionColor);
  const rightLionMesh = new THREE.Mesh(rightLionGeo, rightLionMat);
  rightLionMesh.position.set(doorWidth / 2 + 0.5, platformHeight / 2 + 1, depth / 2 + pillarWidth);
  hallGroup.add(rightLionMesh);

  return hallGroup;
}

// ============================================================
// 模块：创建配殿（较小的建筑）
// ============================================================

function createSideHall(width = 6, depth = 5) {
  const hallGroup = new THREE.Group();

  // === 地基/台基 ===
  const platformHeight = 1;
  const platformGeo = new THREE.BoxGeometry(width + 2, platformHeight, depth + 2);
  const platformMat = createVoxelMaterial(new THREE.Color(0x8B7355));
  const platformMesh = new THREE.Mesh(platformGeo, platformMat);
  platformMesh.position.y = -platformHeight / 2;
  hallGroup.add(platformMesh);

  // === 墙壁（四面墙）===
  const wallHeight = 3;
  const wallMat = createVoxelMaterial(new THREE.Color(0xCC2244));

  // 前墙
  const frontWallGeo = new THREE.BoxGeometry(width, wallHeight, pillarWidth);
  const frontWallMesh = new THREE.Mesh(frontWallGeo, wallMat);
  frontWallMesh.position.set(0, platformHeight / 2 + wallHeight / 2, depth / 2);
  hallGroup.add(frontWallMesh);

  // 后墙
  const backWallGeo = new THREE.BoxGeometry(width, wallHeight, pillarWidth);
  const backWallMesh = new THREE.Mesh(backWallGeo, wallMat);
  backWallMesh.position.set(0, platformHeight / 2 + wallHeight / 2, -depth / 2);
  hallGroup.add(backWallMesh);

  // 左墙
  const leftWallGeo = new THREE.BoxGeometry(pillarWidth, wallHeight, depth);
  const leftWallMesh = new THREE.Mesh(leftWallGeo, wallMat);
  leftWallMesh.position.set(-width / 2, platformHeight / 2 + wallHeight / 2, 0);
  hallGroup.add(leftWallMesh);

  // 右墙
  const rightWallGeo = new THREE.BoxGeometry(pillarWidth, wallHeight, depth);
  const rightWallMesh = new THREE.Mesh(rightWallGeo, wallMat);
  rightWallMesh.position.set(width / 2, platformHeight / 2 + wallHeight / 2, 0);
  hallGroup.add(rightWallMesh);

  // === 门窗（前墙）===
  const door = createChineseDoor(2, 3);
  door.position.set(0, platformHeight / 2 + 1.5, depth / 2);
  hallGroup.add(door);

  // === 屋顶（较小的屋顶）===
  const roofColor = new THREE.Color(0xCC2244);
  const roof = createChineseRoof(width + 1, depth + 1, wallHeight - 0.5 + 2, roofColor);
  roof.position.set(0, platformHeight / 2 + wallHeight - 0.5 + 1, 0);
  hallGroup.add(roof);

  return hallGroup;
}

// ============================================================
// 模块：创建宝塔（高塔，体素化）
// ============================================================

function createPagoda(height = 8) {
  const pagodaGroup = new THREE.Group();

  // === 地基/台基 ===
  const platformHeight = 1.5;
  let baseWidth = 4;
  let currentY = -platformHeight / 2;

  const platformGeo = new THREE.BoxGeometry(baseWidth + 1, platformHeight, baseWidth + 1);
  const platformMat = createVoxelMaterial(new THREE.Color(0x8B7355));
  const platformMesh = new THREE.Mesh(platformGeo, platformMat);
  platformMesh.position.y = currentY;
  pagodaGroup.add(platformMesh);

  // === 多层塔身（每层逐渐变小）===
  const layers = 4; // 层数

  for (let layer = 0; layer < layers; layer++) {
    const layerHeight = height / layers;

    // 塔身（方块）
    const towerGeo = new THREE.BoxGeometry(baseWidth, layerHeight - 0.2, baseWidth);
    const towerMat = createVoxelMaterial(new THREE.Color(0x8B4513));
    const towerMesh = new THREE.Mesh(towerGeo, towerMat);

    // 每层高度
    const towerY = currentY + layer * layerHeight + layerHeight / 2;
    towerMesh.position.set(0, towerY, 0);
    pagodaGroup.add(towerMesh);

    // 每层的飞檐（突出部分）
    const eaveGeo = new THREE.BoxGeometry(baseWidth + 1, 0.4, baseWidth + 1);
    const eaveMat = createVoxelMaterial(new THREE.Color(0xCC2244));
    const eaveMesh = new THREE.Mesh(eaveGeo, eaveMat);
    eaveMesh.position.set(0, towerY + layerHeight - 0.1, 0);
    pagodaGroup.add(eaveMesh);

    // 下一层基础（宽度减小）
    baseWidth = Math.max(1.5, baseWidth - 0.5);

    currentY += layerHeight;
  }

  // === 塔顶（尖顶）===
  const topGeo = new THREE.BoxGeometry(1.5, 1, 1.5);
  const topMat = createVoxelMaterial(new THREE.Color(0xDAA520));
  const topMesh = new THREE.Mesh(topGeo, topMat);
  topMesh.position.y = currentY + 0.5;
  pagodaGroup.add(topMesh);

  // === 装饰：塔身上的小窗/格窗 ===
  for (let layer = 0; layer < layers - 1; layer++) {
    const windowY = currentY + layer * layerHeight + layerHeight / 2;

    // 前窗
    const windowGeo = new THREE.BoxGeometry(0.8, 1.2, 0.3);
    const windowMat = createVoxelMaterial(new THREE.Color(0x6B4F3A));
    const windowMesh = new THREE.Mesh(windowGeo, windowMat);
    windowMesh.position.set(0, windowY, baseWidth / 2 + 0.1);
    pagodaGroup.add(windowMesh);

    // 后窗
    const backWindowGeo = new THREE.BoxGeometry(0.8, 1.2, 0.3);
    const backWindowMat = createVoxelMaterial(new THREE.Color(0x6B4F3A));
    const backWindowMesh = new THREE.Mesh(backWindowGeo, backWindowMat);
    backWindowMesh.position.set(0, windowY, -baseWidth / 2 - 0.1);
    pagodaGroup.add(backWindowMesh);

    // 左窗
    const leftWindowGeo = new THREE.BoxGeometry(0.3, 1.2, 0.8);
    const leftWindowMat = createVoxelMaterial(new THREE.Color(0x6B4F3A));
    const leftWindowMesh = new THREE.Mesh(leftWindowGeo, leftWindowMat);
    leftWindowMesh.position.set(baseWidth / 2 + 0.1, windowY, 0);
    pagodaGroup.add(leftWindowMesh);

    // 右窗
    const rightWindowGeo = new THREE.BoxGeometry(0.3, 1.2, 0.8);
    const rightWindowMat = createVoxelMaterial(new THREE.Color(0x6B4F3A));
    const rightWindowMesh = new THREE.Mesh(rightWindowGeo, rightWindowMat);
    rightWindowMesh.position.set(-baseWidth / 2 - 0.1, windowY, 0);
    pagodaGroup.add(rightWindowMesh);
  }

  return pagodaGroup;
}

// ============================================================
// 模块：创建地面（体素化）
// ============================================================

function createGround(width = 50, depth = 30) {
  const groundGroup = new THREE.Group();

  // === 主要地面（草地区间）===
  const grassGeo = new THREE.BoxGeometry(width, 0.1, depth);
  const grassMat = createVoxelMaterial(new THREE.Color(0x4CAF50));
  const grassMesh = new THREE.Mesh(grassGeo, grassMat);
  grassMesh.rotation.x = -Math.PI / 2; // 平放
  grassMesh.position.y = 0.05; // 半高
  groundGroup.add(grassMesh);

  // === 道路（中轴对称）===
  const roadWidth = 3;
  const roadDepth = depth + 10; // 延伸超出草地区域

  // 中轴道路
  const roadGeo = new THREE.BoxGeometry(roadWidth, 0.15, roadDepth);
  const roadMat = createVoxelMaterial(new THREE.Color(0xC0C0C0));
  const roadMesh = new THREE.Mesh(roadGeo, roadMat);
  roadMesh.rotation.x = -Math.PI / 2; // 平放
  roadMesh.position.y = 0.075; // 半高（略高于草地区域）
  roadMesh.position.z = -10; // 路径位置（从草地区域前向延伸）
  groundGroup.add(roadMesh);

  // === 庭院/广场（建筑前的开阔区域）===
  const plazaWidth = width - roadWidth; // 减去道路宽度
  const plazaDepth = 10;

  // 左庭院
  const leftPlazaGeo = new THREE.BoxGeometry(plazaWidth / 2 - roadWidth / 4, 0.15, plazaDepth);
  const leftPlazaMat = createVoxelMaterial(new THREE.Color(0xBDBDBD));
  const leftPlazaMesh = new THREE.Mesh(leftPlazaGeo, leftPlazaMat);
  leftPlazaMesh.rotation.x = -Math.PI / 2; // 平放
  leftPlazaMesh.position.y = 0.075;
  leftPlazaMesh.position.set(-plazaWidth / 4, 0, -15); // 左庭院位置
  groundGroup.add(leftPlazaMesh);

  // 右庭院
  const rightPlazaGeo = new THREE.BoxGeometry(plazaWidth / 2 - roadWidth / 4, 0.15, plazaDepth);
  const rightPlazaMat = createVoxelMaterial(new THREE.Color(0xBDBDBD));
  const rightPlazaMesh = new THREE.Mesh(rightPlazaGeo, rightPlazaMat);
  rightPlazaMesh.rotation.x = -Math.PI / 2; // 平放
  rightPlazaMesh.position.y = 0.075;
  rightPlazaMesh.position.set(plazaWidth / 4, 0, -15); // 右庭院位置
  groundGroup.add(rightPlazaMesh);

  return groundGroup;
}

// ============================================================
// 模块：创建灯笼（装饰）
// ============================================================

function createLantern(size = 0.5) {
  const lanternGroup = new THREE.Group();

  // 灯笼主体（圆柱体）
  const bodyGeo = new THREE.CylinderGeometry(size, size * 0.9, size * 2, 8);
  const bodyMat = createVoxelMaterial(new THREE.Color(0xDAA520));
  const bodyMesh = new THREE.Mesh(bodyGeo, bodyMat);
  bodyMesh.position.y = size; // 半高
  lanternGroup.add(bodyMesh);

  // 灯笼顶（锥形）- 简化为方块
  const topGeo = new THREE.BoxGeometry(size * 1.2, size * 0.5, size * 1.2);
  const topMat = createVoxelMaterial(new THREE.Color(0xDAA520));
  const topMesh = new THREE.Mesh(topGeo, topMat);
  topMesh.position.y = size * 2.5; // 位于主体上方
  lanternGroup.add(topMesh);

  // 灯笼绳（简化为细线块）
  const ropeGeo = new THREE.CylinderGeometry(0.05, 0.05, size * 1.5, 4);
  const ropeMat = createVoxelMaterial(new THREE.Color(0x8B4513));
  const ropeMesh = new THREE.Mesh(ropeGeo, ropeMat);
  ropeMesh.position.y = -size * 0.75; // 位于主体下方
  lanternGroup.add(ropeMesh);

  return lanternGroup;
}

// ============================================================
// 模块：创建装饰树（简化版）
// ============================================================

function createTree(size = 1) {
  const treeGroup = new THREE.Group();

  // 树干
  const trunkGeo = new THREE.CylinderGeometry(size * 0.15, size * 0.2, size * 2, 6);
  const trunkMat = createVoxelMaterial(new THREE.Color(0x8B4513));
  const trunkMesh = new THREE.Mesh(trunkGeo, trunkMat);
  trunkMesh.position.y = size; // 半高
  treeGroup.add(trunkMesh);

  // 树冠（多层球体，模拟树形）
  const canopyLevels = 3;

  for (let level = 0; level < canopyLevels; level++) {
    const radius = size * (1.5 - level * 0.3); // 越往上越小
    const canopyGeo = new THREE.SphereGeometry(radius, 6, 4);
    const canopyMat = createVoxelMaterial(new THREE.Color(0x2E8B57));
    const canopyMesh = new THREE.Mesh(canopyGeo, canopyMat);
    canopyMesh.position.y = size * 2 + level * size * 0.8; // 层层堆叠
    treeGroup.add(canopyMesh);
  }

  return treeGroup;
}

// ============================================================
// 模块：创建装饰石（简化版）
// ============================================================

function createStone(size = 0.5) {
  const stoneGeo = new THREE.BoxGeometry(size, size * 1.2, size);
  const stoneMat = createVoxelMaterial(new THREE.Color(0x9E9E9E));
  const stoneMesh = new THREE.Mesh(stoneGeo, stoneMat);
  return stoneMesh;
}

// ============================================================
// 主函数：构建场景
// ============================================================

function buildScene() {
  const scene = new THREE.Scene();
  sceneObjects.length = 0;

  // ============================================================
  // 场景背景（模拟天空）
  // ============================================================

  const skyGeo = new THREE.PlaneGeometry(200, 200);
  const skyMat = new THREE.MeshStandardMaterial({
    color: new THREE.Color(0x87CEEB), // 浅蓝天色
    side: THREE.BackSide,
  });
  const skyMesh = new THREE.Mesh(skyGeo, skyMat);
  skyMesh.rotation.x = -Math.PI / 2; // 平放（作为天空）
  skyMesh.position.y = 50; // 较高位置
  scene.add(skyMesh);

  // ============================================================
  // 创建地面 ===
  // ============================================================
  const ground = createGround(50, 30);
  scene.add(ground);

  // ============================================================
  // 创建建筑 ===
  // ============================================================

  // === 1. 主殿（中轴最前）===
  const mainHall = createMainHall(10, 8);
  mainHall.position.set(0, 0, -35); // 中轴上
  sceneObjects.push(mainHall);

  // === 2. 左配殿（左侧）===
  const leftSideHall = createSideHall(6, 5);
  leftSideHall.position.set(-12, 0, -38); // 左侧稍后
  sceneObjects.push(leftSideHall);

  // === 3. 右配殿（右侧）===
  const rightSideHall = createSideHall(6, 5);
  rightSideHall.position.set(12, 0, -38); // 右侧稍后
  sceneObjects.push(rightSideHall);

  // === 4. 山门（最前中轴）===
  const mountainGate = createChineseGate(5, 4);
  mountainGate.position.set(0, 0, -25); // 最前中轴
  sceneObjects.push(mountainGate);

  // === 5. 宝塔（左侧后方）===
  const leftPagoda = createPagoda(8);
  leftPagoda.position.set(-10, 0, -45); // 左侧后方
  sceneObjects.push(leftPagoda);

  // === 6. 钟楼（右侧后方）===
  const rightPagoda = createPagoda(8);
  rightPagoda.position.set(10, 0, -45); // 右侧后方
  sceneObjects.push(rightPagoda);

  // ============================================================
  // 道路连接（体素化）
  // ============================================================

  // === 左配殿到主殿的连接路 ===
  const leftRoadGeo = new THREE.BoxGeometry(3, 0.15, 8);
  const roadMat = createVoxelMaterial(new THREE.Color(0xC0C0C0));
  const leftRoad = new THREE.Mesh(leftRoadGeo, roadMat);
  leftRoad.rotation.x = -Math.PI / 2; // 平放
  leftRoad.position.set(-6, 0.075, -38); // 连接左配殿到主殿方向
  sceneObjects.push(leftRoad);

  // === 右配殿到主殿的连接路 ===
  const rightRoadGeo = new THREE.BoxGeometry(3, 0.15, 8);
  const rightRoad = new THREE.Mesh(rightRoadGeo, roadMat);
  rightRoad.rotation.x = -Math.PI / 2; // 平放
  rightRoad.position.set(6, 0.075, -38); // 连接右配殿到主殿方向
  sceneObjects.push(rightRoad);

  // ============================================================
  // 装饰元素（灯笼、树等）
  // ============================================================

  // 添加灯笼（沿道路两侧）
  for (let i = -20; i <= 20; i += 6) {
    if (i === 0) continue; // 跳过中轴

    const lantern = createLantern(0.4);
    lantern.position.set(i, 2, -35); // 沿中轴道路两侧
    sceneObjects.push(lantern);

    const lantern2 = createLantern(0.4);
    lantern2.position.set(-i, 2, -35);
    sceneObjects.push(lantern2);
  }

  // 添加装饰树（避开建筑区域）
  for (let i = -20; i <= 20; i += 6) {
    for (let j = -15; j <= 15; j += 6) {
      // 避开建筑区域（中轴附近、配殿前后）
      if (Math.abs(i) < 5 && j > -40) continue; // 避开中轴建筑
      if (Math.abs(i) < 10 && Math.abs(j) < 3) continue; // 避开主要道路
      if (Math.abs(i) > 8 && Math.abs(j - (-38)) < 4) continue; // 避开配殿区域

      const tree = createTree(1.2);
      tree.position.set(i, 0, j - 35); // 树的位置
      sceneObjects.push(tree);
    }
  }

  // 添加一些简单的装饰石（路径两侧）
  for (let i = -20; i <= 20; i += 8) {
    if (Math.abs(i) < 3) continue; // 避开中轴

    const stone = createStone(0.6);
    stone.position.set(i, 0.15, -35); // 路径两侧
    sceneObjects.push(stone);

    const stone2 = createStone(0.6);
    stone2.position.set(-i, 0.15, -35);
    sceneObjects.push(stone2);
  }

  // ============================================================
  // 场景返回
  // ============================================================
  return { scene, sceneObjects };
}

// ============================================================
// 主初始化函数
// ============================================================

function init() {
  const canvas = window.canvas || document.getElementById('canvas');

  // ============================================================
  // Three.js 初始化（已全局加载）
  // ============================================================

  const { scene, sceneObjects } = buildScene();

  // ============================================================
  // 场景、相机、渲染器
  // ============================================================

  const camera = new THREE.PerspectiveCamera(45, window.innerWidth / window.innerHeight, 0.1, 1000);
  camera.position.set(0, 45, 35); // 初始视角

  const renderer = new THREE.WebGLRenderer({ antialias: true, alpha: false });
  renderer.setSize(window.innerWidth, window.innerHeight);
  renderer.setPixelRatio(Math.min(window.devicePixelRatio || 1, 2));
  renderer.toneMapping = THREE.ACESFilmicToneMapping;
  renderer.toneMappingExposure = 1.2;

  // ============================================================
  // 添加场景对象
  // ============================================================

  scene.add(sceneObjects);

  // ============================================================
  // 光源设置 ===
  // ============================================================

  // 1. 太阳/主光（晨昏方向）
  const sunLight = new THREE.DirectionalLight(0xFFFFCC, 1.5);
  sunLight.position.set(-40, 30, -20); // 从左上方向来
  scene.add(sunLight);

  // 2. 补光（暖色，模拟晨光）
  const fillLight = new THREE.DirectionalLight(0xFFA500, 0.4);
  fillLight.position.set(20, -10, 30);
  scene.add(fillLight);

  // 3. 环境光（整体亮度）
  const ambientLight = new THREE.AmbientLight(0x8B9DC3, 0.6);
  scene.add(ambientLight);

  // 4. 天空（半球灯模拟天空）
  const skyLight = new THREE.HemisphereLight(0x87CEEB, 0x4A6FA5);
  scene.add(skyLight);

  // ============================================================
  // OrbitControls（交互）
  // ============================================================

  const controls = new THREE.OrbitControls(camera, canvas);
  controls.enableDamping = true;
  controls.dampingFactor = 0.05;
  controls.minDistance = 20;
  controls.maxDistance = 80;
  controls.target.set(0, 5, -35); // 初始目标

  // ============================================================
  // 渲染循环
  // ============================================================

  function animate() {
    requestAnimationFrame(animate);

    controls.update();
    renderer.render(scene, camera);
  }

  // ============================================================
  // 窗口尺寸调整
  // ============================================================

  window.addEventListener('resize', () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();
    renderer.setSize(window.innerWidth, window.innerHeight);
  });

  // ============================================================
  // 开始渲染
  // ============================================================

  animate();
}

// ============================================================
// 加载并运行
// ============================================================

window.addEventListener('DOMContentLoaded', () => {
  // 创建 canvas
  const canvas = document.createElement('canvas');
  canvas.style.width = '100%';
  canvas.style.height = '100%';
  canvas.id = 'canvas';

  document.body.appendChild(canvas);

  // 加载 Three.js（CDN）
  const threeScript = document.createElement('script');
  threeScript.type = 'module';

  // 动态加载 Three.js（CDN）
  const threeModule = import('https://cdn.jsdelivr.net/npm/three@0.162.0/build/three.module.js');

  threeModule.then(({
    PerspectiveCamera,
    WebGLRenderer,
    Scene,
    Color,
    BoxGeometry,
    CylinderGeometry,
    SphereGeometry,
    TorusGeometry,
    PlaneGeometry,
    MeshStandardMaterial,
    DirectionalLight,
    AmbientLight,
    HemisphereLight,
    Mesh,
    Group,
    OrbitControls,
    ACESFilmicToneMapping
  }) => {

    // 全局变量
    window.canvas = canvas;
    window.PerspectiveCamera = PerspectiveCamera;
    window.WebGLRenderer = WebGLRenderer;
    window.Scene = Scene;
    window.Color = Color;
    window.BoxGeometry = BoxGeometry;
    window.CylinderGeometry = CylinderGeometry;
    window.SphereGeometry = SphereGeometry;
    window.TorusGeometry = TorusGeometry;
    window.PlaneGeometry = PlaneGeometry;
    window.MeshStandardMaterial = MeshStandardMaterial;
    window.DirectionalLight = DirectionalLight;
    window.AmbientLight = AmbientLight;
    window.HemisphereLight = HemisphereLight;
    window.Mesh = Mesh;
    window.Group = Group;
    window.OrbitControls = OrbitControls;
    window.ACESFilmicToneMapping = ACESFilmicToneMapping;

    // 启动场景
    init();
  });

  canvas.style.width = '100%';
  canvas.style.height = '100%';
});
