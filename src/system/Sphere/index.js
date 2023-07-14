import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import SimplexNoise from 'simplex-noise';
import { watch, get_api_from_url, getNetuids } from '../../system/library';
import { LineSegments } from 'three';

let running = [];
let current_netuid;
let api,
  renderer,
  scene,
  camera,
  sphereBg,
  nucleus,
  stars,
  startPositions = [],
  starPositions = [],
  circles = [],
  curves = [],
  noise = new SimplexNoise(),
  blobScale = 3,
  clock = new THREE.Clock();

  // const [validators, setValidators] = useState([]);
  // const [miners, setMiners] = useState([]);
  // const [neuronsCount, setNeuronsCount] = useState(0);
  // const [neuronsList, setNeuronsList] = useState([]);

let validators = [], miners = [], neuronsList = [], neuronsCount = 0;

let latestBlock = 0;

function randomPointSphere(radius) {
  let theta = 2 * Math.PI * Math.random();
  let phi = Math.acos(2 * Math.random() - 1);
  let dx = 0 + radius * Math.sin(phi) * Math.cos(theta);
  let dy = 0 + radius * Math.sin(phi) * Math.sin(theta);
  let dz = 0 + radius * Math.cos(phi);
  return new THREE.Vector3(dx, dy, dz);
}

for (let i = 0; i < 1000; i++) {
  let particles = randomPointSphere(148);
  starPositions.push(particles);
}

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}

export default function Sphere({ netuid, setNetUid, onSelect }) {
  // const [validators, setValidators] = useState([]);
  // const [miners, setMiners] = useState([]);
  // const [neuronsCount, setNeuronsCount] = useState(0);
  // const [neuronsList, setNeuronsList] = useState([]);

  const containerRef = useRef(null);
  const rendererRef = useRef(null);
  const sceneRef = useRef(null);
  const cameraRef = useRef(null);
  const controlsRef = useRef(null);
  const nucleusRef = useRef(null);
  const sphereBgRef = useRef(null);
  const starsRef = useRef(null);
  const noiseRef = useRef(null);
  const timeoutDebounceRef = useRef(null);
  const validatorsRef = useRef(null);
  const minersRef = useRef(null);

  const curveRef = useRef(null);
  // let raycaster = new THREE.Raycaster();

  useEffect(() => {
    if (!rendererRef.current) return;

    if(!minersRef.current) return ;
    if(!validatorsRef.current) return ;

    validators = [];
    miners = [];
    neuronsList = [];
    neuronsCount = 0;
    latestBlock = 0;

    minersRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
    minersRef.current.geometry.attributes.position.needsUpdate = true;

    validatorsRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute([], 3));
    validatorsRef.current.geometry.attributes.position.needsUpdate = true;

    for (let i = curves.length - 1; i >= 0; i--) {
      scene.remove(curves[i]);
      curves.splice(i, 1)
    }
    curves = [];

    onSelect({neuron: {}, all: [], index: 0});
    console.log("updating netuid", netuid)

    current_netuid = netuid;
    load(netuid);
  }, [netuid, rendererRef.current])

  const init = () => {
    scene = new THREE.Scene();

    sceneRef.current = scene;
    noiseRef.current = noise;

    camera = new THREE.PerspectiveCamera(55, containerRef.current.clientWidth / containerRef.current.clientHeight, 0.01, 1000);
    camera.position.set(0, 0, 230);
    cameraRef.current = camera;

    const directionalLight = new THREE.DirectionalLight('#fff', 2);
    directionalLight.position.set(0, 50, -20);
    scene.add(directionalLight);

    let ambientLight = new THREE.AmbientLight('#ffffff', 1);
    ambientLight.position.set(0, 20, 20);
    scene.add(ambientLight);

    renderer = new THREE.WebGLRenderer({ antialias: true, alpha: true });

    renderer.setSize(containerRef.current.clientWidth, containerRef.current.clientHeight);
    renderer.setPixelRatio(window.devicePixelRatio);
    containerRef.current.appendChild(renderer.domElement);
    rendererRef.current = renderer;

    // OrbitControl
    controlsRef.current = new OrbitControls(camera, renderer.domElement);
    // controlsRef.current.autoRotate = true;
    controlsRef.current.autoRotateSpeed = 0.5;
    controlsRef.current.maxDistance = 350;
    controlsRef.current.minDistance = 150;
    controlsRef.current.enablePan = false;
    // controlsRef.current = controls;

    const loader = new THREE.TextureLoader();
    const textureSphereBg = loader.load(
      'https://i.ibb.co/4gHcRZD/bg3-je3ddz.jpg'
    );
    const texturenucleus = loader.load(
      'https://i.ibb.co/hcN2qXk/star-nc8wkw.jpg'
    );
    const textureStar = loader.load(
      'https://i.ibb.co/ZKsdYSz/p1-g3zb2a.png'
    );
    const texture1 = loader.load('https://i.ibb.co/F8by6wW/p2-b3gnym.png');
    const texture2 = loader.load('https://i.ibb.co/yYS2yx5/p3-ttfn70.png');
    const texture4 = loader.load('https://i.ibb.co/yWfKkHh/p4-avirap.png');

    /*  Nucleus  */
    texturenucleus.anisotropy = 16;
    let icosahedronGeometry = new THREE.IcosahedronBufferGeometry(30, 10);
    let lambertMaterial = new THREE.MeshPhongMaterial({
      map: texturenucleus,
      transparent: true,
      // opacity: 0.5
    });
    nucleus = new THREE.Mesh(icosahedronGeometry, lambertMaterial);
    scene.add(nucleus);
    nucleusRef.current = nucleus;

    /*    Sphere  Background   */
    textureSphereBg.anisotropy = 16;
    let geometrySphereBg = new THREE.SphereBufferGeometry(150, 40, 40);
    let materialSphereBg = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      map: textureSphereBg,
      transparent: true,
      roughness: 0.5,
      metalness: 0.8,
      clearcoat: 0.5,
      opacity: 0.7,
      clearcoatRoughness: 0.5,
      transmission: 5,
      ior: 1.5,
    });
    
    sphereBg = new THREE.Mesh(geometrySphereBg, materialSphereBg);
    scene.add(sphereBg);
    sphereBgRef.current = sphereBg;

    /*    Moving Stars  */
    let starsGeometry = new THREE.BufferGeometry();
    let vertices = [];
    for (let i = 0; i < 50; i++) {
      let particleStar = randomPointSphere(150);
      startPositions.push({ ...particleStar, velocity: THREE.MathUtils.randInt(30, 200) })
      vertices.push(particleStar);
    }

    const verticesArray = vertices.flatMap(vector => vector.toArray());
    starsGeometry.setAttribute('position', new THREE.Float32BufferAttribute(verticesArray, 3));

    let starsMaterial = new THREE.PointsMaterial({
      size: 5,
      color: '#ffffff',
      transparent: true,
      opacity: 0.5,
      map: textureStar,
      blending: THREE.AdditiveBlending
    });
    starsMaterial.depthWrite = false;
    stars = new THREE.Points(starsGeometry, starsMaterial);
    scene.add(stars);
    starsRef.current = stars;

    /*    Fixed Stars   */
    function createStars(parent, texture) {
      let pointGeometry = new THREE.BufferGeometry();
      let vertices = [];
      let pointMaterial = new THREE.PointsMaterial({
        size: 30,
        map: texture,
        blending: THREE.AdditiveBlending,
        transparent: true,
      });

      const verticesArray = vertices.flatMap(vector => vector.toArray());
      pointGeometry.setAttribute('position', new THREE.Float32BufferAttribute(verticesArray, 3));

      parent.current = new THREE.Points(pointGeometry, pointMaterial);
      parent.current.geometry = pointGeometry;
      pointGeometry.attributes.position.needsUpdate = true;
      scene.add(parent.current);
    }
    createStars(validatorsRef, texture1);
    createStars(minersRef, texture2);
  }

  const addValidator = (neuron = {}) => {

    validators.push({ id: neuronsCount, neuron });
    neuronsList.push({ id: validators.length - 1, type: 1, neuron });

    const vertices = []
    for (let i = 0, l = validators.length; i < l; i++) {
      vertices.push(starPositions[validators[i].id]);
    }
    const verticesArray = vertices.flatMap(vector => vector.toArray());
    validatorsRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(verticesArray, 3));

    validatorsRef.current.geometry.attributes.position.needsUpdate = true;
    neuronsCount = neuronsList.length;

    if(neuronsList.length <= 1) return ;
    
    let material = new THREE.MeshBasicMaterial({ color: "#ff0000", transparent: true, opacity: 0.5 });
    const curve = new ArcCurve(starPositions[neuronsCount-2], starPositions[neuronsCount-1], 30);  // 30 segments per curve
    const geometry = new THREE.TubeGeometry(curve, 20, 0.2, 8, false);
    const mesh = new THREE.Mesh(geometry, material);
    curves.push(mesh);
    scene.add(mesh);


    let materialStartColor = new THREE.Color(0x00ff00); // red
    let materialEndColor = new THREE.Color(0xff0000); // green

    for(let i = 0; i < curves.length; i++) {
      let materialColor = new THREE.Color().lerpColors(materialStartColor, materialEndColor, 1.0 * (neuronsCount - i) / neuronsCount);
      curves[i].material = new THREE.MeshBasicMaterial({ color: materialColor, opacity: 0.8, transparent: true});
      curves[i].material.needsUpdate = true;
    }
  }

  const addMiner = (neuron = {}) => {
    miners.push({ id: neuronsCount, neuron });
    neuronsList.push({ id: miners.length - 1, type: 0, neuron });

    const vertices = []
    for (let i = 0, l = miners.length; i < l; i++) {
      vertices.push(new THREE.Vector3(starPositions[miners[i].id].x, starPositions[miners[i].id].y, starPositions[miners[i].id].z));
    }

    const verticesArray = vertices.flatMap(vector => vector.toArray());
    minersRef.current.geometry.setAttribute('position', new THREE.Float32BufferAttribute(verticesArray, 3));
    minersRef.current.geometry.attributes.position.needsUpdate = true;

    neuronsCount = neuronsList.length;

    if(neuronsList.length <= 1) return ;

    let material = new THREE.MeshBasicMaterial({ color: "#ff0000", transparent: true, opacity: 0.5 });

    const curve = new ArcCurve(starPositions[neuronsCount-2], starPositions[neuronsCount-1], 50);  // 30 segments per curve
    const geometry = new THREE.TubeGeometry(curve, 20, 0.2, 8, false);
    const mesh = new THREE.Mesh(geometry, material);
    curves.push(mesh)
    scene.add(mesh);

    let materialStartColor = new THREE.Color(0x00ff00); // red
    let materialEndColor = new THREE.Color(0xff0000); // green

    for(let i = 0; i < curves.length; i++) {
      let materialColor = new THREE.Color().lerpColors(materialStartColor, materialEndColor, 1.0 * (neuronsCount - i) / neuronsCount);
      curves[i].material = new THREE.MeshBasicMaterial({ color: materialColor, opacity: 0.8, transparent: true});
      curves[i].material.needsUpdate = true;
    }
    // miners = mtmp;
    // neuronsList = ntmp;
  }

  const animate = () => {
    //Stars  Animation
    const position = starsRef.current.geometry.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0, l = position.count; i < l; i++) {
      v.fromBufferAttribute(position, i);
      v.applyMatrix4(starsRef.current.matrixWorld);

      v.x += (0 - v.x) / startPositions[i].velocity;
      v.y += (0 - v.y) / startPositions[i].velocity;
      v.z += (0 - v.z) / startPositions[i].velocity;
      startPositions[i].velocity -= 0.3;

      if (v.x <= 5 && v.x >= -5 && v.z <= 5 && v.z >= -5) {
        v.x = startPositions[i].x;
        v.y = startPositions[i].y;
        v.z = startPositions[i].z;
        startPositions[i].velocity = THREE.MathUtils.randInt(50, 300);
      }
      starsRef.current.geometry.attributes.position.setXYZ(i, v.x, v.y, v.z)
    }

    starsRef.current.geometry.attributes.position.needsUpdate = true;
    const nucleusRef_position = nucleusRef.current.geometry.attributes.position;
    for (let i = 0, l = nucleusRef_position.count; i < l; i++) {
      v.fromBufferAttribute(nucleusRef_position, i);
      v.applyMatrix4(nucleusRef.current.matrixWorld);
      let time = Date.now();

      v.normalize();
      let distance = nucleusRef.current.geometry.parameters.radius + noise.noise3D(v.x + time * 0.0005, v.y + time * 0.0003, v.z + time * 0.0008) * blobScale;
      v.multiplyScalar(distance);
      nucleusRef.current.geometry.attributes.position.setXYZ(i, v.x, v.y, v.z)
    }

    nucleusRef.current.geometry.attributes.position.needsUpdate = true;
    nucleusRef.current.geometry.normalsNeedUpdate = true;
    nucleusRef.current.geometry.computeVertexNormals();

    controlsRef.current.update();
    starsRef.current.geometry.verticesNeedUpdate = true;
    rendererRef.current.render(sceneRef.current, cameraRef.current);

    requestAnimationFrame(animate);

  }

  function get2DPosition(vector3, camera) {
    let vector = vector3.clone();
    vector.project(camera);

    vector.x = Math.round((vector.x + 1) * renderer.domElement.width / 2);
    vector.y = Math.round((-vector.y + 1) * renderer.domElement.height / 2);

    return vector;
  }

  function onMouseClick(event) {
    let position = validatorsRef.current.geometry.attributes.position;
    const v = new THREE.Vector3();
    let min = 10;
    let selected = -1;
    let ptype = 1;
    for (let i = 0; i < position.count; i++) {
      v.fromBufferAttribute(position, i);
      v.applyMatrix4(validatorsRef.current.matrixWorld);

      // validatorsRef.current.geometry.attributes.position.setXYZ(i, startPositions[i].x, startPositions[i].y, startPositions[i].z)
      let position2D = get2DPosition(v, camera);
      const dist = Math.sqrt((position2D.x - event.clientX) * (position2D.x - event.clientX) + (position2D.y - event.clientY) * (position2D.y - event.clientY));
      if (dist < min) {
        min = dist;
        selected = i;
      }
    }
    let m_position = minersRef.current.geometry.attributes.position;

    for (let i = 0; i < m_position.count; i++) {
      v.fromBufferAttribute(m_position, i);
      v.applyMatrix4(minersRef.current.matrixWorld);

      let position2D = get2DPosition(v, camera);
      const dist = Math.sqrt((position2D.x - event.clientX) * (position2D.x - event.clientX) + (position2D.y - event.clientY) * (position2D.y - event.clientY));
      if (dist < min) {
        min = dist;
        selected = i;
        ptype = 0;
      }
    }

    if (selected >= 0) {
      let id = 0;
      for(let i = 0 ;i < neuronsList.length; i++) {
        if(neuronsList[i].type == ptype && neuronsList[i].id == selected) {
          id = i;
          break;
        }
      }
      if(ptype === 1) {
        onSelect({neuron: validators[selected].neuron, all: neuronsList.map((n) => n.neuron), index: id});
      } else {
        onSelect({neuron: miners[selected].neuron, all: neuronsList.map((n) => n.neuron), index: id});
      }
    }
  }

  useEffect(() => {
    if (rendererRef.current) return;

    init();
    animate();
    // load();

    // Add event listeners
    // window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('click', onMouseClick, false);

    /*     Resize     */
    const onWindowResize = () => {
      clearTimeout(timeoutDebounceRef.current);
      timeoutDebounceRef.current = setTimeout(() => {
        cameraRef.current.aspect =
          containerRef.current.clientWidth / containerRef.current.clientHeight;
        cameraRef.current.updateProjectionMatrix();
        rendererRef.current.setSize(
          containerRef.current.clientWidth,
          containerRef.current.clientHeight
        );
      }, 80);
    };
    window.addEventListener('resize', onWindowResize);
    return () => {
      window.removeEventListener('resize', onWindowResize);
    };
  }, []);

  const onUpdate = (net, v) => {
    console.log(net, current_netuid, v);
    if(net != current_netuid) return ;
    console.log("applying")
    for(let i = 0 ;i < v.length; i++) {
      const item = v[i];
      if (item.last_update > latestBlock) {
        latestBlock = item.last_update;
        if (item.validator_permit) {
          addValidator(item)
        } else {
          addMiner(item)
        }
      }
    }
    onSelect({neuron: neuronsList[neuronsCount - 1].neuron, all: neuronsList.map((n) => n.neuron), index: neuronsCount - 1});
  }

  const load = async (net) => {
    const url = "wss://entrypoint-finney.opentensor.ai:443";

    if(!api)
      api = await get_api_from_url(url);

    try {
      await api.isReady;
    } catch (err) {
      return;
    }
    if(running.includes(net)) return ;

    running.push(net);
    watch(api, net, onUpdate);
  }

  return (<div id="canvas_container" ref={containerRef} style={{
    width: "100vw", height: "100vh", margin: 0,
    overflow: "hidden",
    backgroundImage: 'url("https://img.freepik.com/free-vector/white-abstract-background-design_23-2148825582.jpg?w=2000")',
    backgroundSize: "cover",
    backdropFilter: 'brightness("50%")'
  }}>
  </div>);
};

class ArcCurve extends THREE.Curve {
  constructor(start, end, segments) {
    super();
    this.start = start;
    this.end = end;
    this.segments = segments;
    this.points = Array.from({ length: segments }, (_, i) => {
      const t = i / (segments - 1);
      const pos = new THREE.Vector3().lerpVectors(start, end, t).normalize().multiplyScalar(148);
      return pos;
    });
  }
  getPoint(t) {
    if (t === 1) return this.points[this.segments - 1];
    const idx = Math.floor(t * (this.segments - 1));
    const tLocal = (t * (this.segments - 1)) % 1;
    return this.points[idx].clone().lerp(this.points[idx + 1], tLocal);
  }
}