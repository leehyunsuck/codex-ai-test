import { createScene } from './scene.js';
import { createPhysics } from './physics.js';
import { spawnDolls } from './doll.js';
import { createCrane } from './crane.js';
import { createInput } from './input.js';

const canvas = document.getElementById('sim-canvas');
const statusEl = document.getElementById('status');

const { THREE, scene, renderer, camera, controls, anchors } = createScene(canvas);
const { CANNON, world, materials } = createPhysics();
const dolls = spawnDolls({ THREE, CANNON, scene, world, materials });
const crane = createCrane({ THREE, CANNON, scene, world, materials });
const input = createInput();

const difficulty = {
  level: 2,
  gripBase: 0.74,
  gripVariance: 0.2,
  slipBoost: 0.2,
};

let score = 0;
let timeLeft = 60;
let clockAccumulator = 0;

function getGripStrength() {
  const rand = Math.random() * 2 - 1;
  return difficulty.gripBase + rand * difficulty.gripVariance;
}

function tryCatchDoll() {
  const grip = getGripStrength();
  const clawPos = crane.carrierBody.position;

  let closest = null;
  let closestDist = Infinity;
  dolls.forEach((doll) => {
    const dx = doll.body.position.x - clawPos.x;
    const dy = doll.body.position.y - clawPos.y;
    const dz = doll.body.position.z - clawPos.z;
    const dist = Math.sqrt(dx * dx + dy * dy + dz * dz);
    if (dist < 0.75 && dist < closestDist) {
      closestDist = dist;
      closest = doll;
    }
  });

  if (!closest) return;

  const difficultyFactor = closest.body.userData.difficulty;
  const successChance = grip - difficultyFactor * 0.45;

  if (Math.random() < successChance) {
    crane.state.carriedBody = closest.body;
  }
}

function updateCarry(dt) {
  const body = crane.state.carriedBody;
  if (!body) return;

  const target = crane.carrierBody.position;
  body.velocity.set(0, 0, 0);
  body.angularVelocity.scale(0.6, body.angularVelocity);
  body.position.x += (target.x - body.position.x) * Math.min(1, dt * 7);
  body.position.y += (target.y - 0.5 - body.position.y) * Math.min(1, dt * 7);
  body.position.z += (target.z - body.position.z) * Math.min(1, dt * 7);

  const dropRisk = difficulty.slipBoost * (0.5 + Math.random() * 0.7);
  const motionPenalty = Math.abs(Math.sin(crane.state.shake)) * 0.12;
  if (crane.state.phase === 'lifting' && Math.random() < dropRisk * motionPenalty) {
    crane.state.carriedBody = null;
  }

  if (crane.state.phase === 'releasing') {
    crane.state.carriedBody = null;
  }
}

function checkPrize() {
  dolls.forEach((doll) => {
    if (doll.scored) return;
    const p = doll.body.position;
    const z = anchors.prizeZone.position;
    const inZone = Math.abs(p.x - z.x) < 0.9 && Math.abs(p.z - z.z) < 0.8 && p.y < 1.2;
    if (inZone) {
      doll.scored = true;
      score += 1;
    }
  });
}

let prev = performance.now();

function loop(now) {
  const dt = Math.min(1 / 30, (now - prev) / 1000);
  prev = now;

  const { dx, dz, drop } = input.axis();
  crane.moveInput(dx, dz, dt);

  if (drop && crane.state.phase === 'idle') {
    crane.commandDrop();
    input.consumeDrop();
  }

  if (crane.state.phase === 'closing' && !crane.state.carriedBody) {
    tryCatchDoll();
  }

  crane.update(dt, difficulty.level / 4);
  updateCarry(dt);

  world.step(1 / 60, dt, 3);

  dolls.forEach((doll) => {
    doll.mesh.position.copy(doll.body.position);
    doll.mesh.quaternion.copy(doll.body.quaternion);
  });

  checkPrize();

  controls.update();
  renderer.render(scene, camera);

  clockAccumulator += dt;
  if (clockAccumulator >= 1 && timeLeft > 0) {
    timeLeft -= 1;
    clockAccumulator = 0;
  }

  statusEl.innerHTML = [
    `점수: <strong>${score}</strong>`,
    `남은 시간: <strong>${timeLeft}s</strong>`,
    `상태: <strong>${crane.state.phase}</strong>`,
    '난이도: grip 랜덤 / 탈락 확률 / 인형별 난이도 적용',
  ].join('<br />');

  requestAnimationFrame(loop);
}

requestAnimationFrame(loop);
