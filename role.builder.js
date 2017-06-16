var roleBuilder = {

  /** @param {Creep} creep **/
  run: function (creep) {

    if (creep.memory.building && creep.carry.energy == 0) {
      creep.memory.building = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.building && creep.carry.energy == creep.carryCapacity) {
      creep.memory.building = true;
      creep.say('🚧 build');
    }

    if (creep.memory.building) {
      var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
        }
      } else {
        if (countStructureOfType(STRUCTURE_EXTENSION) < extensionsCap()) {
          createExtensionConstructionSite()
        } else {
          createRoadConstructionSite()
        }
      }
    }
    else {
      var sources = creep.room.find(FIND_SOURCES);
      if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
        const enemies = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 6);
        if (enemies.length > 0) return


        creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
      }
    }
  }
};

function createRoadConstructionSite() {
  const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester')

  for (let name in harvesters) {
    const creep = harvesters[name]
    // Game.rooms.sim.createConstructionSite(creep.pos, STRUCTURE_ROAD)
  }
}

function createExtensionConstructionSite() {
  const spawnPos = Game.spawns['Spawn1'].pos

  let x = spawnPos.x
  let y = spawnPos.y

  const rooms = Game.rooms
  for (let name in rooms) {
    while (true) {
      x = x - 1
      y = y - 1

      if (OK == rooms[name].createConstructionSite(x, y, STRUCTURE_EXTENSION)) {
        return true
      }
    }
  }
}

function countStructureOfType(type) {
  const structures = Game.structures
  let count = 0

  for (let id in structures) {
    if (structures[id].type == type) count = count + 1
  }

  return count
}

// room level is 0 to 8
function extensionsCap() {
  return 2
  const roomLevel = Game.rooms.sim.controller.level
  console.log('room level: ', roomLevel)
  if (roomLevel <= 1) return 0
  if (roomLevel == 2) return 5
  if (roomLevel == 3) return 10
  if (roomLevel == 4) return 20
  if (roomLevel == 5) return 30
  if (roomLevel == 6) return 40
  if (roomLevel == 7) return 50
  if (roomLevel == 8) return 60
}

module.exports = roleBuilder;