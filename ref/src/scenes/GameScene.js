import * as THREE from 'three';
import { Scene } from './Scene.js';
import { Player } from '../entities/Player.js';
import { Pokemon } from '../entities/Pokemon.js';
import { World } from '../world/World.js';

export class GameScene extends Scene {
    constructor(game) {
        super(game);
        this.setupScene();
    }

    setupScene() {
        // Add ambient light
        const ambientLight = new THREE.AmbientLight(0xffffff, 0.5);
        this.scene.add(ambientLight);

        // Add directional light for shadows
        const directionalLight = new THREE.DirectionalLight(0xffffff, 0.8);
        directionalLight.position.set(100, 100, 100);
        directionalLight.castShadow = true;
        this.scene.add(directionalLight);

        // Setup world
        this.world = new World(this);
        this.scene.add(this.world.mesh);

        // Setup player
        this.player = new Player(this);
        this.scene.add(this.player.mesh);

        // Setup pokemon companion
        this.pokemon = new Pokemon(this);
        this.scene.add(this.pokemon.mesh);

        // Position camera behind player
        this.camera.position.set(0, 5, 10);
        this.camera.lookAt(0, 0, 0);
    }

    update() {
        // Update player
        this.player.update();

        // Update pokemon
        this.pokemon.update();

        // Update camera to follow player
        const playerPosition = this.player.mesh.position;
        this.camera.position.x = playerPosition.x;
        this.camera.position.z = playerPosition.z + 10;
        this.camera.lookAt(playerPosition);
    }
} 