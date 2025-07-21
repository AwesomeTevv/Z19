import * as THREE from 'three';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';

const canvas = document.querySelector('#main');
const renderer = new THREE.WebGLRenderer({ antialias: true, canvas });

const camera = new THREE.PerspectiveCamera(
    75, // FOV
    window.innerWidth / window.innerHeight, // Aspect Ratio
    0.1, // Near
    1000 // Far
);
camera.position.z = 5;

const controls = new OrbitControls( camera, renderer.domElement );
controls.update();

const scene = new THREE.Scene();
scene.background = new THREE.Color().setHex('0xA2C7E5');

const geometry = new THREE.BoxGeometry( 1, 1, 1 );
const material = new THREE.MeshBasicMaterial( { color: 0x00ff00 } );
const cube = new THREE.Mesh( geometry, material );
scene.add(cube);

const axesHelper = new THREE.AxesHelper(1000);
scene.add( axesHelper );

renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


/**
 * 
 * @param {THREE.WebGLRenderer} renderer The renderer we need to resize
 */
function resizeRendererToDisplaySize(renderer) {
    const pixelRatio = window.devicePixelRatio;
    const width = Math.floor(canvas.clientWidth * pixelRatio);
    const height = Math.floor(canvas.clientHeight * pixelRatio);

    const needResize = canvas.width !== width || canvas.height !== height;
    if (needResize) {
        renderer.setSize(width, height, false);
    }

    return needResize;
}

function render(time) {
    time *= 0.001; // Convert to seconds
    
    if (resizeRendererToDisplaySize(renderer)) {
      camera.aspect = canvas.clientWidth / canvas.clientHeight;
      camera.updateProjectionMatrix();
    }

    renderer.render(scene, camera);
    requestAnimationFrame(render);
}
requestAnimationFrame(render);