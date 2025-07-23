import * as THREE from 'three';

class World {
    constructor(scene, camera) {
        this.scene = scene;
        this.camera = camera;
        this.cube = null;
        this._init();
    }

    _init() {
        const geometry = new THREE.BoxGeometry();
        const material = new THREE.MeshStandardMaterial({ color: 0x00ff00 });
        this.cube = new THREE.Mesh(geometry, material);
        this.scene.add(this.cube);

        const light = new THREE.DirectionalLight(0xffffff, 1);
        light.position.set(5, 10, 7.5);
        this.scene.add(light);
    }

    update() {
        if (this.cube) {
            this.cube.rotation.x += 0.01;
            this.cube.rotation.y += 0.01;
        }
    }

    static create(scene, camera) {
        return new World(scene, camera);
    }
}

export default World; 