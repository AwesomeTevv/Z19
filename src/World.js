import * as THREE from 'three';
import { Colours } from './Colours';

const helpersEnabled = true;

class World {
    constructor(scene, camera) {
        /**
         * @type {THREE.Scene}
         */
        this.scene = scene;
        /**
         * @type {THREE.PerspectiveCamera}
         */
        this.camera = camera;

        /**
         * @type {THREE.TextureLoader}
         */
        this.textureLoader = new THREE.TextureLoader();

        // Initialising the world
        this._init();
    }

    _init() {
        // Setting up the scene
        this.scene.background = new THREE.Color().setHex(Colours.SKY); // Light Sky Blue
        this.scene.fog = new THREE.Fog(Colours.SKY, 0.1, 50);

        // Setting up the groun plane
        this.setupPlane();

        // Setting up the lighting of the scene
        this.setupLighting();

        if (helpersEnabled) {
            this.helpers();
        }
    }

    setupPlane() {
        const geometry = new THREE.PlaneGeometry( 1000, 1000 );
        
        const textureBasePath = 'src/assets/textures/ground/Ground037_1K-PNG_';

        const colour = this.textureLoader.load(textureBasePath + 'Color.png');
        const normal = this.textureLoader.load(textureBasePath + 'NormalGL.png');
        const ao = this.textureLoader.load(textureBasePath + 'AmbientOcclusion.png');
        const displacement = this.textureLoader.load(textureBasePath + 'Displacement.png');
        const roughness = this.textureLoader.load(textureBasePath + 'Roughness.png');

        const scale = 1000 / 2.1;

        /**
         * @type {Array<THREE.Texture>}
         */
        const maps = [colour, normal, ao, displacement, roughness];
        maps.map(map => {
            map.wrapS = map.wrapT = THREE.RepeatWrapping;
            map.repeat.set(scale, scale);
        });
        
        const material = new THREE.MeshToonMaterial({
            // color: Colours.GROUND, // Columbia Blue
            side: THREE.DoubleSide,
            map: colour,
            normalMap: normal,
            // displacementMap: displacement,
            aoMap: ao,
            bumpMap: roughness
        });
        
        const plane = new THREE.Mesh( geometry, material );
        plane.rotation.x = -Math.PI / 2;
        this.scene.add(plane)
    }

    setupLighting () {
        // Ambient Light
        const ambientLight = new THREE.AmbientLight( 0x404040 ); // soft white light
        this.scene.add( ambientLight );

        // Hemisphere Light
        const hemisphereLight = new THREE.HemisphereLight(
            Colours.SKY,   // Sky colour
            Colours.GROUND,   // Ground colour
            1           // Intensity
        );
        this.scene.add( hemisphereLight );

        // White directional light at half intensity shining from the top.
        const directionalLight = new THREE.DirectionalLight( 0xffffff, 0.5 );
        // directionalLight.position.set(5, 10, 7.5);
        this.scene.add( directionalLight );
    }
    
    helpers() {
        const axesHelper = new THREE.AxesHelper( 500 );
        this.scene.add( axesHelper );
    }

    update() {
        // if (this.cube) {
        //     this.cube.rotation.x += 0.01;
        //     this.cube.rotation.y += 0.01;
        // }
    }

    static create(scene, camera) {
        return new World(scene, camera);
    }

    
}

export default World; 