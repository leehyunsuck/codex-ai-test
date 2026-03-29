export function createCrane({ THREE, CANNON, scene, world, materials }) {
  const craneGroup = new THREE.Group();
  scene.add(craneGroup);

  const carriage = new THREE.Mesh(
    new THREE.BoxGeometry(1.2, 0.35, 1.2),
    new THREE.MeshStandardMaterial({ color: '#a1b9d8', roughness: 0.45, metalness: 0.7 }),
  );
  carriage.castShadow = true;
  craneGroup.add(carriage);

  const cable = new THREE.Mesh(
    new THREE.CylinderGeometry(0.035, 0.035, 3.8, 10),
    new THREE.MeshStandardMaterial({ color: '#d7dde6', roughness: 0.25, metalness: 0.9 }),
  );
  cable.position.y = -1.8;
  craneGroup.add(cable);

  const clawGroup = new THREE.Group();
  clawGroup.position.y = -3.65;
  craneGroup.add(clawGroup);

  const claws = [];
  for (let i = 0; i < 3; i += 1) {
    const claw = new THREE.Mesh(
      new THREE.BoxGeometry(0.16, 0.95, 0.2),
      new THREE.MeshStandardMaterial({ color: '#dbe3f1', roughness: 0.4, metalness: 0.78 }),
    );
    claw.castShadow = true;
    const angle = (i / 3) * Math.PI * 2;
    const radius = 0.45;
    claw.position.set(Math.cos(angle) * radius, -0.4, Math.sin(angle) * radius);
    claw.rotation.y = -angle;
    clawGroup.add(claw);
    claws.push({ mesh: claw, angle, closeRatio: 0 });
  }

  const state = {
    x: 0,
    z: 0,
    y: 5.5,
    open: 1,
    phase: 'idle',
    shake: 0,
    carriedBody: null,
  };

  const carrierBody = new CANNON.Body({
    mass: 0,
    type: CANNON.Body.KINEMATIC,
    material: materials.clawMat,
  });
  carrierBody.addShape(new CANNON.Sphere(0.35));
  carrierBody.collisionResponse = false;
  world.addBody(carrierBody);

  function commandDrop() {
    if (state.phase !== 'idle') return;
    state.phase = 'dropping';
  }

  function update(dt, difficulty) {
    const speed = 2.4;
    const closeSpeed = 1.8;

    if (state.phase === 'dropping') {
      state.y = Math.max(1.3, state.y - dt * 3.2);
      if (state.y <= 1.31) state.phase = 'closing';
    } else if (state.phase === 'closing') {
      state.open = Math.max(0, state.open - dt * closeSpeed);
      if (state.open <= 0.02) state.phase = 'lifting';
    } else if (state.phase === 'lifting') {
      state.y = Math.min(5.5, state.y + dt * 2.7);
      state.shake += dt * (1.5 + difficulty * 1.2);
      if (state.y >= 5.45) state.phase = 'returning';
    } else if (state.phase === 'returning') {
      const targetX = 2.9;
      const targetZ = 2.6;
      state.x += Math.sign(targetX - state.x) * Math.min(Math.abs(targetX - state.x), dt * speed);
      state.z += Math.sign(targetZ - state.z) * Math.min(Math.abs(targetZ - state.z), dt * speed);
      if (Math.abs(targetX - state.x) < 0.05 && Math.abs(targetZ - state.z) < 0.05) {
        state.phase = 'releasing';
      }
    } else if (state.phase === 'releasing') {
      state.open = Math.min(1, state.open + dt * (1.5 + Math.random() * 0.8));
      if (state.open >= 0.98) {
        state.phase = 'reset';
      }
    } else if (state.phase === 'reset') {
      state.x += Math.sign(0 - state.x) * Math.min(Math.abs(state.x), dt * speed);
      state.z += Math.sign(0 - state.z) * Math.min(Math.abs(state.z), dt * speed);
      if (Math.abs(state.x) < 0.05 && Math.abs(state.z) < 0.05) {
        state.phase = 'idle';
        state.shake = 0;
      }
    }

    craneGroup.position.set(state.x, state.y + Math.sin(state.shake) * 0.03, state.z);
    cable.scale.y = Math.max(0.5, (state.y - 1.4) / 3.8);
    cable.position.y = -1.9 * cable.scale.y;

    claws.forEach((claw, idx) => {
      const base = 0.9 - state.open * 0.55;
      claw.mesh.rotation.z = (idx - 1) * 0.03 + base * 0.7;
      claw.closeRatio = 1 - state.open;
    });

    carrierBody.position.set(state.x, state.y - 3.65, state.z);
  }

  function moveInput(dx, dz, dt) {
    if (state.phase !== 'idle') return;
    const speed = 2.8;
    state.x = THREE.MathUtils.clamp(state.x + dx * speed * dt, -3.1, 3.1);
    state.z = THREE.MathUtils.clamp(state.z + dz * speed * dt, -3.1, 3.1);
  }

  return {
    state,
    commandDrop,
    moveInput,
    update,
    carrierBody,
  };
}
