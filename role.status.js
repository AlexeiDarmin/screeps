/*
 * Module code goes here. Use 'module.exports' to export things:
 * module.exports.thing = 'a thing';
 *
 * You can import it from another modules like this:
 * var mod = require('role.status');
 * mod.thing == 'a thing'; // true
 */

var roleStatus = {

  /** @param {Creep} creep **/
  run: function (creep, status, tempSourceId) {

    if (status == 'harvesting') {
      if (creep.memory.role == 'harvester' && creep.carry.energy == creep.carryCapacity) creep.memory.status = 'unloading'
      else if (creep.memory.role == 'upgrader' && creep.carry.energy == creep.carryCapacity) creep.memory.status = 'upgrading'
      else if (creep.memory.role == 'builder' && creep.carry.energy == creep.carryCapacity) creep.memory.status = 'building'
      else {
        var sources = creep.room.find(FIND_SOURCES);
        const sourceId = creep.name.slice(-1)
        if (creep.harvest(sources[tempSourceId]) == ERR_NOT_IN_RANGE) {
          const enemies = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 6);
          if (enemies.length > 0) return


          creep.moveTo(sources[tempSourceId], { visualizePathStyle: { stroke: '#ffaa00' } });
        }
      }
    } else if (status == 'unloading') {
      if (creep.carry.energy == 0) creep.memory.status = 'default'
      else {
        var targets = creep.room.find(FIND_STRUCTURES, {
          filter: (structure) => {
            return (structure.structureType == STRUCTURE_EXTENSION ||
              structure.structureType == STRUCTURE_SPAWN ||
              structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
          }
        });
        if (targets.length == 0) {
          creep.memory.status = 'upgrading'
        }
        if (targets.length > 0) {
          if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
            creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
          }
        }
      }
    } else if (status == 'upgrading') {
      if (creep.carry.energy == 0) {
        creep.memory.status = 'default';
      }

      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
      }
    } else if (status == 'building') {
      if (creep.carry.energy == 0) {
        creep.memory.status = 'default';
      }

      var targets = creep.room.find(FIND_CONSTRUCTION_SITES);
      if (targets.length) {
        if (creep.build(targets[0]) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
        }
      } else {
        if (countStructureOfType(STRUCTURE_EXTENSION) < extensionsCap()) {
          createExtensionConstructionSite()
        } else {
          if (OK != createRoadConstructionSite()) {
            creep.memory.status = 'upgrading'
          }
        }
      }
    }
  }
};


function createRoadConstructionSite() {
  const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester')

  for (let name in harvesters) {
    const creep = harvesters[name]
    const rooms = Game.rooms
    for (let name in rooms) {
      return Game.rooms[name].createConstructionSite(creep.pos, STRUCTURE_ROAD)
    }
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
    if (structures[id].structureType == type) count = count + 1
  }

  return count
}

// room level is 0 to 8
function extensionsCap() {
  return 5
  const roomLevel = Game.spawns['Spawn1'].controller.level
  if (roomLevel <= 1) return 0
  if (roomLevel == 2) return 5
  if (roomLevel == 3) return 10
  if (roomLevel == 4) return 20
  if (roomLevel == 5) return 30
  if (roomLevel == 6) return 40
  if (roomLevel == 7) return 50
  if (roomLevel == 8) return 60
}

module.exports = roleStatus;