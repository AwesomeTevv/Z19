import * as THREE from 'three';

export class World {
    constructor(scene) {
        this.scene = scene;
        this.mesh = new THREE.Group();
        this.createGround();
        this.createEnvironment();
    }

    createGround() {
        // Create a large ground plane
        const groundGeometry = new THREE.PlaneGeometry(100, 100);
        const groundMaterial = new THREE.MeshStandardMaterial({
            color: 0x88aa88,
            roughness: 0.8,
            metalness: 0.2
        });
        const ground = new THREE.Mesh(groundGeometry, groundMaterial);
        ground.rotation.x = -Math.PI / 2;
        ground.receiveShadow = true;
        this.mesh.add(ground);

        // Add a grid helper for visual reference
        const gridHelper = new THREE.GridHelper(100, 100);
        this.mesh.add(gridHelper);
    }

    createEnvironment() {
        // Add some basic environment elements
        this.addTrees();
        this.addRocks();
    }

    addTrees() {
        const treePositions = [
            { x: 10, z: 10 },
            { x: -15, z: 8 },
            { x: 5, z: -12 },
            { x: -8, z: -15 }
        ];

        treePositions.forEach(pos => {
            const tree = this.createTree();
            tree.position.set(pos.x, 0, pos.z);
            this.mesh.add(tree);
        });
    }

    addRocks() {
        const rockPositions = [
            { x: 7, z: -5 },
            { x: -10, z: 3 },
            { x: 3, z: 8 }
        ];

        rockPositions.forEach(pos => {
            const rock = this.createRock();
            rock.position.set(pos.x, 0, pos.z);
            this.mesh.add(rock);
        });
    }

    createTree() {
        const tree = new THREE.Group();

        // Create trunk
        const trunkGeometry = new THREE.CylinderGeometry(0.2, 0.3, 2, 8);
        const trunkMaterial = new THREE.MeshStandardMaterial({ color: 0x8B4513 });
        const trunk = new THREE.Mesh(trunkGeometry, trunkMaterial);
        trunk.position.y = 1;
        trunk.castShadow = true;
        tree.add(trunk);

        // Create leaves
        const leavesGeometry = new THREE.ConeGeometry(1.5, 3, 8);
        const leavesMaterial = new THREE.MeshStandardMaterial({ color: 0x228B22 });
        const leaves = new THREE.Mesh(leavesGeometry, leavesMaterial);
        leaves.position.y = 3;
        leaves.castShadow = true;
        tree.add(leaves);

        return tree;
    }

    createRock() {
        const rockGeometry = new THREE.DodecahedronGeometry(0.5);
        const rockMaterial = new THREE.MeshStandardMaterial({
            color: 0x808080,
            roughness: 0.9,
            metalness: 0.1
        });
        const rock = new THREE.Mesh(rockGeometry, rockMaterial);
        rock.position.y = 0.25;
        rock.rotation.set(
            Math.random() * Math.PI,
            Math.random() * Math.PI,
            Math.random() * Math.PI
        );
        rock.castShadow = true;
        rock.receiveShadow = true;
        return rock;
    }
} 