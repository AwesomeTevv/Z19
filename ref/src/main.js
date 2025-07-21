import { Game } from './game/Game.js';
import { LoadingManager } from 'three';

// Create loading manager to track asset loading
const loadingManager = new LoadingManager();
const loadingScreen = document.getElementById('loading-screen');
const progressBar = document.querySelector('.progress');

loadingManager.onProgress = (url, itemsLoaded, itemsTotal) => {
    const progress = (itemsLoaded / itemsTotal) * 100;
    progressBar.style.width = progress + '%';
};

loadingManager.onLoad = () => {
    // Fade out loading screen
    loadingScreen.style.opacity = '0';
    setTimeout(() => {
        loadingScreen.style.display = 'none';
    }, 500);
};

// Initialize game
const game = new Game(loadingManager);
game.init(); 