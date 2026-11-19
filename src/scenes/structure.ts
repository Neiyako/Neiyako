import * as THREE from 'three/webgpu';

import { clamp, easeOutCubic, lerp } from '../utils/math';
import type { SceneInitializer } from './contracts';
import {
  disposeSceneResources,
  mountWebGPUScene,
  type SceneContent,
} from './runtime';

const BUILD_DURATION = 2.8;

interface RevealNode {
  mesh: THREE.Mesh;
  finalScale: number;
  delay: number;
  duration: number;
}

interface LineStage {
  geometry: THREE.BufferGeometry;
  segmentCount: number;
  delay: number;
  duration: number;
}

type Segment = readonly [THREE.Vector3, THREE.Vector3];

function ringPoints(
  y: number,
  radius: number,
  offset: number,
): THREE.Vector3[] {
  return Array.from({ length: 3 }, (_, index) => {
    const angle = offset + (index / 3) * Math.PI * 2;
    return new THREE.Vector3(
      Math.cos(angle) * radius,
      y,
      Math.sin(angle) * radius,
    );
  });
}

function createSegmentGeometry(segments: readonly Segment[]): THREE.BufferGeometry {
  const positions = new Float32Array(segments.length * 2 * 3);

  for (let segmentIndex = 0; segmentIndex < segments.length; segmentIndex += 1) {
    const [start, end] = segments[segmentIndex];
    const offset = segmentIndex * 6;
    positions[offset] = start.x;
    positions[offset + 1] = start.y;
    positions[offset + 2] = start.z;
    positions[offset + 3] = end.x;
    positions[offset + 4] = end.y;
    positions[offset + 5] = end.z;
  }

  const geometry = new THREE.BufferGeometry();
  geometry.setAttribute('position', new THREE.BufferAttribute(positions, 3));
  geometry.setDrawRange(0, 0);
  geometry.computeBoundingSphere();
  return geometry;
}

function createStructureContent(): SceneContent {
  const scene = new THREE.Scene();
  scene.background = null;

  const camera = new THREE.PerspectiveCamera(34, 1, 0.1, 20);
  camera.position.set(0.15, 0.18, 5.65);
  camera.lookAt(0, 0.04, 0);

  const assembly = new THREE.Group();
  scene.add(assembly);

  const bottom = ringPoints(-1.02, 1.05, Math.PI / 2);
  const middle = ringPoints(0.12, 0.71, Math.PI / 2 + Math.PI / 3);
  const apex = new THREE.Vector3(0, 1.3, 0);

  const neutralNodeMaterial = new THREE.MeshStandardNodeMaterial({
    color: 0xb9bcb3,
    roughness: 0.64,
    metalness: 0.06,
  });
  const sageNodeMaterial = new THREE.MeshStandardNodeMaterial({
    color: 0xa7b59a,
    roughness: 0.72,
    metalness: 0.02,
  });
  const neutralLineMaterial = new THREE.LineBasicNodeMaterial({
    color: 0x6e746c,
    transparent: true,
    opacity: 0.62,
    depthWrite: false,
  });
  const sageLineMaterial = new THREE.LineBasicNodeMaterial({
    color: 0x8e9e83,
    transparent: true,
    opacity: 0.7,
    depthWrite: false,
  });

  const nodeGeometry = new THREE.OctahedronGeometry(1, 0);
  const revealNodes: RevealNode[] = [];

  const addNode = (
    position: THREE.Vector3,
    radius: number,
    material: THREE.Material,
    delay: number,
  ): void => {
    const node = new THREE.Mesh(nodeGeometry, material);
    node.position.copy(position);
    node.scale.setScalar(0);
    assembly.add(node);
    revealNodes.push({
      mesh: node,
      finalScale: radius,
      delay,
      duration: 0.48,
    });
  };

  bottom.forEach((point, index) => {
    addNode(point, 0.11, neutralNodeMaterial, index * 0.09);
  });
  middle.forEach((point, index) => {
    addNode(point, 0.1, neutralNodeMaterial, 0.58 + index * 0.08);
  });
  addNode(apex, 0.145, sageNodeMaterial, 1.18);

  const baseSegments: Segment[] = [
    [bottom[0], bottom[1]],
    [bottom[1], bottom[2]],
    [bottom[2], bottom[0]],
  ];
  const connectorSegments: Segment[] = [];

  for (let index = 0; index < 3; index += 1) {
    connectorSegments.push([bottom[index], middle[index]]);
    connectorSegments.push([bottom[index], middle[(index + 1) % 3]]);
  }

  const topSegments: Segment[] = [
    [middle[0], middle[1]],
    [middle[1], middle[2]],
    [middle[2], middle[0]],
    [apex, middle[0]],
    [apex, middle[1]],
    [apex, middle[2]],
  ];

  const createStage = (
    segments: readonly Segment[],
    material: THREE.Material,
    delay: number,
    duration: number,
  ): LineStage => {
    const geometry = createSegmentGeometry(segments);
    const lines = new THREE.LineSegments(geometry, material);
    lines.frustumCulled = false;
    assembly.add(lines);
    return {
      geometry,
      segmentCount: segments.length,
      delay,
      duration,
    };
  };

  const stages: LineStage[] = [
    createStage(baseSegments, neutralLineMaterial, 0.12, 0.58),
    createStage(connectorSegments, neutralLineMaterial, 0.7, 0.9),
    createStage(topSegments, sageLineMaterial, 1.28, 0.92),
  ];

  const ambient = new THREE.AmbientLight(0xffffff, 1.5);
  const key = new THREE.DirectionalLight(0xfffdf7, 2.5);
  key.position.set(3.6, 5.5, 4.3);
  const fill = new THREE.DirectionalLight(0xdde7d9, 0.62);
  fill.position.set(-3.5, 1.4, 2.6);
  scene.add(ambient, key, key.target, fill);

  const finish = (): void => {
    assembly.rotation.y = 0.06;
    assembly.rotation.z = 0;
    assembly.position.y = 0;

    for (const node of revealNodes) {
      node.mesh.scale.setScalar(node.finalScale);
    }

    for (const stage of stages) {
      stage.geometry.setDrawRange(0, stage.segmentCount * 2);
    }
  };

  return {
    scene,
    camera,
    update(_delta, elapsed): boolean {
      const settle = easeOutCubic(clamp(elapsed / 2.68, 0, 1));
      assembly.rotation.y = lerp(-0.32, 0.06, settle);
      assembly.rotation.z = lerp(0.028, 0, settle);
      assembly.position.y = lerp(-0.08, 0, settle);

      for (const node of revealNodes) {
        const progress = easeOutCubic(
          clamp((elapsed - node.delay) / node.duration, 0, 1),
        );
        node.mesh.scale.setScalar(node.finalScale * progress);
      }

      for (const stage of stages) {
        const progress = easeOutCubic(
          clamp((elapsed - stage.delay) / stage.duration, 0, 1),
        );
        stage.geometry.setDrawRange(
          0,
          Math.floor(stage.segmentCount * 2 * progress),
        );
      }

      if (elapsed >= BUILD_DURATION) {
        finish();
        return false;
      }

      return true;
    },
    dispose(): void {
      disposeSceneResources(scene);
      scene.clear();
    },
  };
}

export const createStructureScene: SceneInitializer = (canvas, options) =>
  mountWebGPUScene(canvas, options, () => createStructureContent());
