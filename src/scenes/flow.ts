import * as THREE from 'three/webgpu';

import { createSeededRandom, lerp } from '../utils/math';
import type { SceneInitializer } from './contracts';
import {
  disposeSceneResources,
  mountWebGPUScene,
  type SceneContent,
} from './runtime';

export const FLOW_PARTICLE_COUNTS = {
  desktop: 156,
  compact: 60,
} as const;

export const FLOW_CURVE_COUNTS = {
  desktop: 16,
  compact: 9,
} as const;

const PAPER = 0xf6f5f1;
const UP = new THREE.Vector3(0, 1, 0);

interface Particle {
  curve: THREE.CatmullRomCurve3;
  offset: number;
  speed: number;
  scale: number;
}

function createFlowContent(
  options: { compact: boolean },
): SceneContent {
  const scene = new THREE.Scene();
  scene.background = null;
  scene.fog = new THREE.Fog(PAPER, 6.4, 12);

  const camera = new THREE.PerspectiveCamera(options.compact ? 42 : 38, 1, 0.1, 30);
  camera.position.set(0, 0.95, 7.15);
  camera.lookAt(0, 0, 0);

  const random = createSeededRandom(0x71c0ffee);
  const curveCount = options.compact
    ? FLOW_CURVE_COUNTS.compact
    : FLOW_CURVE_COUNTS.desktop;
  const particleCount = options.compact
    ? FLOW_PARTICLE_COUNTS.compact
    : FLOW_PARTICLE_COUNTS.desktop;

  const curves: THREE.CatmullRomCurve3[] = [];

  for (let curveIndex = 0; curveIndex < curveCount; curveIndex += 1) {
    const lane = curveIndex / (curveCount - 1);
    const laneY = lerp(-1.16, 1.16, lane) + (random() - 0.5) * 0.18;
    const laneZ = lerp(-1.3, 1.28, (curveIndex * 7) % curveCount / Math.max(curveCount - 1, 1))
      + (random() - 0.5) * 0.22;
    const phase = random() * Math.PI * 2;
    const points: THREE.Vector3[] = [];

    for (let pointIndex = 0; pointIndex < 7; pointIndex += 1) {
      const progress = pointIndex / 6;
      const envelope = 0.68 + Math.sin(progress * Math.PI) * 0.32;
      const x = lerp(-4.35, 4.35, progress);
      const y = laneY
        + Math.sin(progress * Math.PI * 1.65 + phase) * 0.34 * envelope
        + Math.sin(progress * Math.PI * 2 + phase * 1.7) * 0.1;
      const z = laneZ
        + Math.cos(progress * Math.PI * 1.3 + phase * 0.83) * 0.42;

      points.push(new THREE.Vector3(x, y, z));
    }

    curves.push(new THREE.CatmullRomCurve3(points, false, 'catmullrom', 0.42));
  }

  const trajectoryMaterial = new THREE.LineBasicNodeMaterial({
    color: 0x969a91,
    transparent: true,
    opacity: 0.16,
    depthWrite: false,
  });
  const trajectoryGroup = new THREE.Group();

  for (const curve of curves) {
    const points = curve.getPoints(46);
    const geometry = new THREE.BufferGeometry().setFromPoints(points);
    const line = new THREE.Line(geometry, trajectoryMaterial);
    line.frustumCulled = false;
    trajectoryGroup.add(line);
  }

  scene.add(trajectoryGroup);

  const particleGeometry = new THREE.OctahedronGeometry(0.044, 0);
  const particleMaterial = new THREE.MeshStandardNodeMaterial({
    color: 0xffffff,
    roughness: 0.66,
    metalness: 0.02,
    transparent: true,
    opacity: 0.92,
    vertexColors: true,
  });
  const particleMesh = new THREE.InstancedMesh(
    particleGeometry,
    particleMaterial,
    particleCount,
  );
  particleMesh.instanceMatrix.setUsage(THREE.DynamicDrawUsage);
  particleMesh.frustumCulled = false;
  particleMesh.castShadow = false;
  particleMesh.receiveShadow = false;

  const particles: Particle[] = [];
  const neutralColor = new THREE.Color(0x7f857c);
  const softColor = new THREE.Color(0xb7b9b1);
  const sageColor = new THREE.Color(0xa7b59a);

  for (let index = 0; index < particleCount; index += 1) {
    const curve = curves[index % curves.length];
    const particle: Particle = {
      curve,
      offset: random(),
      speed: 0.038 + random() * 0.031,
      scale: 0.72 + random() * 0.62,
    };

    particles.push(particle);

    const color = index % 13 === 0
      ? sageColor
      : index % 5 === 0
        ? softColor
        : neutralColor;
    particleMesh.setColorAt(index, color);
  }

  if (particleMesh.instanceColor) {
    particleMesh.instanceColor.needsUpdate = true;
  }

  scene.add(particleMesh);

  const ambient = new THREE.AmbientLight(0xffffff, 1.45);
  const key = new THREE.DirectionalLight(0xfffdf6, 2.15);
  key.position.set(3.4, 5.2, 4.2);
  scene.add(ambient, key, key.target);

  const tempPoint = new THREE.Vector3();
  const tempTangent = new THREE.Vector3();
  const tempQuaternion = new THREE.Quaternion();
  const tempScale = new THREE.Vector3();
  const tempMatrix = new THREE.Matrix4();

  const updateParticles = (elapsed: number): void => {
    for (let index = 0; index < particles.length; index += 1) {
      const particle = particles[index];
      const progress = (particle.offset + elapsed * particle.speed) % 1;

      particle.curve.getPointAt(progress, tempPoint);
      particle.curve.getTangentAt(progress, tempTangent);
      tempTangent.normalize();
      tempQuaternion.setFromUnitVectors(UP, tempTangent);

      const depthScale = 0.88 + (tempPoint.z + 1.5) * 0.055;
      tempScale.setScalar(particle.scale * depthScale);
      tempMatrix.compose(tempPoint, tempQuaternion, tempScale);
      particleMesh.setMatrixAt(index, tempMatrix);
    }

    particleMesh.instanceMatrix.needsUpdate = true;
  };

  updateParticles(0);

  return {
    scene,
    camera,
    update(_delta, elapsed): boolean {
      updateParticles(elapsed);
      return true;
    },
    dispose(): void {
      disposeSceneResources(scene);
      scene.clear();
    },
  };
}

export const createFlowScene: SceneInitializer = (canvas, options) =>
  mountWebGPUScene(canvas, options, () => createFlowContent(options));
