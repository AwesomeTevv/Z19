import * as THREE from 'three';
import { Scene } from './Scene.js';
import { createTextMesh } from '../utils/textHelper.js';

export class MainMenu extends Scene {
    constructor(game) {
        super(game);
        this.setupScene();
    }

    setupScene() {
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Add directional light
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.5);
        directionalLight.position.set(0, 10, 10);
        this.scene.add(directionalLight);

        // Position camera
        this.camera.position.z = 5;

        // Create menu elements (will be implemented in textHelper.js)
        this.createMenuElements();
    }

    async createMenuElements() {
        // Title
        const titleMesh = await createTextMesh('Pokemon 3D Adventure', 0.5);
        titleMesh.position.set(0, 1, 0);
        this.scene.add(titleMesh);

        // Subtitle
        const subtitleMesh = await createTextMesh('An Epic Journey Awaits', 0.3);
        subtitleMesh.position.set(0, 0, 0);
        this.scene.add(subtitleMesh);

        // Play button
        const playButtonMesh = await createTextMesh('Play Game', 0.3);
        playButtonMesh.position.set(0, -1, 0);
        this.scene.add(playButtonMesh);

        // Add click handler for play button
        this.addClickHandler(playButtonMesh, () => {
            this.game.switchToScene('game');
        });
    }

    addClickHandler(mesh, callback) {
        const raycaster = new THREE.Raycaster();
        const mouse = new THREE.Vector2();

        window.addEventListener('click', (event) => {
            mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
            mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

            raycaster.setFromCamera(mouse, this.camera);
            const intersects = raycaster.intersectObject(mesh);

            if (intersects.length > 0) {
                callback();
            }
        });
    }

    update() {
        // Add any animation updates here
    }
} 