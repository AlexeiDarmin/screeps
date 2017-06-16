var roleHarvester = {

  /** @param {Creep} creep **/
  run: function (creep) {
    if (creep.carry.energy < creep.carryCapacity) {
      var sources = creep.room.find(FIND_SOURCES);
      const sourceId = creep.name.slice(-1)
      if (creep.harvest(sources[sourceId]) == ERR_NOT_IN_RANGE) {
        const enemies = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 6);
        if (enemies.length > 0) return


        creep.moveTo(sources[sourceId], { visualizePathStyle: { stroke: '#ffaa00' } });
      }
    }
    else {
      var targets = creep.room.find(FIND_STRUCTURES, {
        filter: (structure) => {
          return (structure.structureType == STRUCTURE_EXTENSION ||
            structure.structureType == STRUCTURE_SPAWN ||
            structure.structureType == STRUCTURE_TOWER) && structure.energy < structure.energyCapacity;
        }
      });
      if (targets.length > 0) {
        if (creep.transfer(targets[0], RESOURCE_ENERGY) == ERR_NOT_IN_RANGE) {
          creep.moveTo(targets[0], { visualizePathStyle: { stroke: '#ffffff' } });
        }
      }
    }
  }
};

function reassignHarvesters() {
  for (let name in Game.creeps) {
    const creep = Game.creeps[name]
    if (creep.memory.role == 'harvester') {
      creep.memory.role = 'builder'
    }
  }
}

module.exports = roleHarvester;