import * as THREE from 'three';
import { Colours } from './Colours';
import { EXRLoader } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';

const helpersEnabled = true;

class World {
    constructor(scene, camera, renderer) {
        /**
         * @type {THREE.Scene}
         */
        this.scene = scene;
        /**
         * @type {THREE.PerspectiveCamera}
         */
        this.camera = camera;

        /**
         * @type {THREE.WebGLRenderer}
         */
        this.renderer = renderer;

        /**
         * @type {THREE.TextureLoader}
         */
        this.textureLoader = new THREE.TextureLoader();

        /**
         * @type {GLTFLoader}
         */
        this.modelLoader = new GLTFLoader();

        /**
         * @type {THREE.AnimationMixer[]}
         */
        this.animationMixers = [];

        /**
         * @type {THREE.Clock}
         */
        this.clock = new THREE.Clock();

        // Initialising the world
        this._init();
    }

    _init() {
        // Setting up the scene
        this.setupScene();

        // Setting up the groun plane
        this.setupPlane();

        // Setting up the lighting of the scene
        this.setupLighting();

        // Setting up the environment
        this.setupEnvironment();

        if (helpersEnabled) {
            this.helpers();
        }
    }

    setupScene() {
        this.scene.background = new THREE.Color().setHex(Colours.SKY); // Light Sky Blue
        // this.scene.fog = new THREE.Fog(Colours.SKY, 0.1, 50);

        const exrLoader = new EXRLoader();
        const pmremGenerator = new THREE.PMREMGenerator(this.renderer);
        pmremGenerator.compileEquirectangularShader();

        exrLoader.load(
            'src/assets/hdris/NightSkyHDRI007_2K-HDR.exr',
            (texture) => {
                const envMap = pmremGenerator.fromEquirectangular(texture).texture;

                this.scene.environment = envMap;  // Used for realistic reflections/lighting
                this.scene.background = envMap;   // Set it as sky background

                texture.dispose();           // Clean up raw EXR texture
                pmremGenerator.dispose();
            }
        );

        this.renderer.toneMapping = THREE.ACESFilmicToneMapping;
        this.renderer.toneMappingExposure = 1.0; // Adjust to taste
    }

    setupPlane() {
        const geometry = new THREE.PlaneGeometry( 100, 100 );
        
        const textureBasePath = 'src/assets/textures/ground/Ground037_1K-PNG_';

        const colour = this.textureLoader.load(textureBasePath + 'Color.png');
        const normal = this.textureLoader.load(textureBasePath + 'NormalGL.png');
        const ao = this.textureLoader.load(textureBasePath + 'AmbientOcclusion.png');
        const displacement = this.textureLoader.load(textureBasePath + 'Displacement.png');
        const roughness = this.textureLoader.load(textureBasePath + 'Roughness.png');

        // const scale = 100 / 2.1;

        /**
         * @type {Array<THREE.Texture>}
         */
        const maps = [colour, normal, ao, displacement, roughness];
        maps.map(map => {
            map.wrapS = map.wrapT = THREE.RepeatWrapping;
            map.repeat.set(100, 100);
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

    /**
     * Load a 3D model with position, scale, rotation and animation support
     * @param {string} modelDirectory - Directory name inside /models/ (e.g., 'moutain_scroll')
     * @param {THREE.Vector3} position - Position vector for the model
     * @param {THREE.Vector3} scale - Scale vector for the model  
     * @param {THREE.Euler} rotation - Rotation euler for the model
     * @param {Object} options - Additional options
     * @param {boolean} options.playAnimations - Whether to play animations automatically (default: true)
     * @param {string|null} options.specificAnimation - Name of specific animation to play (default: null - plays all)
     * @param {boolean} options.loop - Whether animations should loop (default: true)
     * @param {Function|null} options.onLoad - Callback when model loads successfully
     * @param {Function|null} options.onProgress - Progress callback
     * @param {Function|null} options.onError - Error callback
     * @returns {Promise<Object>} Promise that resolves with {scene, animations, mixer}
     */
    loadModel(modelDirectory, position, scale, rotation, options = {}) {
        const {
            playAnimations = true,
            specificAnimation = null,
            loop = true,
            onLoad = null,
            onProgress = null,
            onError = null
        } = options;

        const modelPath = `/models/${modelDirectory}/scene.gltf`;

        return new Promise((resolve, reject) => {
            this.modelLoader.load(
                modelPath,
                (gltf) => {
                    // Set transform properties
                    gltf.scene.position.copy(position);
                    gltf.scene.scale.copy(scale);
                    gltf.scene.rotation.copy(rotation);

                    // Add to scene
                    this.scene.add(gltf.scene);

                    // Handle animations
                    let mixer = null;
                    let playingActions = [];

                    if (gltf.animations && gltf.animations.length > 0 && playAnimations) {
                        mixer = new THREE.AnimationMixer(gltf.scene);
                        this.animationMixers.push(mixer);

                        if (specificAnimation) {
                            // Play specific animation
                            const clip = THREE.AnimationClip.findByName(gltf.animations, specificAnimation);
                            if (clip) {
                                const action = mixer.clipAction(clip);
                                action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce);
                                action.play();
                                playingActions.push(action);
                                console.log(`Playing animation: ${specificAnimation}`);
                            } else {
                                console.warn(`Animation '${specificAnimation}' not found in model '${modelDirectory}'`);
                            }
                        } else {
                            // Play all animations
                            gltf.animations.forEach((clip, index) => {
                                const action = mixer.clipAction(clip);
                                action.setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce);
                                action.play();
                                playingActions.push(action);
                                console.log(`Playing animation ${index}: ${clip.name || 'Unnamed'}`);
                            });
                        }
                    }

                    const result = {
                        scene: gltf.scene,
                        animations: gltf.animations,
                        mixer: mixer,
                        actions: playingActions,
                        gltf: gltf
                    };

                    console.log(`Model '${modelDirectory}' loaded successfully`);
                    if (gltf.animations.length > 0) {
                        console.log(`Found ${gltf.animations.length} animations:`, gltf.animations.map(clip => clip.name || 'Unnamed'));
                    }

                    if (onLoad) onLoad(result);
                    resolve(result);
                },
                (xhr) => {
                    const progress = xhr.loaded / xhr.total * 100;
                    console.log(`Loading '${modelDirectory}': ${progress.toFixed(1)}%`);
                    if (onProgress) onProgress(xhr);
                },
                (error) => {
                    console.error(`Error loading model '${modelDirectory}':`, error);
                    if (onError) onError(error);
                    reject(error);
                }
            );
        });
    }

    setupEnvironment() {
        // Example usage of the new loadModel function
        // this.loadModel(
        //     'moutain_scroll',
        //     new THREE.Vector3(60, -1, 0),
        //     new THREE.Vector3(1, 1, 1),
        //     new THREE.Euler(0, Math.PI, 0),
        //     {
        //         playAnimations: true,
        //         loop: true,
        //         onLoad: (result) => {
        //             console.log('Mountain scroll loaded with animations:', result.animations.length);
        //         }
        //     }
        // );

        // this.loadModel(
        //     'shiny_marshadow',
        //     new THREE.Vector3(0, 0, 0),
        //     new THREE.Vector3(1, 1, 1),
        //     new THREE.Euler(0, -Math.PI / 2, 0),
        //     {
        //         playAnimations: false,
        //         loop: true,
        //         onLoad: (result) => {
        //             console.log('Shiny Marshadow loaded with animations:', result.animations.length);
        //         }
        //     }
        // );
        
        this.loadModel(
            'chinese_hall',
            new THREE.Vector3(50, 0, 0),
            new THREE.Vector3(0.005, 0.005, 0.005),
            new THREE.Euler(0, -Math.PI / 2, 0),
            {
                playAnimations: false,
                loop: false,
                onLoad: () => {
                    console.log('Chinese Hall loaded');
                }
            }
        );
    }
    
    helpers() {
        const axesHelper = new THREE.AxesHelper( 500 );
        this.scene.add( axesHelper );
    }

    update() {
        // Update all animation mixers
        const delta = this.clock.getDelta();
        this.animationMixers.forEach(mixer => {
            mixer.update(delta);
        });
    }

    static create(scene, camera, renderer) {
        return new World(scene, camera, renderer);
    }

    
}

export default World; 