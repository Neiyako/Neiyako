import * as THREE from 'three/webgpu';

import { clamp, easeOutCubic, lerp } from '../utils/math';
import type { SceneInitializer } from './contracts';
import {
  disposeSceneResources,
  mountWebGPUScene,
  type SceneContent,
} from './runtime';

const NEUTRAL = 0xd7d7cf;
const NEUTRAL_DARK = 0x7d827a;
const SAGE = 0xa7b59a;

const Z_AXIS = new THREE.Vector3(0, 0, 1);

interface RevealItem {
  object: THREE.Object3D;
  fromPosition: THREE.Vector3;
  targetPosition: THREE.Vector3;
  fromScale: number;
  targetScale: number;
  delay: number;
  duration: number;
}

function addBeam(
  parent: THREE.Object3D,
  start: THREE.Vector3,
  end: THREE.Vector3,
  thickness: number,
  geometry: THREE.BoxGeometry,
  material: THREE.Material,
): THREE.Mesh {
  const direction = end.clone().sub(start);
  const beam = new THREE.Mesh(geometry, material);

  beam.position.copy(start).add(end).multiplyScalar(0.5);
  beam.quaternion.setFromUnitVectors(Z_AXIS, direction.clone().normalize());
  beam.scale.set(thickness, thickness, direction.length());
  beam.castShadow = true;
  beam.receiveShadow = true;
  parent.add(beam);

  return beam;
}

function createKineticContent(canvas: HTMLCanvasElement): SceneContent {
  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(40, 1, 0.1, 30);
  camera.position.set(0, 0.28, 7.25);
  camera.lookAt(0, 0.02, 0);

  const boxGeometry = new THREE.BoxGeometry(1, 1, 1);
  const nodeGeometry = new THREE.OctahedronGeometry(1, 0);
  const ringGeometry = new THREE.TorusGeometry(1, 0.075, 8, 36);
  const groundGeometry = new THREE.CircleGeometry(3.15, 64);

  const frameMaterial = new THREE.MeshStandardNodeMaterial({
    color: NEUTRAL,
    roughness: 0.72,
    metalness: 0.04,
  });
  const panelMaterial = new THREE.MeshStandardNodeMaterial({
    color: 0xeeece5,
    roughness: 0.9,
    metalness: 0,
  });
  const darkMaterial = new THREE.MeshStandardNodeMaterial({
    color: NEUTRAL_DARK,
    roughness: 0.68,
    metalness: 0.1,
  });
  const sageMaterial = new THREE.MeshStandardNodeMaterial({
    color: SAGE,
    roughness: 0.76,
    metalness: 0.02,
  });
  const groundMaterial = new THREE.MeshStandardNodeMaterial({
    color: 0xefede7,
    roughness: 1,
    metalness: 0,
  });

  const createNode = (
    position: THREE.Vector3,
    radius: number,
    material: THREE.Material,
  ): THREE.Mesh => {
    const node = new THREE.Mesh(nodeGeometry, material);
    node.position.copy(position);
    node.scale.setScalar(radius);
    node.castShadow = true;
    node.receiveShadow = true;
    return node;
  };

  const createModule = (
    width: number,
    height: number,
    frameWidth: number,
  ): THREE.Group => {
    const module = new THREE.Group();
    const halfWidth = width * 0.5;
    const halfHeight = height * 0.5;

    addBeam(
      module,
      new THREE.Vector3(-halfWidth, -halfHeight, 0),
      new THREE.Vector3(halfWidth, -halfHeight, 0),
      frameWidth,
      boxGeometry,
      frameMaterial,
    );
    addBeam(
      module,
      new THREE.Vector3(halfWidth, -halfHeight, 0),
      new THREE.Vector3(halfWidth, halfHeight, 0),
      frameWidth,
      boxGeometry,
      frameMaterial,
    );
    addBeam(
      module,
      new THREE.Vector3(halfWidth, halfHeight, 0),
      new THREE.Vector3(-halfWidth, halfHeight, 0),
      frameWidth,
      boxGeometry,
      frameMaterial,
    );
    addBeam(
      module,
      new THREE.Vector3(-halfWidth, halfHeight, 0),
      new THREE.Vector3(-halfWidth, -halfHeight, 0),
      frameWidth,
      boxGeometry,
      frameMaterial,
    );

    const panel = new THREE.Mesh(boxGeometry, panelMaterial);
    panel.scale.set(width * 0.6, height * 0.48, 0.045);
    panel.position.z = -0.035;
    panel.castShadow = true;
    panel.receiveShadow = true;
    module.add(panel);

    const ring = new THREE.Mesh(ringGeometry, sageMaterial);
    const ringRadius = Math.min(width, height) * 0.205;
    ring.scale.setScalar(ringRadius);
    ring.position.z = 0.04;
    ring.castShadow = true;
    module.add(ring);

    const cornerRadius = frameWidth * 1.2;
    for (const x of [-halfWidth, halfWidth]) {
      for (const y of [-halfHeight, halfHeight]) {
        module.add(
          createNode(
            new THREE.Vector3(x, y, 0.015),
            cornerRadius,
            darkMaterial,
          ),
        );
      }
    }

    return module;
  };

  const revealItems: RevealItem[] = [];
  const registerReveal = (
    object: THREE.Object3D,
    delay: number,
    duration: number,
    fromScale: number,
    initialPosition = object.position,
  ): void => {
    const targetPosition = object.position.clone();
    object.position.copy(initialPosition);
    object.scale.setScalar(fromScale);
    revealItems.push({
      object,
      fromPosition: initialPosition.clone(),
      targetPosition,
      fromScale,
      targetScale: 1,
      delay,
      duration,
    });
  };

  const pointerRig = new THREE.Group();
  const spinner = new THREE.Group();
  const assembly = new THREE.Group();

  pointerRig.add(spinner);
  spinner.add(assembly);
  scene.add(pointerRig);

  spinner.position.y = 0.04;
  spinner.rotation.set(-0.08, 0.22, -0.025);
  spinner.scale.setScalar(0.98);

  const core = createModule(1.82, 1.82, 0.06);
  core.rotation.z = 0.035;
  assembly.add(core);
  registerReveal(core, 0, 0.82, 0.82);

  addBeam(
    core,
    new THREE.Vector3(-0.78, 0.72, 0.07),
    new THREE.Vector3(0.72, -0.7, 0.07),
    0.028,
    boxGeometry,
    sageMaterial,
  );

  const leftModule = createModule(1.04, 1.34, 0.052);
  leftModule.position.set(-1.57, 0.67, 0.21);
  leftModule.rotation.set(0.04, -0.34, 0.17);
  assembly.add(leftModule);
  registerReveal(
    leftModule,
    0.48,
    0.72,
    0.68,
    leftModule.position.clone().multiplyScalar(0.52).add(new THREE.Vector3(0, 0.12, 0)),
  );

  const rightModule = createModule(1.16, 0.94, 0.05);
  rightModule.position.set(1.54, -0.59, -0.28);
  rightModule.rotation.set(-0.06, 0.33, -0.17);
  assembly.add(rightModule);
  registerReveal(
    rightModule,
    0.76,
    0.72,
    0.66,
    rightModule.position.clone().multiplyScalar(0.5).add(new THREE.Vector3(0, 0.1, 0)),
  );

  const crownModule = createModule(0.82, 0.82, 0.048);
  crownModule.position.set(0.38, 1.46, -0.43);
  crownModule.rotation.set(0.12, 0.2, -0.11);
  assembly.add(crownModule);
  registerReveal(
    crownModule,
    1.02,
    0.7,
    0.62,
    crownModule.position.clone().multiplyScalar(0.55).add(new THREE.Vector3(0, 0.08, 0)),
  );

  const createConnector = (
    from: THREE.Vector3,
    to: THREE.Vector3,
    accent: boolean,
    delay: number,
  ): void => {
    const connector = new THREE.Group();
    addBeam(
      connector,
      from,
      to,
      accent ? 0.052 : 0.044,
      boxGeometry,
      accent ? sageMaterial : darkMaterial,
    );
    connector.add(createNode(from, 0.085, darkMaterial));
    connector.add(createNode(to, 0.075, accent ? sageMaterial : darkMaterial));
    assembly.add(connector);
    registerReveal(connector, delay, 0.66, 0.42);
  };

  createConnector(
    new THREE.Vector3(-0.72, 0.35, 0.03),
    new THREE.Vector3(-1.24, 0.57, 0.16),
    false,
    0.55,
  );
  createConnector(
    new THREE.Vector3(-0.64, -0.26, 0.03),
    new THREE.Vector3(-1.18, 0.37, 0.13),
    true,
    0.63,
  );
  createConnector(
    new THREE.Vector3(0.67, -0.16, 0.02),
    new THREE.Vector3(1.21, -0.38, -0.2),
    false,
    0.82,
  );
  createConnector(
    new THREE.Vector3(0.67, 0.22, 0.02),
    new THREE.Vector3(1.32, -0.17, -0.23),
    true,
    0.9,
  );
  createConnector(
    new THREE.Vector3(0.18, 0.79, -0.02),
    new THREE.Vector3(0.33, 1.18, -0.34),
    false,
    1.08,
  );
  createConnector(
    new THREE.Vector3(0.64, 0.54, -0.03),
    new THREE.Vector3(0.49, 1.07, -0.34),
    true,
    1.16,
  );

  const ground = new THREE.Mesh(groundGeometry, groundMaterial);
  ground.rotation.x = -Math.PI / 2;
  ground.position.set(0, -2.14, -0.1);
  ground.receiveShadow = true;
  scene.add(ground);

  const ambient = new THREE.AmbientLight(0xffffff, 1.35);
  const key = new THREE.DirectionalLight(0xfffdf7, 2.75);
  key.position.set(4.2, 5.8, 5.2);
  key.castShadow = true;
  key.shadow.mapSize.set(1024, 1024);
  key.shadow.camera.left = -4;
  key.shadow.camera.right = 4;
  key.shadow.camera.top = 4;
  key.shadow.camera.bottom = -4;
  key.shadow.camera.near = 0.5;
  key.shadow.camera.far = 16;
  key.shadow.bias = -0.00035;
  key.shadow.normalBias = 0.025;

  const fill = new THREE.DirectionalLight(0xdde7d9, 0.78);
  fill.position.set(-4.2, 1.8, 3.4);

  scene.add(ambient, key, key.target, fill);

  let pointerTargetX = 0;
  let pointerTargetY = 0;
  let pointerCurrentX = 0;
  let pointerCurrentY = 0;

  const handlePointerMove = (event: PointerEvent): void => {
    const rect = canvas.getBoundingClientRect();
    if (rect.width === 0 || rect.height === 0) return;

    pointerTargetX = clamp(
      ((event.clientX - rect.left) / rect.width) * 2 - 1,
      -1,
      1,
    );
    pointerTargetY = clamp(
      ((event.clientY - rect.top) / rect.height) * 2 - 1,
      -1,
      1,
    );
  };

  const handlePointerLeave = (): void => {
    pointerTargetX = 0;
    pointerTargetY = 0;
  };

  canvas.addEventListener('pointermove', handlePointerMove, { passive: true });
  canvas.addEventListener('pointerleave', handlePointerLeave);
  canvas.addEventListener('pointercancel', handlePointerLeave);

  return {
    scene,
    camera,
    update(delta, elapsed): boolean {
      spinner.rotation.y = 0.22 + elapsed * 0.072;

      const pointerDamping = 1 - Math.exp(-delta * 4.8);
      pointerCurrentX = lerp(pointerCurrentX, pointerTargetX, pointerDamping);
      pointerCurrentY = lerp(pointerCurrentY, pointerTargetY, pointerDamping);
      pointerRig.rotation.y = pointerCurrentX * 0.09;
      pointerRig.rotation.x = -pointerCurrentY * 0.055;

      for (const item of revealItems) {
        const progress = easeOutCubic(
          clamp((elapsed - item.delay) / item.duration, 0, 1),
        );
        item.object.position.lerpVectors(
          item.fromPosition,
          item.targetPosition,
          progress,
        );
        item.object.scale.setScalar(
          lerp(item.fromScale, item.targetScale, progress),
        );
      }

      return true;
    },
    dispose(): void {
      canvas.removeEventListener('pointermove', handlePointerMove);
      canvas.removeEventListener('pointerleave', handlePointerLeave);
      canvas.removeEventListener('pointercancel', handlePointerLeave);
      disposeSceneResources(scene);
      scene.clear();
    },
  };
}

export const createKineticScene: SceneInitializer = (canvas, options) =>
  mountWebGPUScene(canvas, options, () => createKineticContent(canvas));
