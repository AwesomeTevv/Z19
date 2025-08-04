import * as THREE from 'three';
import World from './World.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

class Game {
    constructor(canvas) {
        this.canvas = canvas;

        /**
         * @type {THREE.WebGLRenderer}
         */
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);

        /**
         * @type {THREE.Scene}
         */
        this.scene = new THREE.Scene();

        /**
         * @type {THREE.PerspectiveCamera}
         */
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(-100, 100, 0);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));

        /**
         * @type {THREE.OrbitControls}
         */
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );

        this.controls.update();

        /**
         * @type {Stats}
         */
        this.stats = new Stats();
        this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this.stats.dom);

        this.world = World.create(this.scene, this.camera, this.renderer);

        this._resize = this._resize.bind(this);
        window.addEventListener('resize', this._resize);
        this._resize();

        this._animate = this._animate.bind(this);
        this._animate();
    }

    _resize() {
        const width = window.innerWidth;
        const height = window.innerHeight;

        this.camera.aspect = width / height;
        this.camera.updateProjectionMatrix();

        this.renderer.setSize(width, height, false);
    }

    _animate() {
        this.stats.begin();
        
        requestAnimationFrame(this._animate);
        if (this.world && this.world.update) {
            this.world.update();
        }
        this.controls.update();
        this.renderer.render(this.scene, this.camera);
        
        this.stats.end();
    }
}

export default Game; 