import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AnimationController } from '../utils/AnimationController.js';

export class Player {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();
        this.animations = {};
        this.animationController = null;
        this.moveSpeed = 0.1;
        this.turnSpeed = 0.05;
        this.loadModel();
        this.setupControls();
    }

    async loadModel() {
        const loader = new GLTFLoader();
        try {
            const gltf = await loader.loadAsync('/models/player/character.glb');
            this.mesh.add(gltf.scene);
            
            // Setup animations
            this.animationController = new AnimationController(gltf.animations);
            this.animations = {
                idle: 'idle',
                walk: 'walk',
                run: 'run'
            };
            
            // Start with idle animation
            this.animationController.play(this.animations.idle, true);
            
        } catch (error) {
            console.error('Error loading player model:', error);
        }
    }

    setupControls() {
        this.keys = {
            forward: false,
            backward: false,
            left: false,
            right: false,
            run: false
        };

        window.addEventListener('keydown', (e) => this.onKeyDown(e));
        window.addEventListener('keyup', (e) => this.onKeyUp(e));
    }

    onKeyDown(event) {
        switch(event.code) {
            case 'KeyW': this.keys.forward = true; break;
            case 'KeyS': this.keys.backward = true; break;
            case 'KeyA': this.keys.left = true; break;
            case 'KeyD': this.keys.right = true; break;
            case 'ShiftLeft': this.keys.run = true; break;
        }
    }

    onKeyUp(event) {
        switch(event.code) {
            case 'KeyW': this.keys.forward = false; break;
            case 'KeyS': this.keys.backward = false; break;
            case 'KeyA': this.keys.left = false; break;
            case 'KeyD': this.keys.right = false; break;
            case 'ShiftLeft': this.keys.run = false; break;
        }
    }

    update() {
        if (!this.animationController) return;

        const currentSpeed = this.keys.run ? this.moveSpeed * 2 : this.moveSpeed;
        let moving = false;

        // Handle movement
        if (this.keys.forward) {
            this.mesh.position.z -= currentSpeed;
            moving = true;
        }
        if (this.keys.backward) {
            this.mesh.position.z += currentSpeed;
            moving = true;
        }
        if (this.keys.left) {
            this.mesh.rotation.y += this.turnSpeed;
        }
        if (this.keys.right) {
            this.mesh.rotation.y -= this.turnSpeed;
        }

        // Update animations
        if (moving) {
            const animation = this.keys.run ? this.animations.run : this.animations.walk;
            this.animationController.play(animation, true);
        } else {
            this.animationController.play(this.animations.idle, true);
        }

        this.animationController.update();
    }
} 