var roleHarvester = require('role.harvester.js')
var roleBuilder = require('role.builder.js')
var roleUpgrader = require('role.upgrader.js')

module.exports.loop = function () {

  creepFactory()

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

function clearDeadCreepsFromMemory() {
  for (var i in Memory.creeps) {
    if (!Game.creeps[i]) {
      delete Memory.creeps[i];
    }
  }
}

function creepFactory() {
  /* 
  - create 3 creeps per resource 
  - 1 of each role per resource
  */

  let maxCost = Game.spawns['Spawn1'].room.energyCapacityAvailable
  let available = Game.spawns['Spawn1'].room.energyAvailable
  console.log(available + '/' + maxCost)

  if (maxCost > available) return -1

  const creeps = Game.creeps
  let creepCount = 0
  for (let name in creeps) {
    creepCount = creepCount + 1
  }
  const bodySizeAvailable = createCreepBody().length

  const sourcesCount = Game.spawns['Spawn1'].room.find(FIND_SOURCES).length

  let killed = false
  if (creepCount == sourcesCount * 3) {
    for (let name in creeps) {
      let creep = creeps[name]
      if (bodySizeAvailable > creep.body.length) {
        if (killed == false) {
          creep.suicide()
          killed = true
        }
      }
    }
  }

  clearDeadCreepsFromMemory()

  const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester')
  if (harvesters.length < sourcesCount) {
    addBasicCreep('harvester')
    return
  }

  const upgraders = _.filter(Game.creeps, (creep) => creep.memory.role == 'upgrader')
  if (upgraders.length < sourcesCount) {
    addBasicCreep('upgrader')
    return
  }

  const builders = _.filter(Game.creeps, (creep) => creep.memory.role == 'builder')
  if (builders.length < sourcesCount) {
    addBasicCreep('builder')
    return
  }
}

function addBasicCreep(creepType) {
  console.log('Add creep ')
  let id = 0
  let made = false
  let count = 0
  while (count < 5) {

    let name = creepType + id
    made = Game.spawns['Spawn1'].createCreep(createCreepBody(), name, { role: creepType })
    if (made == OK) return
    id = id + 1
    count = count + 1
  }
}

function isStorageFull() {
  return Room.energyAvailable == Room.energyCapacityAvailable
}

function createCreepBody() {
  let maxCost = Game.spawns['Spawn1'].room.energyCapacityAvailable
  let available = Game.spawns['Spawn1'].room.energyAvailable
  let parts = [MOVE, CARRY, WORK]

  let moveCount = 1
  let workCount = 1
  let carryCount = 1
  let price = 200
  console.log('createCreepBody', maxCost, price, available)
  let stopper = 0
  while (maxCost - price >= 50 && stopper < 10) {
    stopper = stopper + 1
    console.log('work/carry:', workCount, carryCount)
    if (Math.floor((parts.length) / 2) > moveCount) {
      if (maxCost - price >= 50) {
        parts.push(MOVE)
        price = price + 50
        moveCount = moveCount + 1
      }
    } else if (workCount == carryCount && maxCost - price >= 100) {
      parts.push(WORK)
      price = price + 100
      workCount = workCount + 1
    } else if (maxCost - price >= 50) {
      parts.push(CARRY)
      price = price + 50
      carryCount = carryCount + 1
    }

  }
  console.log(parts)
  return parts
}




function bodyPartCost(bodyPart) {
  const parts = {
    MOVE: 50,
    WORK: 100,
    CARRY: 50,
    ATTACK: 80,
    RANGED_ATTACK: 150,
    HEAL: 250,
    CLAIM: 600,
    TOUGH: 10
  }
  return parts[bodyPart]

}