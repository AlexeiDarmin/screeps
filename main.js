var roleHarvester = require('role.harvester.js')
var roleBuilder = require('role.builder.js')
var roleUpgrader = require('role.upgrader.js')

module.exports.loop = function () {

  basicCreepFactory()

  constructExtensions()

  // if (isStorageFull) reassignHarvesters()

  runRolesOnCreeps()
}


function runRolesOnCreeps() {
  for (let name in Game.creeps) {
    let creep = Game.creeps[name];
    if (creep.memory.role == 'harvester') {
      roleHarvester.run(creep);
    }
    if (creep.memory.role == 'upgrader') {
      roleUpgrader.run(creep);
    }
    if (creep.memory.role == 'builder') {
      roleBuilder.run(creep);
    }
  }
}

function basicCreepFactory() {
  const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester')
  
  if (harvesters.length < 2) {
    addBasicCreep('harvester')
    return
  }

  const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader')
  if (upgraders.length < 2) {
    addBasicCreep('upgrader')
    return
  }
  
  const builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder')
  if (builders.length < 2) {
    addBasicCreep('builder')
    return
  }
}

function addBasicCreep(creepType) {
  let creeps = _.filter(Game.creeps, (creep) => creep.memory.role == creepType)
  console.log(creepType + ' ' + creeps.length)

  if (creeps.length < 2) {
    let newName = Game.spawns['Spawn1'].createCreep([WORK, CARRY, MOVE], undefined, { role: creepType })
    console.log('Spawning new ' + creepType + ' ' + newName)
  }
}

function constructExtensions() {
  let spawnPos = Game.spawns['Spawn1'].pos

  // Get total number of extensions existing
  let extensionPos = Game.rooms.sim.getPositionAt(spawnPos.x + 4, spawnPos.y + 4);

  Game.rooms.sim.createConstructionSite(extensionPos, STRUCTURE_EXTENSION)

  // Game.rooms.sim.createConstructionSite(10, 15, Extension);

  return true
}

function isStorageFull() {
  return Room.energyAvailable == Room.energyCapacityAvailable
}

function reassignHarvesters() {
  for (let name in Game.creeps) {
    const creep = Game.creeps[name]
    if (creep.memory.role == 'harvester') {
      creep.memory.role = 'builder'
    }
  }
}