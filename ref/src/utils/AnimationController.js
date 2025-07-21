import * as THREE from 'three';

export class AnimationController {
    constructor(animations) {
        this.animations = {};
        this.mixer = null;
        this.currentAction = null;
        this.clock = new THREE.Clock();

        if (animations && animations.length > 0) {
            this.mixer = new THREE.AnimationMixer(animations[0].hierarchy[0]);
            animations.forEach(animation => {
                this.animations[animation.name] = this.mixer.clipAction(animation);
            });
        }
    }

    play(animationName, loop = true, onComplete = null) {
        if (!this.mixer || !this.animations[animationName]) return;

        const nextAction = this.animations[animationName];
        
        if (this.currentAction === nextAction) return;

        if (this.currentAction) {
            this.currentAction.fadeOut(0.2);
        }

        nextAction.reset()
            .setLoop(loop ? THREE.LoopRepeat : THREE.LoopOnce, Infinity)
            .fadeIn(0.2)
            .play();

        if (!loop && onComplete) {
            nextAction.clampWhenFinished = true;
            this.mixer.addEventListener('finished', () => {
                onComplete();
                this.mixer.removeEventListener('finished');
            });
        }

        this.currentAction = nextAction;
    }

    update() {
        if (this.mixer) {
            const delta = this.clock.getDelta();
            this.mixer.update(delta);
        }
    }

    stopAll() {
        if (this.currentAction) {
            this.currentAction.stop();
            this.currentAction = null;
        }
    }
} 