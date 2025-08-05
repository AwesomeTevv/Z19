import * as THREE from 'three';
import World from './World.js';
import { OrbitControls } from 'three/examples/jsm/Addons.js';
import Stats from 'three/examples/jsm/libs/stats.module.js';

class Game {
    constructor(canvas) {
        this.canvas = canvas;

        /**
         * @type {THREE.WebGLRenderer}
         */
        this.renderer = new THREE.WebGLRenderer({ canvas: this.canvas, antialias: true });
        this.renderer.setPixelRatio(window.devicePixelRatio);

        /**
         * @type {THREE.Scene}
         */
        this.scene = new THREE.Scene();

        /**
         * @type {THREE.PerspectiveCamera}
         */
        this.camera = new THREE.PerspectiveCamera(75, window.innerWidth / window.innerHeight, 0.1, 1000);
        this.camera.position.set(-5, 10, 0);
        this.camera.lookAt(new THREE.Vector3(0, 0, 0));

        /**
         * @type {THREE.OrbitControls}
         */
        this.controls = new OrbitControls( this.camera, this.renderer.domElement );

        this.controls.update();

        // Camera switching system
        this.isOrbitMode = true;
        this.fixedCameraPosition = new THREE.Vector3(0, 1, 0);
        this.fixedCameraTarget = new THREE.Vector3(100, 0, 0);
        
        // Store initial orbit camera state
        this.orbitCameraPosition = this.camera.position.clone();
        this.orbitCameraTarget = this.controls.target.clone();

        /**
         * @type {Stats}
         */
        this.stats = new Stats();
        this.stats.showPanel(0); // 0: fps, 1: ms, 2: mb, 3+: custom
        document.body.appendChild(this.stats.dom);

        this.world = World.create(this.scene, this.camera, this.renderer);

        this._resize = this._resize.bind(this);
        window.addEventListener('resize', this._resize);
        this._resize();

        // Set up camera switching
        this._setupCameraSwitching();

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

    _setupCameraSwitching() {
        // Create camera mode indicator
        this.cameraIndicator = document.createElement('section');
        this.cameraIndicator.style.position = 'fixed';
        this.cameraIndicator.style.top = '10px';
        this.cameraIndicator.style.right = '10px';
        this.cameraIndicator.style.padding = '10px';
        this.cameraIndicator.style.backgroundColor = 'rgba(0, 0, 0, 0.7)';
        this.cameraIndicator.style.color = 'white';
        this.cameraIndicator.style.fontFamily = 'monospace';
        this.cameraIndicator.style.fontSize = '14px';
        this.cameraIndicator.style.borderRadius = '5px';
        this.cameraIndicator.style.zIndex = '1000';
        this.updateCameraIndicator();
        document.body.appendChild(this.cameraIndicator);

        // Add keyboard listener
        this._onKeyDown = this._onKeyDown.bind(this);
        window.addEventListener('keydown', this._onKeyDown);
    }

    _onKeyDown(event) {
        if (event.key.toLowerCase() === 's') {
            this.switchCamera();
        } else if (event.key.toLowerCase() === 'l' && this.isOrbitMode) {
            // Log current camera position when in orbit mode
            this.logCameraPosition();
        }
    }

    switchCamera() {
        if (this.isOrbitMode) {
            // Switch to fixed camera
            this.switchToFixedCamera();
        } else {
            // Switch to orbit camera
            this.switchToOrbitCamera();
        }
        this.updateCameraIndicator();
    }

    switchToFixedCamera() {
        // Store current orbit state
        this.orbitCameraPosition.copy(this.camera.position);
        this.orbitCameraTarget.copy(this.controls.target);

        // Completely disable orbit controls
        this.controls.enabled = false;
        this.controls.enableRotate = false;
        this.controls.enablePan = false;
        this.controls.enableZoom = false;

        // Set fixed camera position
        this.camera.position.copy(this.fixedCameraPosition);
        
        // Calculate direction vector
        const direction = new THREE.Vector3();
        direction.subVectors(this.fixedCameraTarget, this.fixedCameraPosition).normalize();
        
        // Calculate rotation using spherical coordinates
        const spherical = new THREE.Spherical();
        spherical.setFromVector3(direction);
        
        // Convert spherical to Euler angles
        const euler = new THREE.Euler();
        euler.y = spherical.theta; // Horizontal rotation (yaw)
        euler.x = -spherical.phi + Math.PI / 2; // Vertical rotation (pitch) - adjusted for camera coordinate system
        euler.z = 0; // No roll
        
        // Apply rotation to camera
        this.camera.rotation.copy(euler);
        
        // Alternative method: try using lookAt after position is set
        this.camera.lookAt(this.fixedCameraTarget);
        
        // Force matrix updates
        this.camera.updateMatrix();
        this.camera.updateMatrixWorld(true);

        this.isOrbitMode = false;
        console.log('Switched to FIXED camera mode');
    }

    switchToOrbitCamera() {
        // Re-enable all orbit controls
        this.controls.enabled = true;
        this.controls.enableRotate = true;
        this.controls.enablePan = true;
        this.controls.enableZoom = true;

        // Restore orbit camera state
        this.camera.position.copy(this.orbitCameraPosition);
        this.controls.target.copy(this.orbitCameraTarget);
        this.controls.update();

        this.isOrbitMode = true;
        console.log('Switched to ORBIT camera mode');
    }

    updateCameraIndicator() {
        const mode = this.isOrbitMode ? 'ORBIT' : 'FIXED';
        const instructions = this.isOrbitMode ? 
            'Press S: Fixed Camera | Press L: Log Position' : 
            'Press S: Orbit Camera';
        
        this.cameraIndicator.innerHTML = `
            <strong>Camera Mode: ${mode}</strong><br>
            ${instructions}
        `;
    }

    logCameraPosition() {
        const pos = this.camera.position;
        const target = this.controls.target;
        
        console.log('=== CAMERA POSITION INFO ===');
        console.log(`Position: new THREE.Vector3(${pos.x.toFixed(2)}, ${pos.y.toFixed(2)}, ${pos.z.toFixed(2)})`);
        console.log(`Target: new THREE.Vector3(${target.x.toFixed(2)}, ${target.y.toFixed(2)}, ${target.z.toFixed(2)})`);
        console.log('Copy this to set your fixed camera position!');
    }

    // Method to update fixed camera settings (call this from console or programmatically)
    setFixedCamera(position, target) {
        this.fixedCameraPosition.copy(position);
        this.fixedCameraTarget.copy(target);
        
        if (!this.isOrbitMode) {
            // If currently in fixed mode, apply immediately using the same method as switchToFixedCamera
            this.camera.matrix.identity();
            this.camera.matrixWorld.identity();
            
            this.camera.position.copy(this.fixedCameraPosition);
            
            const lookAtMatrix = new THREE.Matrix4();
            lookAtMatrix.lookAt(this.fixedCameraPosition, this.fixedCameraTarget, new THREE.Vector3(0, 1, 0));
            this.camera.quaternion.setFromRotationMatrix(lookAtMatrix);
            
            this.camera.updateMatrix();
            this.camera.updateMatrixWorld(true);
        }
    }

    _animate() {
        this.stats.begin();
        
        requestAnimationFrame(this._animate);
        if (this.world && this.world.update) {
            this.world.update();
        }
        
        // Only update controls if in orbit mode
        if (this.isOrbitMode) {
            this.controls.update();
        }
        
        this.renderer.render(this.scene, this.camera);
        
        this.stats.end();
    }
}

export default Game; 