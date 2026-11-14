
import * as THREE from 'three';

// SAHNE
const scene = new THREE.Scene();
scene.background = new THREE.Color(0x101820);
scene.fog = new THREE.Fog(0x101820, 15, 65);

// KAMERA
const camera = new THREE.PerspectiveCamera(
    75,
    window.innerWidth / window.innerHeight,
    0.1,
    1000
);

camera.position.set(0, 1.7, 8);
camera.rotation.order = "YXZ";

// RENDERER
const renderer = new THREE.WebGLRenderer({
    antialias: true
});

renderer.setSize(window.innerWidth, window.innerHeight);
renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
document.body.appendChild(renderer.domElement);

// IŞIKLAR
scene.add(new THREE.HemisphereLight(0xffffff, 0x303040, 2));

const light = new THREE.DirectionalLight(0xffffff, 2);
light.position.set(5, 10, 5);
scene.add(light);

// ZEMİN
const floor = new THREE.Mesh(
    new THREE.PlaneGeometry(100, 100),
    new THREE.MeshStandardMaterial({ color: 0x303b42 })
);

floor.rotation.x = -Math.PI / 2;
floor.position.y = 0;
scene.add(floor);

// DUVARLAR
function createWall(x, y, z, sx, sy, sz) {
    const wall = new THREE.Mesh(
        new THREE.BoxGeometry(sx, sy, sz),
        new THREE.MeshStandardMaterial({ color: 0x48535c })
    );

    wall.position.set(x, y, z);
    scene.add(wall);
}

createWall(0, 3, -25, 50, 6, 1);
createWall(-25, 3, 0, 1, 6, 50);
createWall(25, 3, 0, 1, 6, 50);
createWall(0, 3, 25, 50, 6, 1);

// HEDEFLER
const targets = [];

function createTarget(x, z) {
    const target = new THREE.Mesh(
        new THREE.BoxGeometry(1.2, 1.5, 0.3),
        new THREE.MeshStandardMaterial({
            color: 0xff4655,
            emissive: 0x330000
        })
    );

    target.position.set(x, 1.7, z);
    scene.add(target);
    targets.push(target);
}

for (let i = 0; i < 8; i++) {
    createTarget(
        Math.random() * 30 - 15,
        -Math.random() * 18 - 5
    );
}

// OYUN DEĞİŞKENLERİ
const keys = {};
let yaw = 0;
let pitch = 0;
let score = 0;

const raycaster = new THREE.Raycaster();

// ARAYÜZ
const menu = document.getElementById("menu");
const hud = document.getElementById("hud");
const button = document.getElementById("play");

const scoreText = document.createElement("div");
scoreText.style.position = "fixed";
scoreText.style.top = "20px";
scoreText.style.right = "25px";
scoreText.style.fontSize = "24px";
scoreText.style.color = "white";
hud.appendChild(scoreText);

function updateScore() {
    scoreText.textContent = "SKOR: " + score;
}

// OYUNA GİRİŞ
button.addEventListener("click", () => {
    renderer.domElement.requestPointerLock();
});

document.addEventListener("pointerlockchange", () => {
    const playing = document.pointerLockElement === renderer.domElement;

    menu.style.display = playing ? "none" : "flex";
    hud.style.display = playing ? "block" : "none";
});

// FAREYLE BAKIŞ
document.addEventListener("mousemove", (event) => {
    if (document.pointerLockElement !== renderer.domElement) return;

    yaw -= event.movementX * 0.002;
    pitch -= event.movementY * 0.002;

    pitch = Math.max(-1.5, Math.min(1.5, pitch));

    camera.rotation.set(pitch, yaw, 0);
});

// KLAVYE
document.addEventListener("keydown", (event) => {
    keys[event.code] = true;
});

document.addEventListener("keyup", (event) => {
    keys[event.code] = false;
});

// ATEŞ ETME
document.addEventListener("mousedown", (event) => {
    if (event.button !== 0) return;
    if (document.pointerLockElement !== renderer.domElement) return;

    raycaster.setFromCamera(new THREE.Vector2(0, 0), camera);

    const hits = raycaster.intersectObjects(targets);

    if (hits.length > 0) {
        const target = hits[0].object;

        scene.remove(target);
        targets.splice(targets.indexOf(target), 1);

        score += 100;
        updateScore();

        createTarget(
            Math.random() * 30 - 15,
            -Math.random() * 18 - 5
        );
    }
});

// HAREKET
const clock = new THREE.Clock();

function animate() {
    requestAnimationFrame(animate);

    const delta = Math.min(clock.getDelta(), 0.05);

    if (document.pointerLockElement === renderer.domElement) {
        const speed = 7 * delta;

        const forward = new THREE.Vector3(
            -Math.sin(yaw), 0, -Math.cos(yaw)
        );

        const right = new THREE.Vector3(
            Math.cos(yaw), 0, -Math.sin(yaw)
        );

        if (keys["KeyW"]) camera.position.addScaledVector(forward, speed);
        if (keys["KeyS"]) camera.position.addScaledVector(forward, -speed);
        if (keys["KeyA"]) camera.position.addScaledVector(right, -speed);
        if (keys["KeyD"]) camera.position.addScaledVector(right, speed);

        camera.position.y = 1.7;

        camera.position.x = THREE.MathUtils.clamp(camera.position.x, -23, 23);
        camera.position.z = THREE.MathUtils.clamp(camera.position.z, -23, 23);
    }

    renderer.render(scene, camera);
}

updateScore();
animate();

// EKRAN BOYUTU
window.addEventListener("resize", () => {
    camera.aspect = window.innerWidth / window.innerHeight;
    camera.updateProjectionMatrix();

    renderer.setSize(window.innerWidth, window.innerHeight);
});


