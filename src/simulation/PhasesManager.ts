import * as THREE from 'three';
import { soundManager } from './audio';
import { BackpackItem } from './GameEngine';

export interface CourseCollectible {
  id: string;
  name: string;
  category: 'brinquedo' | 'comida' | 'roupa';
  price: number;
  icon: string;
  description: string;
  position: THREE.Vector3;
  mesh: THREE.Group;
  collected: boolean;
  phase: 1 | 2 | 3;
}

export interface PhaseDiamond {
  id: number;
  position: THREE.Vector3;
  mesh: THREE.Group;
  collected: boolean;
}

export interface PhaseAvaritia {
  id: number;
  position: THREE.Vector3;
  mesh: THREE.Group;
  collected: boolean;
}

/**
 * Procedural Light Tube (Tubo de Luz / Portal de Teletransporte)
 */
export class LightTube {
  public group: THREE.Group;
  private outerBeam: THREE.Mesh;
  private innerCore: THREE.Mesh;
  private rings: THREE.Mesh[] = [];
  private baseDais: THREE.Group;
  private light: THREE.PointLight;
  private billboard: THREE.Sprite;
  private active = false;
  private position = new THREE.Vector3(0, 0, 0);

  constructor() {
    this.group = new THREE.Group();
    this.group.visible = false;

    // 1. Feixe de Luz Exterior Translúcido
    const outerGeo = new THREE.CylinderGeometry(2.4, 2.4, 38, 32, 1, true);
    const outerMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      transparent: true,
      opacity: 0.55,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.outerBeam = new THREE.Mesh(outerGeo, outerMat);
    this.outerBeam.position.y = 19;
    this.group.add(this.outerBeam);

    // 2. Núcleo Interno Super Brilhante
    const innerGeo = new THREE.CylinderGeometry(0.9, 0.9, 38, 24, 1, true);
    const innerMat = new THREE.MeshBasicMaterial({
      color: 0xffffff,
      transparent: true,
      opacity: 0.85,
      side: THREE.DoubleSide,
      blending: THREE.AdditiveBlending,
      depthWrite: false,
    });
    this.innerCore = new THREE.Mesh(innerGeo, innerMat);
    this.innerCore.position.y = 19;
    this.group.add(this.innerCore);

    // 3. Anéis Luminosos que Flutuam para Cima
    const ringGeo = new THREE.TorusGeometry(2.25, 0.12, 16, 32);
    const ringMat = new THREE.MeshBasicMaterial({
      color: 0xfacc15,
      transparent: true,
      opacity: 0.9,
      blending: THREE.AdditiveBlending,
    });

    for (let i = 0; i < 6; i++) {
      const ring = new THREE.Mesh(ringGeo, ringMat);
      ring.rotation.x = Math.PI / 2;
      ring.position.y = (i / 6) * 36;
      this.rings.push(ring);
      this.group.add(ring);
    }

    // 4. Base do Portal com Degraus e Runas de Energia
    this.baseDais = new THREE.Group();
    const daisGeo = new THREE.CylinderGeometry(3.2, 3.5, 0.4, 32);
    const daisMat = new THREE.MeshStandardMaterial({
      color: 0x1e293b,
      roughness: 0.3,
      metalness: 0.8,
    });
    const daisMesh = new THREE.Mesh(daisGeo, daisMat);
    daisMesh.position.y = 0.2;
    this.baseDais.add(daisMesh);

    // Runa Circular de Energia no Chão
    const runeGeo = new THREE.RingGeometry(0.8, 3.1, 32);
    const runeMat = new THREE.MeshBasicMaterial({
      color: 0x38bdf8,
      side: THREE.DoubleSide,
      transparent: true,
      opacity: 0.8,
      blending: THREE.AdditiveBlending,
    });
    const runeMesh = new THREE.Mesh(runeGeo, runeMat);
    runeMesh.rotation.x = -Math.PI / 2;
    runeMesh.position.y = 0.42;
    this.baseDais.add(runeMesh);

    this.group.add(this.baseDais);

    // 5. Fonte de Luz Emissiva Dinâmica
    this.light = new THREE.PointLight(0x38bdf8, 5, 24);
    this.light.position.y = 3;
    this.group.add(this.light);

    // 6. Placa Holográfica 3D Indicando "TUBO DE LUZ"
    this.billboard = this.createLabelSprite('✨ TUBO DE LUZ ✨\nENTRE AQUI!');
    this.billboard.position.y = 4.8;
    this.group.add(this.billboard);
  }

  private createLabelSprite(text: string): THREE.Sprite {
    const canvas = document.createElement('canvas');
    canvas.width = 512;
    canvas.height = 256;
    const ctx = canvas.getContext('2d');
    if (ctx) {
      ctx.fillStyle = 'rgba(15, 23, 42, 0.85)';
      ctx.strokeStyle = '#facc15';
      ctx.lineWidth = 8;
      ctx.beginPath();
      ctx.roundRect(16, 16, 480, 224, 32);
      ctx.fill();
      ctx.stroke();

      ctx.fillStyle = '#fef08a';
      ctx.font = 'bold 44px sans-serif';
      ctx.textAlign = 'center';
      ctx.textBaseline = 'middle';
      const lines = text.split('\n');
      if (lines.length === 2) {
        ctx.fillText(lines[0], 256, 90);
        ctx.fillStyle = '#38bdf8';
        ctx.font = 'bold 36px sans-serif';
        ctx.fillText(lines[1], 256, 160);
      } else {
        ctx.fillText(text, 256, 128);
      }
    }

    const tex = new THREE.CanvasTexture(canvas);
    tex.colorSpace = THREE.SRGBColorSpace;
    const spriteMat = new THREE.SpriteMaterial({
      map: tex,
      transparent: true,
      depthTest: false,
    });
    const sprite = new THREE.Sprite(spriteMat);
    sprite.scale.set(5.5, 2.75, 1);
    return sprite;
  }

  public show(pos: THREE.Vector3, color: number = 0x38bdf8) {
    this.position.copy(pos);
    this.group.position.copy(pos);
    this.group.visible = true;
    this.active = true;

    // Atualiza cor do feixe
    (this.outerBeam.material as THREE.MeshBasicMaterial).color.setHex(color);
    this.light.color.setHex(color);
  }

  public hide() {
    this.group.visible = false;
    this.active = false;
  }

  public isActive(): boolean {
    return this.active;
  }

  public getPosition(): THREE.Vector3 {
    return this.position;
  }

  public update(delta: number, timeSec: number) {
    if (!this.active) return;

    // Rotação suave do feixe
    this.outerBeam.rotation.y += delta * 0.8;
    this.innerCore.rotation.y -= delta * 1.2;

    // Movimento ascendente contínuo dos anéis de luz
    for (let i = 0; i < this.rings.length; i++) {
      const ring = this.rings[i];
      ring.position.y += delta * 9.0;
      if (ring.position.y > 36) {
        ring.position.y = 0.5;
      }
      ring.rotation.z += delta * 1.5;
    }

    // Rotação do disco da base
    this.baseDais.children[1].rotation.z += delta * 1.2;

    // Pulsação suave da luz e do billboard
    this.light.intensity = 4.5 + Math.sin(timeSec * 5) * 1.5;
    this.billboard.position.y = 4.8 + Math.sin(timeSec * 3) * 0.3;
  }
}

/**
 * Gerador de Itens de Percurso (Objetos 3D para Guardar na Mochila)
 */
export function createCourseCollectibleMesh(type: string): THREE.Group {
  const group = new THREE.Group();

  switch (type) {
    case 'maca_dourada': {
      // 🍎 Maçã Dourada Mágica
      const appleGeo = new THREE.SphereGeometry(0.42, 24, 24);
      const appleMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.2,
        metalness: 0.6,
        emissive: 0xd97706,
        emissiveIntensity: 0.4,
      });
      const apple = new THREE.Mesh(appleGeo, appleMat);
      apple.position.y = 0.42;
      group.add(apple);

      // Cabinho
      const stemGeo = new THREE.CylinderGeometry(0.03, 0.04, 0.2, 8);
      const stemMat = new THREE.MeshStandardMaterial({ color: 0x451a03 });
      const stem = new THREE.Mesh(stemGeo, stemMat);
      stem.position.set(0, 0.85, 0);
      stem.rotation.z = 0.2;
      group.add(stem);

      // Folha verde
      const leafGeo = new THREE.BoxGeometry(0.18, 0.02, 0.12);
      const leafMat = new THREE.MeshStandardMaterial({ color: 0x22c55e });
      const leaf = new THREE.Mesh(leafGeo, leafMat);
      leaf.position.set(0.1, 0.86, 0);
      leaf.rotation.z = 0.4;
      group.add(leaf);
      break;
    }

    case 'suco_turbo': {
      // 🧃 Caixinha de Suco Turbo
      const boxGeo = new THREE.BoxGeometry(0.45, 0.65, 0.35);
      const boxMat = new THREE.MeshStandardMaterial({
        color: 0xec4899,
        roughness: 0.3,
        metalness: 0.2,
      });
      const box = new THREE.Mesh(boxGeo, boxMat);
      box.position.y = 0.45;
      group.add(box);

      // Canudinho
      const strawGeo = new THREE.CylinderGeometry(0.03, 0.03, 0.35, 8);
      const strawMat = new THREE.MeshStandardMaterial({ color: 0xfacc15 });
      const straw = new THREE.Mesh(strawGeo, strawMat);
      straw.position.set(0.1, 0.85, 0);
      straw.rotation.z = -0.3;
      group.add(straw);
      break;
    }

    case 'chave_dourada': {
      // 🔧 Chave Inglesa Dourada da Oficina
      const handleGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.7, 12);
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        roughness: 0.2,
        metalness: 0.85,
        emissive: 0xb45309,
        emissiveIntensity: 0.3,
      });
      const handle = new THREE.Mesh(handleGeo, goldMat);
      handle.position.y = 0.45;
      group.add(handle);

      const headGeo = new THREE.BoxGeometry(0.3, 0.25, 0.1);
      const head = new THREE.Mesh(headGeo, goldMat);
      head.position.set(0, 0.82, 0);
      group.add(head);
      break;
    }

    case 'mini_carrinho': {
      // 🏎️ Mini Carrinho de Brinquedo
      const bodyGeo = new THREE.BoxGeometry(0.65, 0.22, 0.38);
      const bodyMat = new THREE.MeshStandardMaterial({
        color: 0xef4444,
        roughness: 0.15,
        metalness: 0.6,
      });
      const body = new THREE.Mesh(bodyGeo, bodyMat);
      body.position.y = 0.35;
      group.add(body);

      // Cabine
      const cabGeo = new THREE.BoxGeometry(0.35, 0.2, 0.34);
      const cabMat = new THREE.MeshStandardMaterial({ color: 0x38bdf8 });
      const cab = new THREE.Mesh(cabGeo, cabMat);
      cab.position.set(-0.05, 0.52, 0);
      group.add(cab);

      // Rodinhas
      const wheelGeo = new THREE.CylinderGeometry(0.1, 0.1, 0.08, 12);
      const wheelMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.8 });
      const w1 = new THREE.Mesh(wheelGeo, wheelMat);
      w1.rotation.x = Math.PI / 2;
      w1.position.set(0.2, 0.22, 0.2);
      const w2 = w1.clone();
      w2.position.set(-0.2, 0.22, 0.2);
      const w3 = w1.clone();
      w3.position.set(0.2, 0.22, -0.2);
      const w4 = w1.clone();
      w4.position.set(-0.2, 0.22, -0.2);
      group.add(w1, w2, w3, w4);
      break;
    }

    case 'cristal_bolso': {
      // 💎 Cristal Raro de Bolso
      const crystalGeo = new THREE.OctahedronGeometry(0.4, 0);
      const crystalMat = new THREE.MeshStandardMaterial({
        color: 0x06b6d4,
        roughness: 0.1,
        metalness: 0.8,
        emissive: 0x0891b2,
        emissiveIntensity: 0.7,
      });
      const crystal = new THREE.Mesh(crystalGeo, crystalMat);
      crystal.position.y = 0.45;
      group.add(crystal);
      break;
    }

    case 'estrela_cosmica': {
      // ⭐ Estrela Cósmica Mágica
      const starGeo = new THREE.DodecahedronGeometry(0.38, 0);
      const starMat = new THREE.MeshStandardMaterial({
        color: 0xfacc15,
        roughness: 0.2,
        metalness: 0.7,
        emissive: 0xeab308,
        emissiveIntensity: 0.6,
      });
      const star = new THREE.Mesh(starGeo, starMat);
      star.position.y = 0.45;
      group.add(star);
      break;
    }

    case 'amuleto_ouro': {
      // 📿 Amuleto Dourado Ancestral
      const discGeo = new THREE.CylinderGeometry(0.35, 0.35, 0.08, 24);
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xf59e0b,
        roughness: 0.2,
        metalness: 0.9,
        emissive: 0xb45309,
        emissiveIntensity: 0.5,
      });
      const disc = new THREE.Mesh(discGeo, goldMat);
      disc.position.y = 0.45;
      disc.rotation.x = Math.PI / 4;
      group.add(disc);
      break;
    }

    case 'calice_sagrado': {
      // 🏆 Cálice de Ouro Real
      const baseGeo = new THREE.CylinderGeometry(0.2, 0.25, 0.08, 16);
      const goldMat = new THREE.MeshStandardMaterial({
        color: 0xfbbf24,
        roughness: 0.15,
        metalness: 0.9,
        emissive: 0xd97706,
        emissiveIntensity: 0.4,
      });
      const base = new THREE.Mesh(baseGeo, goldMat);
      base.position.y = 0.1;
      group.add(base);

      const stemGeo = new THREE.CylinderGeometry(0.06, 0.06, 0.35, 12);
      const stem = new THREE.Mesh(stemGeo, goldMat);
      stem.position.y = 0.3;
      group.add(stem);

      const cupGeo = new THREE.CylinderGeometry(0.3, 0.15, 0.35, 16);
      const cup = new THREE.Mesh(cupGeo, goldMat);
      cup.position.y = 0.6;
      group.add(cup);
      break;
    }

    default: {
      // Caixa de Presente Colecionável
      const giftGeo = new THREE.BoxGeometry(0.5, 0.5, 0.5);
      const giftMat = new THREE.MeshStandardMaterial({
        color: 0xa855f7,
        roughness: 0.3,
        metalness: 0.4,
        emissive: 0x7e22ce,
        emissiveIntensity: 0.4,
      });
      const gift = new THREE.Mesh(giftGeo, giftMat);
      gift.position.y = 0.45;
      group.add(gift);
      break;
    }
  }

  // Halo luminoso suave abaixo do item
  const ringGeo = new THREE.RingGeometry(0.15, 0.55, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0xfacc15,
    side: THREE.DoubleSide,
    transparent: true,
    opacity: 0.65,
    blending: THREE.AdditiveBlending,
  });
  const halo = new THREE.Mesh(ringGeo, ringMat);
  halo.rotation.x = -Math.PI / 2;
  halo.position.y = 0.05;
  group.add(halo);

  return group;
}

/**
 * Construtor do Diamante Mágico 3D da Fase 2
 */
export function createDiamond3DMesh(): THREE.Group {
  const group = new THREE.Group();

  // Faceta Superior do Diamante (Pirâmide Truncada/Coroa)
  const topGeo = new THREE.ConeGeometry(0.7, 0.45, 8);
  const diamondMat = new THREE.MeshStandardMaterial({
    color: 0x38bdf8,
    emissive: 0x0284c7,
    emissiveIntensity: 0.8,
    roughness: 0.05,
    metalness: 0.95,
    transparent: true,
    opacity: 0.92,
  });
  const topMesh = new THREE.Mesh(topGeo, diamondMat);
  topMesh.position.y = 0.7;
  group.add(topMesh);

  // Faceta Inferior do Diamante (Cone Pontiagudo/Pavilhão)
  const btmGeo = new THREE.ConeGeometry(0.7, 0.85, 8);
  const btmMesh = new THREE.Mesh(btmGeo, diamondMat);
  btmMesh.rotation.x = Math.PI;
  btmMesh.position.y = 0.05;
  group.add(btmMesh);

  // Anel de Brilho Estelar
  const ringGeo = new THREE.TorusGeometry(0.85, 0.05, 12, 24);
  const ringMat = new THREE.MeshBasicMaterial({
    color: 0x67e8f9,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  ring.rotation.x = Math.PI / 2;
  ring.position.y = 0.45;
  group.add(ring);

  // Luz Pontual Ciano
  const light = new THREE.PointLight(0x38bdf8, 2.5, 6);
  light.position.y = 0.45;
  group.add(light);

  return group;
}

/**
 * Construtor da Relíquia de Avaritia 3D da Fase 3
 */
export function createAvaritia3DMesh(): THREE.Group {
  const group = new THREE.Group();

  // Orbe Central Icosaedro Dourado de Avaritia
  const orbGeo = new THREE.IcosahedronGeometry(0.65, 0);
  const goldMat = new THREE.MeshStandardMaterial({
    color: 0xfbbf24,
    emissive: 0xd97706,
    emissiveIntensity: 0.9,
    roughness: 0.1,
    metalness: 0.9,
  });
  const orb = new THREE.Mesh(orbGeo, goldMat);
  orb.position.y = 0.65;
  group.add(orb);

  // Anel Orbital 1 (Eixo X)
  const ringGeo1 = new THREE.TorusGeometry(1.05, 0.07, 16, 32);
  const ringMat1 = new THREE.MeshBasicMaterial({
    color: 0xf59e0b,
    transparent: true,
    opacity: 0.85,
    blending: THREE.AdditiveBlending,
  });
  const ring1 = new THREE.Mesh(ringGeo1, ringMat1);
  ring1.position.y = 0.65;
  ring1.name = 'ring1';
  group.add(ring1);

  // Anel Orbital 2 (Eixo Y/Z)
  const ring2 = ring1.clone();
  ring2.rotation.x = Math.PI / 3;
  ring2.name = 'ring2';
  group.add(ring2);

  // Luz Dourada
  const light = new THREE.PointLight(0xf59e0b, 3.2, 8);
  light.position.y = 0.65;
  group.add(light);

  return group;
}

/**
 * Gerenciador de Fases (Phase 1: Cidade, Phase 2: Diamantes, Phase 3: Avaritia)
 */
export class PhasesManager {
  private scene: THREE.Scene;
  public currentPhase: 1 | 2 | 3 = 1;
  public lightTube: LightTube;

  // Grupos de Cenário
  public diamondRealmGroup: THREE.Group;
  public avaritiaValleyGroup: THREE.Group;

  // Colecionáveis
  public courseItems: CourseCollectible[] = [];
  public diamonds: PhaseDiamond[] = [];
  public avaritiaRelics: PhaseAvaritia[] = [];

  constructor(scene: THREE.Scene) {
    this.scene = scene;
    this.lightTube = new LightTube();
    this.scene.add(this.lightTube.group);

    this.diamondRealmGroup = new THREE.Group();
    this.diamondRealmGroup.visible = false;
    this.scene.add(this.diamondRealmGroup);

    this.avaritiaValleyGroup = new THREE.Group();
    this.avaritiaValleyGroup.visible = false;
    this.scene.add(this.avaritiaValleyGroup);

    this.buildDiamondRealm();
    this.buildAvaritiaValley();
    this.initCourseCollectibles();
  }

  /**
   * Constrói o Cenário da Fase 2: Mundo dos Diamantes Celestes
   */
  private buildDiamondRealm() {
    const group = this.diamondRealmGroup;

    // 1. Ilha Central de Cristal
    const centerIslandGeo = new THREE.CylinderGeometry(28, 24, 7, 32);
    const centerIslandMat = new THREE.MeshStandardMaterial({
      color: 0x0f172a,
      roughness: 0.3,
      metalness: 0.7,
    });
    const centerIsland = new THREE.Mesh(centerIslandGeo, centerIslandMat);
    centerIsland.position.set(0, -3.5, 0);
    centerIsland.receiveShadow = true;
    group.add(centerIsland);

    // Chão de Grama Cristalina / Neon Turquesa
    const topFloorGeo = new THREE.CircleGeometry(28, 32);
    const topFloorMat = new THREE.MeshStandardMaterial({
      color: 0x0891b2,
      roughness: 0.2,
      metalness: 0.5,
      emissive: 0x0e7490,
      emissiveIntensity: 0.35,
    });
    const topFloor = new THREE.Mesh(topFloorGeo, topFloorMat);
    topFloor.rotation.x = -Math.PI / 2;
    topFloor.position.set(0, 0.05, 0);
    topFloor.receiveShadow = true;
    group.add(topFloor);

    // 2. 4 Ilhas Flutuantes Satélites
    const islandPositions = [
      { x: 38, y: 3, z: 0, r: 12 },
      { x: -38, y: 2, z: 0, r: 12 },
      { x: 0, y: 4, z: 38, r: 13 },
      { x: 0, y: 2.5, z: -38, r: 13 },
    ];

    islandPositions.forEach((pos) => {
      const islGeo = new THREE.CylinderGeometry(pos.r, pos.r * 0.8, 5, 24);
      const islMesh = new THREE.Mesh(islGeo, centerIslandMat);
      islMesh.position.set(pos.x, pos.y - 2.5, pos.z);
      group.add(islMesh);

      const islTopGeo = new THREE.CircleGeometry(pos.r, 24);
      const islTopMesh = new THREE.Mesh(islTopGeo, topFloorMat);
      islTopMesh.rotation.x = -Math.PI / 2;
      islTopMesh.position.set(pos.x, pos.y + 0.05, pos.z);
      group.add(islTopMesh);

      // Pontes de Luz Ciano conectando com a ilha central
      const bridgeGeo = new THREE.BoxGeometry(
        Math.abs(pos.x) > 0 ? 18 : 6,
        0.3,
        Math.abs(pos.z) > 0 ? 18 : 6
      );
      const bridgeMat = new THREE.MeshStandardMaterial({
        color: 0x38bdf8,
        emissive: 0x0284c7,
        emissiveIntensity: 0.6,
        transparent: true,
        opacity: 0.85,
      });
      const bridge = new THREE.Mesh(bridgeGeo, bridgeMat);
      bridge.position.set(pos.x * 0.5, (pos.y + 0) * 0.5, pos.z * 0.5);
      group.add(bridge);
    });

    // 3. Pináculos / Cristais Gigantes Radiantes
    const spireGeo = new THREE.ConeGeometry(2.2, 12, 6);
    const spireMat = new THREE.MeshStandardMaterial({
      color: 0x06b6d4,
      emissive: 0x0891b2,
      emissiveIntensity: 0.75,
      roughness: 0.1,
      metalness: 0.9,
    });

    const spireCoords = [
      { x: 18, z: 18 }, { x: -18, z: 18 },
      { x: 18, z: -18 }, { x: -18, z: -18 },
      { x: 38, z: 6 }, { x: -38, z: -6 },
      { x: 6, z: 38 }, { x: -6, z: -38 },
    ];

    spireCoords.forEach((c) => {
      const spire = new THREE.Mesh(spireGeo, spireMat);
      spire.position.set(c.x, 6, c.z);
      group.add(spire);
    });

    // 4. Árvores de Cristal Futuristas
    const trunkMat = new THREE.MeshStandardMaterial({ color: 0x1e293b, roughness: 0.4 });
    const leafMat = new THREE.MeshStandardMaterial({
      color: 0x38bdf8,
      emissive: 0x0284c7,
      emissiveIntensity: 0.5,
    });

    const treePositions = [
      { x: 12, z: 8 }, { x: -12, z: -8 }, { x: -10, z: 12 }, { x: 10, z: -12 },
      { x: 34, z: -4 }, { x: -34, z: 4 }, { x: -4, z: 34 }, { x: 4, z: -34 },
    ];

    treePositions.forEach((tp) => {
      const trunk = new THREE.Mesh(new THREE.CylinderGeometry(0.3, 0.45, 3.5, 8), trunkMat);
      trunk.position.set(tp.x, 1.75, tp.z);
      const foliage = new THREE.Mesh(new THREE.DodecahedronGeometry(1.6), leafMat);
      foliage.position.set(tp.x, 4.2, tp.z);
      group.add(trunk, foliage);
    });

    // 5. Partículas de Poeira Estelar / Nebulosa
    const starCount = 800;
    const starGeo = new THREE.BufferGeometry();
    const starPos = new Float32Array(starCount * 3);
    for (let i = 0; i < starCount * 3; i += 3) {
      starPos[i] = (Math.random() - 0.5) * 160;
      starPos[i + 1] = 5 + Math.random() * 45;
      starPos[i + 2] = (Math.random() - 0.5) * 160;
    }
    starGeo.setAttribute('position', new THREE.BufferAttribute(starPos, 3));
    const starMat = new THREE.PointsMaterial({
      color: 0x67e8f9,
      size: 0.6,
      transparent: true,
      opacity: 0.8,
    });
    const starParticles = new THREE.Points(starGeo, starMat);
    group.add(starParticles);

    // 6. Spawn dos 8 DIAMANTES MÁGICOS na Fase 2
    const diamondCoords = [
      new THREE.Vector3(12, 1.2, 0),
      new THREE.Vector3(-12, 1.2, 0),
      new THREE.Vector3(0, 1.2, 12),
      new THREE.Vector3(0, 1.2, -12),
      new THREE.Vector3(38, 4.2, 0),
      new THREE.Vector3(-38, 3.2, 0),
      new THREE.Vector3(0, 5.2, 38),
      new THREE.Vector3(0, 3.7, -38),
    ];

    this.diamonds = diamondCoords.map((pos, idx) => {
      const mesh = createDiamond3DMesh();
      mesh.position.copy(pos);
      group.add(mesh);
      return {
        id: idx + 1,
        position: pos,
        mesh,
        collected: false,
      };
    });
  }

  /**
   * Constrói o Cenário da Fase 3: Vale Dourado de Avaritia (Templo do Sol)
   */
  private buildAvaritiaValley() {
    const group = this.avaritiaValleyGroup;

    // 1. Chão do Vale / Deserto de Areia Dourada
    const groundGeo = new THREE.PlaneGeometry(160, 160, 24, 24);
    const groundMat = new THREE.MeshStandardMaterial({
      color: 0xb45309, // Areia dourada avermelhada
      roughness: 0.85,
      metalness: 0.1,
    });
    const ground = new THREE.Mesh(groundGeo, groundMat);
    ground.rotation.x = -Math.PI / 2;
    ground.position.y = 0;
    ground.receiveShadow = true;
    group.add(ground);

    // 2. Pirâmide Dourada Ancestral de Avaritia ao Norte
    const pyrGroup = new THREE.Group();
    for (let level = 0; level < 5; level++) {
      const size = 32 - level * 6;
      const stepGeo = new THREE.BoxGeometry(size, 2.5, size);
      const stepMat = new THREE.MeshStandardMaterial({
        color: level === 4 ? 0xf59e0b : 0x78350f,
        roughness: 0.4,
        metalness: level === 4 ? 0.8 : 0.2,
      });
      const step = new THREE.Mesh(stepGeo, stepMat);
      step.position.set(0, 1.25 + level * 2.5, -45);
      pyrGroup.add(step);
    }

    // Altar no topo da Pirâmide
    const altarGeo = new THREE.CylinderGeometry(3.5, 4, 1.5, 16);
    const altarMat = new THREE.MeshStandardMaterial({
      color: 0xfbbf24,
      metalness: 0.8,
      roughness: 0.2,
    });
    const altar = new THREE.Mesh(altarGeo, altarMat);
    altar.position.set(0, 14, -45);
    pyrGroup.add(altar);
    group.add(pyrGroup);

    // 3. Colunas Douradas de Avaritia (Templo Colunado)
    const colGeo = new THREE.CylinderGeometry(0.85, 0.95, 8, 16);
    const colMat = new THREE.MeshStandardMaterial({
      color: 0xd97706,
      roughness: 0.35,
      metalness: 0.6,
    });

    const colCoords = [
      { x: -16, z: -15 }, { x: 16, z: -15 },
      { x: -16, z: 0 }, { x: 16, z: 0 },
      { x: -16, z: 15 }, { x: 16, z: 15 },
      { x: -16, z: 30 }, { x: 16, z: 30 },
      { x: -26, z: -15 }, { x: 26, z: -15 },
      { x: -26, z: 15 }, { x: 26, z: 15 },
    ];

    colCoords.forEach((c) => {
      const col = new THREE.Mesh(colGeo, colMat);
      col.position.set(c.x, 4, c.z);
      col.castShadow = true;
      group.add(col);

      // Capitel dourado no topo
      const capGeo = new THREE.BoxGeometry(2.4, 0.6, 2.4);
      const cap = new THREE.Mesh(capGeo, colMat);
      cap.position.set(c.x, 8.3, c.z);
      group.add(cap);

      // Tocha flamejante
      const flameGeo = new THREE.ConeGeometry(0.3, 0.8, 8);
      const flameMat = new THREE.MeshBasicMaterial({ color: 0xf59e0b });
      const flame = new THREE.Mesh(flameGeo, flameMat);
      flame.position.set(c.x, 8.8, c.z);
      group.add(flame);
    });

    // 4. Calçada de Lajes Antigas do Templo
    const walkwayGeo = new THREE.BoxGeometry(10, 0.15, 80);
    const walkwayMat = new THREE.MeshStandardMaterial({
      color: 0x92400e,
      roughness: 0.6,
    });
    const walkway = new THREE.Mesh(walkwayGeo, walkwayMat);
    walkway.position.set(0, 0.08, 0);
    group.add(walkway);

    // 5. Obeliscos Dourados de Avaritia
    const obGeo = new THREE.CylinderGeometry(0.5, 1.2, 14, 4);
    const obMat = new THREE.MeshStandardMaterial({
      color: 0xf59e0b,
      metalness: 0.7,
      roughness: 0.3,
    });
    const ob1 = new THREE.Mesh(obGeo, obMat);
    ob1.position.set(-12, 7, -30);
    ob1.rotation.y = Math.PI / 4;
    const ob2 = ob1.clone();
    ob2.position.set(12, 7, -30);
    group.add(ob1, ob2);

    // 6. Spawn das 8 RELÍQUIAS DE AVARITIA na Fase 3
    const avaritiaCoords = [
      new THREE.Vector3(0, 1.3, 24),
      new THREE.Vector3(0, 1.3, 10),
      new THREE.Vector3(0, 1.3, -4),
      new THREE.Vector3(-16, 1.3, 8),
      new THREE.Vector3(16, 1.3, 8),
      new THREE.Vector3(-16, 1.3, -15),
      new THREE.Vector3(16, 1.3, -15),
      new THREE.Vector3(0, 15.0, -45), // No topo da Pirâmide Dourada!
    ];

    this.avaritiaRelics = avaritiaCoords.map((pos, idx) => {
      const mesh = createAvaritia3DMesh();
      mesh.position.copy(pos);
      group.add(mesh);
      return {
        id: idx + 1,
        position: pos,
        mesh,
        collected: false,
      };
    });
  }

  /**
   * Inicializa Objetos Colecionáveis ao Longo do Percurso de TODAS as fases!
   */
  private initCourseCollectibles() {
    // -------------------------------------------------------------
    // FASE 1: Cidade Real 3D (Calçadas, Praça da Fonte, Oficina, Mercado)
    // -------------------------------------------------------------
    const p1Items: { id: string; name: string; cat: 'comida' | 'brinquedo' | 'roupa'; type: string; pos: THREE.Vector3; desc: string; icon: string }[] = [
      {
        id: 'course_maca_ouro',
        name: 'Maçã Dourada Mágica',
        cat: 'comida',
        type: 'maca_dourada',
        pos: new THREE.Vector3(-18, 0.4, -6), // Perto da praça da fonte
        desc: 'Uma deliciosa maçã brilhante que restaura toda a energia!',
        icon: '🍎',
      },
      {
        id: 'course_suco_turbo',
        name: 'Suco Turbo de Morango',
        cat: 'comida',
        type: 'suco_turbo',
        pos: new THREE.Vector3(12, 0.4, -14), // Calçada do mercado
        desc: 'Suco geladinho com vitaminas para correr sem cansar!',
        icon: '🧃',
      },
      {
        id: 'course_chave_ouro',
        name: 'Chave Dourada da Oficina',
        cat: 'brinquedo',
        type: 'chave_dourada',
        pos: new THREE.Vector3(38, 0.4, 18), // Perto da Theo Lucca Oficina Mecânica
        desc: 'Chave especial para consertar motores e apertar parafusos!',
        icon: '🔧',
      },
      {
        id: 'course_mini_carro',
        name: 'Mini Carro Colecionável',
        cat: 'brinquedo',
        type: 'mini_carrinho',
        pos: new THREE.Vector3(2, 0.4, 22), // Perto do parque
        desc: 'Carrinho de corrida super veloz para colecionar!',
        icon: '🏎️',
      },
      {
        id: 'course_cristal_1',
        name: 'Cristal Raro da Cidade',
        cat: 'brinquedo',
        type: 'cristal_bolso',
        pos: new THREE.Vector3(-25, 0.4, 18), // Esquina da praia
        desc: 'Um cristal azul reluzente encontrado nas areias da cidade!',
        icon: '💎',
      },
    ];

    // -------------------------------------------------------------
    // FASE 2: Mundo dos Diamantes (Pontes, Ilhas de Cristal)
    // -------------------------------------------------------------
    const p2Items: { id: string; name: string; cat: 'comida' | 'brinquedo' | 'roupa'; type: string; pos: THREE.Vector3; desc: string; icon: string }[] = [
      {
        id: 'course_estrela_cosmica',
        name: 'Estrela Cósmica Mágica',
        cat: 'brinquedo',
        type: 'estrela_cosmica',
        pos: new THREE.Vector3(20, 1.8, 0), // Na ponte leste
        desc: 'Uma estrela mágica que brilha no escuro do espaço!',
        icon: '⭐',
      },
      {
        id: 'course_cristal_celeste',
        name: 'Cristal de Bolso Reluzente',
        cat: 'brinquedo',
        type: 'cristal_bolso',
        pos: new THREE.Vector3(-20, 1.5, 0), // Na ponte oeste
        desc: 'Gema espacial de cristal puro de altíssimo brilho!',
        icon: '💎',
      },
      {
        id: 'course_suco_galactico',
        name: 'Suco Turbo Galáctico',
        cat: 'comida',
        type: 'suco_turbo',
        pos: new THREE.Vector3(0, 2.5, 20), // Na ponte sul
        desc: 'Bebida cósmica gaseificada com sabor de framboesa azul!',
        icon: '🧃',
      },
      {
        id: 'course_mini_foguete',
        name: 'Mini Foguete Espacial',
        cat: 'brinquedo',
        type: 'mini_carrinho',
        pos: new THREE.Vector3(0, 1.8, -20), // Na ponte norte
        desc: 'Mini nave espacial com turbinas que acendem!',
        icon: '🚀',
      },
    ];

    // -------------------------------------------------------------
    // FASE 3: Vale de Avaritia (Templo, Pirâmide, Calçadão do Oásis)
    // -------------------------------------------------------------
    const p3Items: { id: string; name: string; cat: 'comida' | 'brinquedo' | 'roupa'; type: string; pos: THREE.Vector3; desc: string; icon: string }[] = [
      {
        id: 'course_amuleto_ouro',
        name: 'Amuleto do Templo Antigo',
        cat: 'brinquedo',
        type: 'amuleto_ouro',
        pos: new THREE.Vector3(-8, 0.4, 18),
        desc: 'Medalhão dourado com símbolos mágicos do faraó!',
        icon: '📿',
      },
      {
        id: 'course_calice_real',
        name: 'Cálice de Ouro Real',
        cat: 'brinquedo',
        type: 'calice_sagrado',
        pos: new THREE.Vector3(8, 0.4, -6),
        desc: 'Taça de ouro puro com pedras preciosas gravadas!',
        icon: '🏆',
      },
      {
        id: 'course_maca_farao',
        name: 'Maçã do Oásis Dourado',
        cat: 'comida',
        type: 'maca_dourada',
        pos: new THREE.Vector3(-8, 0.4, -20),
        desc: 'Fruta sagrada colhida nas palmeiras do vale de Avaritia!',
        icon: '🍎',
      },
      {
        id: 'course_chave_antiga',
        name: 'Chave Dourada da Tumba',
        cat: 'brinquedo',
        type: 'chave_dourada',
        pos: new THREE.Vector3(8, 0.4, 28),
        desc: 'Chave lendária que abre os portões secretos do deserto!',
        icon: '🗝️',
      },
    ];

    // Adiciona todos os itens aos seus respectivos grupos/cenas
    p1Items.forEach((item) => {
      const mesh = createCourseCollectibleMesh(item.type);
      mesh.position.copy(item.pos);
      this.scene.add(mesh);
      this.courseItems.push({
        id: item.id,
        name: item.name,
        category: item.cat,
        price: 0,
        icon: item.icon,
        description: item.desc,
        position: item.pos,
        mesh,
        collected: false,
        phase: 1,
      });
    });

    p2Items.forEach((item) => {
      const mesh = createCourseCollectibleMesh(item.type);
      mesh.position.copy(item.pos);
      this.diamondRealmGroup.add(mesh);
      this.courseItems.push({
        id: item.id,
        name: item.name,
        category: item.cat,
        price: 0,
        icon: item.icon,
        description: item.desc,
        position: item.pos,
        mesh,
        collected: false,
        phase: 2,
      });
    });

    p3Items.forEach((item) => {
      const mesh = createCourseCollectibleMesh(item.type);
      mesh.position.copy(item.pos);
      this.avaritiaValleyGroup.add(mesh);
      this.courseItems.push({
        id: item.id,
        name: item.name,
        category: item.cat,
        price: 0,
        icon: item.icon,
        description: item.desc,
        position: item.pos,
        mesh,
        collected: false,
        phase: 3,
      });
    });
  }

  /**
   * Alterna a Fase Atual (1: Cidade, 2: Diamantes, 3: Avaritia)
   */
  public switchPhase(phase: 1 | 2 | 3): THREE.Vector3 {
    this.currentPhase = phase;
    this.lightTube.hide();

    let spawnPos = new THREE.Vector3(0, 0, 0);

    if (phase === 1) {
      this.diamondRealmGroup.visible = false;
      this.avaritiaValleyGroup.visible = false;
      this.scene.background = new THREE.Color(0x60a5fa); // Céu azul
      this.scene.fog = new THREE.FogExp2(0x93c5fd, 0.0055);
      spawnPos.set(-14, 0, -14);
    } else if (phase === 2) {
      this.diamondRealmGroup.visible = true;
      this.avaritiaValleyGroup.visible = false;
      this.scene.background = new THREE.Color(0x0f172a); // Céu noturno cósmico
      this.scene.fog = new THREE.FogExp2(0x1e1b4b, 0.008);
      spawnPos.set(0, 0.5, 0); // Centro da ilha de cristal
    } else if (phase === 3) {
      this.diamondRealmGroup.visible = false;
      this.avaritiaValleyGroup.visible = true;
      this.scene.background = new THREE.Color(0x78350f); // Pôr do sol quente no deserto
      this.scene.fog = new THREE.FogExp2(0x9a3412, 0.007);
      spawnPos.set(0, 0.5, 30); // Entrada do Templo de Avaritia
    }

    return spawnPos;
  }

  /**
   * Spawna o Tubo de Luz quando uma missão é cumprida
   */
  public activateLightTubeForCurrentPhase(): THREE.Vector3 {
    let portalPos = new THREE.Vector3(0, 0, 0);

    if (this.currentPhase === 1) {
      // Na Cidade: Spawna no centro da praça (perto da fonte, local de destaque)
      portalPos.set(-14, 0, -8);
      this.lightTube.show(portalPos, 0x38bdf8);
    } else if (this.currentPhase === 2) {
      // No Mundo dos Diamantes: Spawna no centro do altar da Ilha de Cristal
      portalPos.set(0, 0.2, 0);
      this.lightTube.show(portalPos, 0x67e8f9);
    } else if (this.currentPhase === 3) {
      // No Vale de Avaritia: Spawna no topo da Grande Pirâmide Dourada
      portalPos.set(0, 14.2, -45);
      this.lightTube.show(portalPos, 0xfacc15);
    }

    return portalPos;
  }

  /**
   * Loop de Animação e Física das Fases
   */
  public update(delta: number, timeSec: number) {
    this.lightTube.update(delta, timeSec);

    // 1. Animação dos Itens de Percurso (bobbing e spinning suave)
    for (const item of this.courseItems) {
      if (!item.collected && item.phase === this.currentPhase) {
        item.mesh.rotation.y += delta * 1.8;
        item.mesh.position.y = item.position.y + Math.sin(timeSec * 3 + item.position.x) * 0.12;
      }
    }

    // 2. Animação dos Diamantes Mágicos (Fase 2)
    if (this.currentPhase === 2) {
      for (const d of this.diamonds) {
        if (!d.collected) {
          d.mesh.rotation.y += delta * 2.2;
          d.mesh.position.y = d.position.y + Math.sin(timeSec * 3.5 + d.id) * 0.18;
        }
      }
    }

    // 3. Animação das Relíquias de Avaritia (Fase 3)
    if (this.currentPhase === 3) {
      for (const a of this.avaritiaRelics) {
        if (!a.collected) {
          a.mesh.rotation.y += delta * 1.6;
          a.mesh.position.y = a.position.y + Math.sin(timeSec * 2.8 + a.id) * 0.16;

          const ring1 = a.mesh.getObjectByName('ring1');
          const ring2 = a.mesh.getObjectByName('ring2');
          if (ring1) ring1.rotation.z += delta * 2.5;
          if (ring2) ring2.rotation.x += delta * 2.0;
        }
      }
    }
  }
}
