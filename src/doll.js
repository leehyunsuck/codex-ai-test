export function spawnDolls({ THREE, CANNON, scene, world, materials }) {
  const dolls = [];

  const configs = [
    { type: 'plush', count: 8, color: '#ff91b5', mass: 0.42, friction: 0.72, radius: 0.38 },
    { type: 'plastic', count: 4, color: '#8ad6ff', mass: 0.58, friction: 0.42, radius: 0.32 },
  ];

  configs.forEach((cfg) => {
    for (let i = 0; i < cfg.count; i += 1) {
      const mesh = new THREE.Mesh(
        new THREE.SphereGeometry(cfg.radius, 20, 20),
        new THREE.MeshStandardMaterial({
          color: cfg.color,
          roughness: cfg.type === 'plush' ? 0.92 : 0.36,
          metalness: cfg.type === 'plush' ? 0.02 : 0.28,
        }),
      );
      mesh.castShadow = true;
      mesh.receiveShadow = true;

      const x = (Math.random() - 0.5) * 5.6;
      const y = 1.2 + Math.random() * 2.8;
      const z = (Math.random() - 0.2) * 5.2;
      mesh.position.set(x, y, z);
      scene.add(mesh);

      const body = new CANNON.Body({
        mass: cfg.mass,
        material: materials.plushMat,
      });
      body.addShape(new CANNON.Sphere(cfg.radius));
      body.position.set(x, y, z);
      body.linearDamping = 0.16;
      body.angularDamping = 0.2;
      body.userData = {
        type: cfg.type,
        baseFriction: cfg.friction,
        difficulty: cfg.type === 'plush' ? 0.68 : 0.88,
      };
      world.addBody(body);

      dolls.push({ mesh, body, radius: cfg.radius });
    }
  });

  return dolls;
}
