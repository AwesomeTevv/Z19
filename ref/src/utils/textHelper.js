import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';

const fontLoader = new FontLoader();
let cachedFont = null;

export async function createTextMesh(text, size = 1) {
    if (!cachedFont) {
        try {
            cachedFont = await fontLoader.loadAsync('/fonts/helvetiker_regular.typeface.json');
        } catch (error) {
            console.error('Error loading font:', error);
            return null;
        }
    }

    const geometry = new TextGeometry(text, {
        font: cachedFont,
        size: size,
        height: size * 0.2,
        curveSegments: 12,
        bevelEnabled: true,
        bevelThickness: size * 0.05,
        bevelSize: size * 0.02,
        bevelOffset: 0,
        bevelSegments: 5
    });

    // Center the text geometry
    geometry.computeBoundingBox();
    const centerOffset = new THREE.Vector3();
    geometry.boundingBox.getCenter(centerOffset).multiplyScalar(-1);
    geometry.translate(centerOffset.x, centerOffset.y, centerOffset.z);

    // Create material with nice shading
    const material = new THREE.MeshPhongMaterial({
        color: 0xffffff,
        shininess: 100,
        flatShading: false
    });

    return new THREE.Mesh(geometry, material);
} 