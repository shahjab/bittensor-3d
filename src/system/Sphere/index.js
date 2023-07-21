import React, { useRef, useEffect, useState } from 'react';
import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls';
import SimplexNoise from 'simplex-noise';
import { watch, get_api_from_url, getNetuids, getTransactions } from '../../system/library';

let running = [];
let current_netuid = 1;
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
  curves_meshes = [], miner_meshes = [], validator_meshes = [], filter_meshes = [], selected_mesh,
  noise = new SimplexNoise(),
  blobScale = 3,
  clock = new THREE.Clock();

const totalNeurons = [];

// const [validators, setValidators] = useState([]);
// const [miners, setMiners] = useState([]);
// const [neuronsList[current_netuid].length, setNeuronsList[current_netuid].length] = useState(0);
// const [neuronsList, setNeuronsList] = useState([]);

let _material = new THREE.ShaderMaterial({
  vertexShader: `
        varying vec4 vColor;
        attribute vec4 color;
        void main() {
            vColor = color;
            gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0);
        }
    `,
  fragmentShader: `
        varying vec4 vColor;
        void main() {
            gl_FragColor = vColor;
        }
    `,
  transparent: true
});

let validators = [], miners = [], neuronsList = { "1": [], "3": [], "11": [] };

let latestBlock = {};
latestBlock[1] = 0;
latestBlock[3] = 0;
latestBlock[11] = 0;

function randomPointSphere(radius) {
  let theta = 2 * Math.PI * Math.random();
  let phi = Math.acos(2 * Math.random() - 1);
  let dx = 0 + radius * Math.sin(phi) * Math.cos(theta);
  let dy = 0 + radius * Math.sin(phi) * Math.sin(theta);
  let dz = 0 + radius * Math.cos(phi);
  return new THREE.Vector3(dx, dy, dz);
}

for (let i = 0; i < 5000; i++) {
  let particles = randomPointSphere(148);
  startPositions.push(particles);
}

function getRandom(min, max) {
  return Math.random() * (max - min) + min;
}


let raycaster = new THREE.Raycaster();
let mouse = new THREE.Vector2();

export default function Sphere({ netuid, setNetUid, onSelect, setTransactions, neurons, validatorAddr, searchString, searchType, setInitialNeurons }) {
  // const [validators, setValidators] = useState([]);
  // const [miners, setMiners] = useState([]);
  // const [neuronsList[current_netuid].length, setNeuronsList[current_netuid].length] = useState(0);
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

  useEffect(() => {
    if (!rendererRef.current) return;

    if (!minersRef.current) return;
    if (!validatorsRef.current) return;

    validators = [];
    miners = [];

    for (let i = curves_meshes.length - 1; i >= 0; i--) {
      scene.remove(curves_meshes[i]);
      curves_meshes.splice(i, 1)
    }
    curves_meshes = [];

    for (let i = validator_meshes.length - 1; i >= 0; i--) {
      scene.remove(validator_meshes[i]);
      validator_meshes.splice(i, 1)
    }
    validator_meshes = [];

    for (let i = miner_meshes.length - 1; i >= 0; i--) {
      scene.remove(miner_meshes[i]);
      miner_meshes.splice(i, 1)
    }
    miner_meshes = [];

    current_netuid = netuid;
    restoreAll(netuid);

    if (neuronsList[current_netuid].length == 0) return;
    onSelect({ neuron: neuronsList[current_netuid][neuronsList[current_netuid].length - 1], all: neuronsList[current_netuid].map((item) => item.neuron), index: neuronsList[current_netuid].length - 1, netuid: current_netuid });

    if (!selected_mesh) return;
    const n = neuronsList[current_netuid][neuronsList[current_netuid].length - 1].neuron.uid;
    const pos = startPositions[n];
    selected_mesh.position.set(pos.x, pos.y, pos.z);

    // load(netuid);
  }, [netuid])

  useEffect(() => {
    let ans;
    if (searchType == 1) { //UID search
      ans = neuronsList[current_netuid].filter((item) => ("" + item.neuron.uid) == searchString);
    } else {
      ans = neuronsList[current_netuid].filter((item) => String(item.neuron.hotkey).toLocaleLowerCase().includes(searchString.toLocaleLowerCase()));
      if (searchString.trim().length == 0) {
        ans.slice(0, ans.length);
        ans = [];
      }
    }
    for (let i = 0, l = ans.length; i < l; i++) {
      if (filter_meshes.length > i) {
        const p = startPositions[ans[i].neuron.uid];
        filter_meshes[i].position.set(p.x, p.y, p.z);
      } else {
        const p = startPositions[ans[i].neuron.uid];
        let validatorSphere = new THREE.SphereBufferGeometry(4, 8, 8);
        let materialSphereBg = new THREE.MeshBasicMaterial({
          side: THREE.BackSide,
          clearcoatRoughness: 0.5,
          color: "#32CD32",
          ior: 1.5,
        });
        const vMesh = new THREE.Mesh(validatorSphere, materialSphereBg);
        vMesh.position.set(p.x, p.y, p.z);
        scene.add(vMesh);
        filter_meshes.push(vMesh);
      }
    }
    for (let i = filter_meshes.length - 1; i >= ans.length; i--) {
      scene.remove(filter_meshes[i]);
      filter_meshes.slice(i, 1);
    }
    filter_meshes.length = ans.length;
  }, [searchString, searchType, neuronsList[current_netuid]])

  useEffect(() => {
    if (!selected_mesh) return;
    if (validatorAddr == "") return;
    for (let i = 0; i < neuronsList[current_netuid].length; i++) {
      if (neuronsList[current_netuid][i].neuron.hotkey == validatorAddr) {
        const pos = startPositions[neuronsList[current_netuid][i].neuron.uid];
        selected_mesh.position.set(pos.x, pos.y, pos.z);
      }
    }
  }, [validatorAddr])

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
      '/images/spacebg.jpg'
    );
    const texturenucleus = loader.load(
      '/images/star-nc8wkw.jpg'
    );
    const textureStar = loader.load(
      '/images/white.png'
    );
    const texture1 = loader.load('/images/red.png');
    const texture2 = loader.load('/images/blue.png');

    /*  Nucleus  */
    texturenucleus.anisotropy = 16;
    let icosahedronGeometry = new THREE.IcosahedronBufferGeometry(30, 10);
    let lambertMaterial = new THREE.MeshPhongMaterial({
      map: texturenucleus,
      transparent: true,
      opacity: 0.5
    });
    nucleus = new THREE.Mesh(icosahedronGeometry, lambertMaterial);
    scene.add(nucleus);
    nucleusRef.current = nucleus;

    /*    Sphere  Background   */
    textureSphereBg.anisotropy = 16;
    let geometrySphereBg = new THREE.SphereBufferGeometry(151, 40, 40);
    let materialSphereBg = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      map: textureSphereBg,
      transparent: true,
      color: "#303030",
      clearcoat: 0.5,
      opacity: 0.5,
    });

    sphereBg = new THREE.Mesh(geometrySphereBg, materialSphereBg);
    scene.add(sphereBg);
    sphereBgRef.current = sphereBg;

    let validatorSphere = new THREE.SphereBufferGeometry(4, 8, 8);
    let selectedSphereBg = new THREE.MeshBasicMaterial({
      side: THREE.BackSide,
      // map: textureSphereBg,
      clearcoatRoughness: 0.5,
      color: "#ffffff",
      ior: 1.5,
    });
    selected_mesh = new THREE.Mesh(validatorSphere, selectedSphereBg);
    selected_mesh.position.set(0, 0, 0);
    scene.add(selected_mesh);


    /*    Moving Stars  */
    let starsGeometry = new THREE.BufferGeometry();
    let vertices = [];
    for (let i = 0; i < 0; i++) {
      let particleStar = randomPointSphere(150);
      starPositions.push({ ...particleStar, velocity: THREE.MathUtils.randInt(30, 200) })
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

  const restoreAll = (nid) => {
    const vList = neuronsList[nid].map((item, index) => { return { ...item, nid: index } }).filter((item) => { return item.type == 1 }).sort((a, b) => a.nid - b.nid).map((item) => { return { neuron: item.neuron, id: item.nid } });
    const mList = neuronsList[nid].map((item, index) => { return { ...item, nid: index } }).filter((item) => item.type == 0).sort((a, b) => a.nid - b.nid).map((item) => { return { neuron: item.neuron, id: item.nid } });

    validators = vList;
    miners = mList;

    drawValidators();
    drawMiners();
    drawCurves(false);
  }

  const drawValidators = () => {
    for (let i = 0, l = validators.length; i < l; i++) {
      let distance = startPositions[validators[i].neuron.uid].length();
      if (distance > 100) {
        startPositions[validators[i].neuron.uid].normalize().multiplyScalar(80);
      }
      if (validator_meshes.length > i) {
        const p = startPositions[validators[i].neuron.uid];
        validator_meshes[i].position.set(p.x, p.y, p.z);
      } else {
        const p = startPositions[validators[i].neuron.uid];
        let validatorSphere = new THREE.SphereBufferGeometry(2, 8, 8);
        let materialSphereBg = new THREE.MeshBasicMaterial({
          side: THREE.BackSide,
          clearcoatRoughness: 0.5,
          color: "#87CEEB",
          ior: 1.5,
        });
        const vMesh = new THREE.Mesh(validatorSphere, materialSphereBg);
        vMesh.position.set(p.x, p.y, p.z);
        scene.add(vMesh);
        validator_meshes.push(vMesh);
      }
    }
  }

  const addValidator = (neuron = {}) => {

    neuronsList[neuron.netuid].push({ id: validators.length, type: (neuron.validator_permit ? 1 : 0), neuron });
    if (current_netuid != neuron.netuid) return;

    validators.push({ id: neuronsList[current_netuid].length - 1, neuron });
    drawValidators();

    if (neuronsList[current_netuid].length <= 1) return;
    drawCurves(true);
  }

  const drawMiners = () => {
    for (let i = 0, l = miners.length; i < l; i++) {
      let distance = startPositions[miners[i].neuron.uid].length();
      if (distance < 100) {
        startPositions[miners[i].neuron.uid].normalize().multiplyScalar(150);
      }
      if (miner_meshes.length > i) {
        const p = startPositions[miners[i].neuron.uid];
        miner_meshes[i].position.set(p.x, p.y, p.z);
      } else {
        const p = startPositions[miners[i].neuron.uid];
        let minersphere = new THREE.SphereBufferGeometry(2, 8, 8);
        let materialSphereBg = new THREE.MeshBasicMaterial({
          side: THREE.BackSide,
          clearcoatRoughness: 0.5,
          color: "#FA8072",
          ior: 1.5,
        });
        const mMesh = new THREE.Mesh(minersphere, materialSphereBg);
        mMesh.position.set(p.x, p.y, p.z);
        scene.add(mMesh);
        miner_meshes.push(mMesh);
      }
    }
    // if(neuronsList[current_netuid].length <= 1) return ;
  }

  const addMiner = (neuron = {}) => {
    neuronsList[neuron.netuid].push({ id: miners.length, type: 0, neuron });
    if (current_netuid != neuron.netuid) return;

    miners.push({ id: neuronsList[current_netuid].length, neuron });

    drawMiners();

    if (neuronsList[current_netuid].length <= 1) return;
    drawCurves(true);
  }

  const drawCurves = (f) => {
    
    let colors = [];
    colors.push(0.827, 0.827, 0.827, 0.8); // Color at n1 is red, alpha is 1
    colors.push(0.827, 0.827, 0.827, 0.2); // Color at n2 is blue, alpha is 0
    let m_material = new THREE.MeshBasicMaterial({ color: "#FA8072", transparent: true, opacity: 0.6});
    let v_material = new THREE.MeshBasicMaterial({ color: "#87CEEB", transparent: true, opacity: 0.6});

    if (f) {
      const l = neuronsList[current_netuid].length;
      const n1 = neuronsList[current_netuid][l - 1].neuron.uid;
      const n2 = neuronsList[current_netuid][l - 2].neuron.uid;

      if (neuronsList[current_netuid][l - 2].neuron.validator_permit == neuronsList[current_netuid][l - 1].neuron.validator_permit) {
        const isValidator = neuronsList[current_netuid][l - 2].neuron.validator_permit;

        const curve = new ArcCurve(startPositions[n1], startPositions[n2], 50, isValidator ? 80 : 148);  // 30 segments per curve
        const geometry = new THREE.TubeGeometry(curve, 20, 0.2, 8, false);
        const mesh = new THREE.Mesh(geometry, isValidator ? v_material : m_material);
        curves_meshes.push(mesh)
        scene.add(mesh);
      } else {
        let geometry = new THREE.BufferGeometry();

        let positions = [];
        positions.push(startPositions[n1].x, startPositions[n1].y, startPositions[n1].z);
        positions.push(startPositions[n2].x, startPositions[n2].y, startPositions[n2].z);

        geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
        geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));

        const line = new THREE.Line(geometry, _material);
        curves_meshes.push(line);
        scene.add(line);
      }


    } else {

      let materialStartColor = new THREE.Color(0x00ff00); // red
      let materialEndColor = new THREE.Color(0xff0000); // green

      for (let i = 2; i < neuronsList[current_netuid].length; i++) {
        let material = new THREE.MeshBasicMaterial({ color: "#ffffff", transparent: true, opacity: 0.5 });
        const n1 = neuronsList[current_netuid][i - 1].neuron.uid;
        const n2 = neuronsList[current_netuid][i - 2].neuron.uid;


        if (neuronsList[current_netuid][i - 2].neuron.validator_permit == neuronsList[current_netuid][i - 1].neuron.validator_permit) {
        const isValidator = neuronsList[current_netuid][i - 2].neuron.validator_permit;

          const curve = new ArcCurve(startPositions[n1], startPositions[n2], 50, isValidator ? 80: 148);  // 30 segments per curve
          const geometry = new THREE.TubeGeometry(curve, 20, 0.2, 8, false);

          const mesh = new THREE.Mesh(geometry, isValidator ? v_material : m_material);
          curves_meshes.push(mesh)
          scene.add(mesh);
        } else {
          let geometry = new THREE.BufferGeometry();

          let positions = [];
          positions.push(startPositions[n1].x, startPositions[n1].y, startPositions[n1].z);
          positions.push(startPositions[n2].x, startPositions[n2].y, startPositions[n2].z);

          geometry.setAttribute('position', new THREE.Float32BufferAttribute(positions, 3));
          geometry.setAttribute('color', new THREE.Float32BufferAttribute(colors, 4));

          const line = new THREE.Line(geometry, _material);
          curves_meshes.push(line);
          scene.add(line);
        }


      }


      // for(let i = 0; i < curves_meshes.length; i++) {
      //   curves_meshes[i].material = new THREE.MeshBasicMaterial({ color: materialColor, opacity: 0.8, transparent: true});
      //   curves_meshes[i].material.needsUpdate = true;
      // }
    }
  }

  const animate = () => {
    //Stars  Animation
    const position = starsRef.current.geometry.attributes.position;
    const v = new THREE.Vector3();
    for (let i = 0, l = position.count; i < l; i++) {
      v.fromBufferAttribute(position, i);
      v.applyMatrix4(starsRef.current.matrixWorld);

      v.x += (0 - v.x) / starPositions[i].velocity;
      v.y += (0 - v.y) / starPositions[i].velocity;
      v.z += (0 - v.z) / starPositions[i].velocity;
      starPositions[i].velocity -= 0.3;

      if (v.x <= 5 && v.x >= -5 && v.z <= 5 && v.z >= -5) {
        v.x = starPositions[i].x;
        v.y = starPositions[i].y;
        v.z = starPositions[i].z;
        starPositions[i].velocity = THREE.MathUtils.randInt(50, 300);
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
  // window.addEventListener('mousemove', onMouseMove, false);
  let raycaster = new THREE.Raycaster();

  // Define a 2D vector for the mouse position
  let mouse = new THREE.Vector2();

  // Update the mouse coordinates on mouse move
  function onMouseMove(event) {
    // Normalize the mouse position from -1 to 1 for both dimensions
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;
  }

  function onMouseClick(event) {

    // let min = 20;
    // let selected = -1;
    // // let ptype = 1;
    // let pos;
    // for (let i = 0; i < neuronsList[current_netuid].length; i++) {
    //   const uid = neuronsList[current_netuid][i].neuron.uid;

    //   const position2D = get2DPosition(startPositions[uid], camera);
    //   const dist = Math.sqrt((position2D.x - event.clientX) * (position2D.x - event.clientX) + (position2D.y - event.clientY) * (position2D.y - event.clientY));
    //   console.log(i, position2D, event.clientX, event.clientY);
    //   if (dist < min) {
    //     min = dist;
    //     selected = i;
    //     pos = startPositions[uid];
    //     alert("find" + i);
    //   }
    // }

    // if (selected >= 0) {
    //   neuronsList[current_netuid].map((item) => item.neuron)
    //   onSelect({ neuron: neuronsList[current_netuid][selected].neuron, all: neuronsList[current_netuid].map((n) => n.neuron), index: selected, netuid: current_netuid });
    //   selected_mesh.position.set(pos.x, pos.y, pos.z);
    // }

    raycaster.setFromCamera(mouse, camera);

    // Calculate objects intersecting the picking ray
    let intersects = raycaster.intersectObjects([...validator_meshes, ...miner_meshes]);
    let min = 10;

    // Loop through all intersecting objects
    for (let i = 0; i < intersects.length; i++) {
      // Do something with the intersecting objects
      // e.g., change their color
      // intersects[i].object.material.color.set(0xff0000);
      const pos = intersects[i].object.position;
      // alert("asdfasdfasf" + intersects[i].object.position.toArray().toString())
      selected_mesh.position.set(pos.x, pos.y, pos.z);

      let selected = -1;
      for (let i = 0; i < neuronsList[current_netuid].length; i++) {
        const uid = neuronsList[current_netuid][i].neuron.uid;
        const dist = Math.sqrt((pos.x - startPositions[uid].x) * (pos.x - startPositions[uid].x) + (pos.y - startPositions[uid].y) * (pos.y - startPositions[uid].y) + (pos.z - startPositions[uid].z) * (pos.z - startPositions[uid].z));
        if (dist < min) {
          selected = i;
          min = dist;
        }
      }
      if (selected >= 0) {
        neuronsList[current_netuid].map((item) => item.neuron)
        onSelect({ neuron: neuronsList[current_netuid][selected].neuron, all: neuronsList[current_netuid].map((n) => n.neuron), index: selected, netuid: current_netuid });
        selected_mesh.position.set(pos.x, pos.y, pos.z);
      }
    }
  }
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

  useEffect(() => {
    if (rendererRef.current) return;

    init();
    animate();
    load();

    // Create an event listener for the mousemove event
    window.addEventListener('mousemove', onMouseMove, false);
    window.addEventListener('click', onMouseClick, false);

    window.addEventListener('resize', onWindowResize);
    // return () => {
    //   window.removeEventListener('resize', onWindowResize);
    // };
  }, []);

  const onUpdate = (v) => {
    let count = 0;
    for (let i = 0; i < v.length; i++) {
      const item = v[i];
      if (item.last_update > latestBlock[item.netuid]) {
        latestBlock[item.netuid] = item.last_update;
        if (item.validator_permit) {
          addValidator(item)
          count++;
        } else {
          addMiner(item)
          count++;
        }
      }
    }
    if (v[0].netuid == current_netuid) {
      const pos = startPositions[v[0].uid];
      selected_mesh.position.set(pos.x, pos.y, pos.z);
    }
    onSelect({ neuron: neuronsList[current_netuid][neuronsList[current_netuid].length - 1]?.neuron, all: neuronsList[current_netuid].map((n) => n.neuron), index: neuronsList[current_netuid].length - 1, netuid: current_netuid });
  }

  const load = async (net) => {
    const url = "wss://entrypoint-finney.opentensor.ai:443";

    if (!api)
      api = await get_api_from_url(url);

    try {
      await api.isReady;
    } catch (err) {
      return;
    }
    // getTransactions(api);
    watch(api, onUpdate, setTransactions, setInitialNeurons);
  }

  return (<div id="canvas_container" ref={containerRef} style={{
    width: "100vw", height: "100vh", margin: 0,
    overflow: "hidden",
    backgroundImage: 'url("/images/background.jpg")',
    backgroundSize: "cover",
    backdropFilter: 'brightness("50%")'
  }}>
  </div>);
};

class ArcCurve extends THREE.Curve {
  constructor(start, end, segments, radius) {
    super();
    this.start = start;
    this.end = end;
    this.segments = segments;
    this.points = Array.from({ length: segments }, (_, i) => {
      const t = i / (segments - 1);
      const pos = new THREE.Vector3().lerpVectors(start, end, t).normalize().multiplyScalar(radius);
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