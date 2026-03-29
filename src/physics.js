import * as CANNON from 'https://cdn.jsdelivr.net/npm/cannon-es@0.20.0/+esm';

export function createPhysics() {
  const world = new CANNON.World({
    gravity: new CANNON.Vec3(0, -9.82, 0),
  });

  world.broadphase = new CANNON.SAPBroadphase(world);
  world.allowSleep = true;

  const defaultMat = new CANNON.Material('default');
  const plushMat = new CANNON.Material('plush');
  const clawMat = new CANNON.Material('claw');

  world.defaultContactMaterial = new CANNON.ContactMaterial(defaultMat, defaultMat, {
    friction: 0.4,
    restitution: 0.1,
  });

  world.addContactMaterial(
    new CANNON.ContactMaterial(plushMat, defaultMat, {
      friction: 0.75,
      restitution: 0.04,
    }),
  );

  world.addContactMaterial(
    new CANNON.ContactMaterial(clawMat, plushMat, {
      friction: 0.92,
      restitution: 0.02,
    }),
  );

  const floor = new CANNON.Body({
    mass: 0,
    material: defaultMat,
    shape: new CANNON.Box(new CANNON.Vec3(4, 0.25, 4)),
    position: new CANNON.Vec3(0, 0.25, 0),
  });
  world.addBody(floor);

  const wallShapes = [
    { half: new CANNON.Vec3(0.075, 3, 4), pos: new CANNON.Vec3(-4, 3, 0) },
    { half: new CANNON.Vec3(0.075, 3, 4), pos: new CANNON.Vec3(4, 3, 0) },
    { half: new CANNON.Vec3(4, 3, 0.075), pos: new CANNON.Vec3(0, 3, -4) },
    { half: new CANNON.Vec3(4, 3, 0.075), pos: new CANNON.Vec3(0, 3, 4) },
  ];

  wallShapes.forEach(({ half, pos }) => {
    const wall = new CANNON.Body({ mass: 0, material: defaultMat });
    wall.addShape(new CANNON.Box(half));
    wall.position.copy(pos);
    world.addBody(wall);
  });

  return {
    CANNON,
    world,
    materials: {
      defaultMat,
      plushMat,
      clawMat,
    },
  };
}
