import * as THREE from 'three';
import { Colours } from './Colours';
import { EXRLoader } from 'three/examples/jsm/Addons.js';
import { GLTFLoader } from 'three/examples/jsm/Addons.js';
import { toRadians } from './helpers/mathHelpers';

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

        // Setting up the Chinese lanterns
        this.setupLanterns();
        
        // Setting up the grass objects
        this.setupGrass();

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
        this.renderer.toneMappingExposure = 1.0;
        
        // // Performance optimizations
        // this.renderer.shadowMap.enabled = false; // Disable shadows for better performance
        // this.renderer.shadowMap.type = THREE.PCFSoftShadowMap; // If shadows needed later
        // this.renderer.outputColorSpace = THREE.SRGBColorSpace;
    }

    setupPlane() {
        const geometry = new THREE.PlaneGeometry( 50, 100 );
        
        const textureBasePath = 'src/assets/textures/grass/2K/Poliigon_GrassPatchyGround_4585_';
        const suffix = '.jpg';

        // const textureBasePath = 'src/assets/textures/ground/Ground037_1K-PNG_';
        // const suffix = '.png';

        const colour = this.textureLoader.load(textureBasePath + 'BaseColor' + suffix);
        const normal = this.textureLoader.load(textureBasePath + 'Normal' + suffix);
        const ao = this.textureLoader.load(textureBasePath + 'AmbientOcclusion' + suffix);
        const displacement = this.textureLoader.load(textureBasePath + 'Displacement' + suffix);
        const roughness = this.textureLoader.load(textureBasePath + 'Roughness' + suffix);

        // const scale = 100 / 2.1;

        /**
         * @type {Array<THREE.Texture>}
         */
        const maps = [colour, normal, ao, displacement, roughness];
        maps.map(map => {
            map.wrapS = map.wrapT = THREE.RepeatWrapping;
            map.repeat.set(25, 50); // Further reduced for performance
            map.generateMipmaps = true; // Enable mipmaps for better performance at distance
        });
        
        const material = new THREE.MeshPhongMaterial({
            // color: Colours.GROUND, // Columbia Blue
            // side: THREE.DoubleSide,
            map: colour,
            normalMap: normal,
            displacementMap: displacement,
            aoMap: ao,
            bumpMap: roughness,
        });
        
        const plane = new THREE.Mesh( geometry, material );
        plane.position.x = 25;
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

        // Shiny Marshadow
        this.loadModel(
            'shiny_marshadow',
            new THREE.Vector3(5, 0, 5),
            new THREE.Vector3(0.5, 0.5, 0.5),
            new THREE.Euler(0, toRadians(-90 - 45), 0),
            {
                playAnimations: false,
                loop: true,
                onLoad: (result) => {
                    console.log('Shiny Marshadow loaded with animations:', result.animations.length);
                }
            }
        );

        this.loadModel(
            'marshadow',
            new THREE.Vector3(8, 0, 0),
            new THREE.Vector3(0.5, 0.5, 0.5),
            new THREE.Euler(0, toRadians(-90), 0),
            {
                playAnimations: false,
                loop: true,
                onLoad: (result) => {
                    console.log('Marshadow loaded with animations:', result.animations.length);
                }
            }
        );


        // Loading the Chinese hall
        this.loadModel(
            'chinese_hall',
            new THREE.Vector3(25, 0, 0),
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

        // Loading the PokéCenter
        this.loadModel(
            'pokecenter',
            new THREE.Vector3(10, 1.5, 10),
            new THREE.Vector3(2, 2, 2), // Fixed: was Vector4, should be Vector3
            new THREE.Euler(0, -Math.PI / 2, 0),
            {
                playAnimations: false,
                loop: false,
                onLoad: () => {
                    console.log('PokéCenter loaded');
                }
            }
        );

        // Spider Lily
        this.loadModel(
            'spider_lily',
            new THREE.Vector3(1, 0, 0),
            new THREE.Vector3(1, 1, 1),
            new THREE.Euler(0, -Math.PI / 2, 0),
            {
                playAnimations: false,
                loop: false,
                onLoad: () => {
                    console.log('Spider Lily loaded');
                }
            }
        );

        // Hollow knight bench
        this.loadModel(
            'theknight',
            new THREE.Vector3(4, 0, -2),
            new THREE.Vector3(2, 2, 2),
            new THREE.Euler(0, toRadians(-125), 0),
            {
                playAnimations: false,
                loop: false,
                onLoad: () => {
                    console.log('The Knight has been loaded');
                }
            }
        );

        // Mimikyu
        this.loadModel(
            'mimikyu',
            new THREE.Vector3(4, 0, -6),
            new THREE.Vector3(1, 1, 1),
            new THREE.Euler(0, toRadians(-90 + 50), 0),
            {
                playAnimations: false,
                loop: true,
                onLoad: () => {
                    console.log('Mimkyu has been loaded');
                }
            }
        );

        // Spiritfarer hat
        this.loadModel(
            'spiritfarer',
            new THREE.Vector3(8, 1, 3),
            new THREE.Vector3(0.001, 0.001, 0.001),
            new THREE.Euler(0, toRadians(0), 0),
            {
                playAnimations: false,
                loop: true,
                onLoad: () => {
                    console.log('Spiritfarer has been loaded');
                }
            }
        );

        // Pig
        this.loadModel(
            'pig',
            new THREE.Vector3(8, 0.6, 3),
            new THREE.Vector3(0.05, 0.05, 0.05),
            new THREE.Euler(0, toRadians(-90 - 15), 0),
            {
                playAnimations: false,
                loop: false,
                onLoad: () => {
                    console.log('Pig has been loaded');
                }
            }
        );

        // Enderman
        this.loadModel(
            'enderman',
            new THREE.Vector3(8, 0.6, 10),
            new THREE.Vector3(0.025, 0.025, 0.025),
            new THREE.Euler(0, toRadians(-90), 0),
            {
                playAnimations: false,
                loop: false,
                onLoad: () => {
                    console.log('The Knight has been loaded');
                }
            }
        );

    }

    setupLanterns() {
        const positions = [
            new THREE.Vector3(20, 4, 14),
            new THREE.Vector3(20, 4, -14),
            new THREE.Vector3(21, 8, 13),
            new THREE.Vector3(21, 8, -13),
            new THREE.Vector3(21, 2, 0),
        ];

        positions.forEach(position => {
            const light = new THREE.PointLight( 0xff0000, 100, 100 );
            light.position.copy(position);
            this.scene.add(light);
        });
    }

    setupGrass() {
        const positions = [
            new THREE.Vector3(4, -0.15, 0),
            new THREE.Vector3(4, -0.2, 7),
            new THREE.Vector3(4, -0.2, -6),
        ];
        positions.forEach((position, index) => {
            this.loadModel(
                'grass3',
                position,
                new THREE.Vector3(0.5, 0.5, 0.5),
                new THREE.Euler(0, toRadians(90), 0),
                {
                    playAnimations: false,
                    loop: false,
                    onLoad: () => {
                        console.log(`Grass ${index} loaded`);
                    }
                }
            );
        })
    }
    
    helpers() {
        const axesHelper = new THREE.AxesHelper( 500 );
        this.scene.add( axesHelper );
    }

    update() {
        // Update all animation mixers with performance optimization
        const delta = this.clock.getDelta();
        
        // Limit delta to prevent large jumps that can cause performance issues
        const clampedDelta = Math.min(delta, 0.1);
        
        // Only update mixers that have active animations
        this.animationMixers.forEach(mixer => {
            if (mixer._actions && mixer._actions.length > 0) {
                // Check if any actions are actually playing
                const hasActiveActions = mixer._actions.some(action => action.isRunning());
                if (hasActiveActions) {
                    mixer.update(clampedDelta);
                }
            }
        });
    }

    static create(scene, camera, renderer) {
        return new World(scene, camera, renderer);
    }

    
}

export default World; 