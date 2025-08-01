import * as THREE from 'three';
import World from './World.js';

class Game {
    constructor(canvas) {
        this.canvas = canvas;
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.scene = new THREE.Scene();
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(0, 1, 5);
        this.world = World.create(this.scene, this.camera);
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
        requestAnimationFrame(this._animate);
        if (this.world && this.world.update) {
            this.world.update();
        }
        this.renderer.render(this.scene, this.camera);
    }
}

export default Game; 