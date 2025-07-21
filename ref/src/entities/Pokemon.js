import * as THREE from 'three';
import { GLTFLoader } from 'three/examples/jsm/loaders/GLTFLoader.js';
import { AnimationController } from '../utils/AnimationController.js';
import TWEEN from '@tweenjs/tween.js';

export class Pokemon {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();
        this.animations = {};
        this.animationController = null;
        this.followDistance = 3;
        this.followSpeed = 0.05;
        this.loadModel();
    }

    async loadModel() {
        const loader = new GLTFLoader();
        try {
            const gltf = await loader.loadAsync('/models/pokemon/pikachu.glb');
            this.mesh.add(gltf.scene);
            
            // Setup animations
            this.animationController = new AnimationController(gltf.animations);
            this.animations = {
                idle: 'idle',
                walk: 'walk',
                happy: 'happy'
            };
            
            // Start with idle animation
            this.animationController.play(this.animations.idle, true);
            
        } catch (error) {
            console.error('Error loading pokemon model:', error);
        }
    }

    update() {
        if (!this.animationController) return;

        const player = this.scene.player.mesh;
        const targetPosition = this.calculateTargetPosition(player);
        
        // Calculate distance to target
        const distance = this.mesh.position.distanceTo(targetPosition);
        
        // Update animation based on distance
        if (distance > this.followDistance * 1.5) {
            // Running to catch up
            this.animationController.play(this.animations.walk, true);
            this.moveTowards(targetPosition, this.followSpeed * 2);
        } else if (distance > 0.1) {
            // Walking normally
            this.animationController.play(this.animations.walk, true);
            this.moveTowards(targetPosition, this.followSpeed);
        } else {
            // Standing still
            this.animationController.play(this.animations.idle, true);
        }

        // Look at player
        this.mesh.lookAt(player.position);

        this.animationController.update();
        TWEEN.update();
    }

    calculateTargetPosition(player) {
        // Calculate position behind player
        const playerDirection = new THREE.Vector3(0, 0, 1);
        playerDirection.applyQuaternion(player.quaternion);
        
        return new THREE.Vector3(
            player.position.x - playerDirection.x * this.followDistance,
            player.position.y,
            player.position.z - playerDirection.z * this.followDistance
        );
    }

    moveTowards(targetPosition, speed) {
        const currentPos = this.mesh.position;
        const newPos = currentPos.clone().lerp(targetPosition, speed);
        this.mesh.position.copy(newPos);
    }

    playHappyAnimation() {
        this.animationController.play(this.animations.happy, false, () => {
            this.animationController.play(this.animations.idle, true);
        });
    }
} 