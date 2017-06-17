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

          let targetSource
          if (creep.memory.role == 'upgrader') targetSource = sourceNearController(true)
          else targetSource = sourceNearController(false)
          creep.moveTo(targetSource, { visualizePathStyle: { stroke: '#ffaa00' } });
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
          creep.memory.status = 'building'
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

// return source that is nearest to controller if isNearest is true, otherwise return the further one.
function sourceNearController(isNearest) {
  const myRoom = Game.spawns['Spawn1'].room
  const sources = myRoom.find(FIND_SOURCES)
  const roomController = myRoom.controller

  //   Game.spawns['Spawn1'].room.controller.pos.findClosestByRange(FIND_SOURCES)
  // find the 'not nearest' source to the controller to build as a base
  let controllerSource = roomController.pos.findClosestByRange(FIND_SOURCES)

  for (let name in sources) {
    if (isNearest == false && sources[name] != controllerSource) return sources[name]
    else if (isNearest == true && sources[name] == controllerSource) return sources[name]
  }
}
function createExtensionConstructionSite() {

  const source = sourceNearController(false)

  let delta = 4
  let slide = 1
  let cycled = true

  let x = source.pos.x
  let y = source.pos.y

  let startX = x
  let startY = y

  const thisRoom = Game.spawns['Spawn1'].room
  // Iterates in a circle around the source structure trying to place an extension.
  // if no placement is possible then the radius is increased and the process restarts
  let counter = 0
  while (counter < 10) {
    counter = counter + 1
    // select direction of rotation if switch has reach delta
    if (delta != 1 && slide == delta) {
      if (cycled == true) {
        //invert direction
        cycled = false
        x = startY
        y = startX
        slide = -1 * delta
      } else if (cycled == false) {
        //reset to default, increase radius
        delta = delta + 2
        slide = -1 * delta
        x = startX
        y = startY
        cycled = true
      }
    }
    else slide = slide + 2

    x = x + slide
    y = y + delta - slide

    console.log('build at:', x, y)
    if (OK == thisRoom.createConstructionSite(x, y, STRUCTURE_EXTENSION)) {
      return true
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
  const roomLevel = Game.spawns['Spawn1'].room.controller.level
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