import * as THREE from 'three';
import { MainMenu } from '../scenes/MainMenu.js';
import { GameScene } from '../scenes/GameScene.js';

export class Game {
    constructor() {
        this.renderer = new THREE.WebGLRenderer({ antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);
        this.renderer.setSize(window.innerWidth, window.innerHeight);
        
        this.currentScene = null;
        this.scenes = {
            mainMenu: new MainMenu(this),
            game: new GameScene(this)
        };

        // Handle window resizing
        window.addEventListener('resize', () => this.onWindowResize());
    }

    init() {
        document.body.appendChild(this.renderer.domElement);
        this.switchToScene('mainMenu');
        this.animate();
    }

    switchToScene(sceneName) {
        this.currentScene = this.scenes[sceneName];
        this.currentScene.init();
    }

    onWindowResize() {
        if (this.currentScene) {
            this.currentScene.onResize(window.innerWidth, window.innerHeight);
        }
        this.renderer.setSize(window.innerWidth, window.innerHeight);
    }

    animate() {
        requestAnimationFrame(() => this.animate());
        
        if (this.currentScene) {
            this.currentScene.update();
            this.renderer.render(this.currentScene.scene, this.currentScene.camera);
        }
    }
} 