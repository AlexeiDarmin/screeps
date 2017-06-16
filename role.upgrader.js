var roleUpgrader = {

  /** @param {Creep} creep **/
  run: function (creep) {

    if (creep.memory.upgrading && creep.carry.energy == 0) {
      creep.memory.upgrading = false;
      creep.say('🔄 harvest');
    }
    if (!creep.memory.upgrading && creep.carry.energy == creep.carryCapacity) {
      creep.memory.upgrading = true;
      creep.say('⚡ upgrade');
    }

    if (creep.memory.upgrading) {
      if (creep.upgradeController(creep.room.controller) == ERR_NOT_IN_RANGE) {
        creep.moveTo(creep.room.controller, { visualizePathStyle: { stroke: '#ffffff' } });
      }
    }
    else {
      var sources = creep.room.find(FIND_SOURCES);
      const sourceId = creep.name.slice(-1)
      if (creep.harvest(sources[1]) == ERR_NOT_IN_RANGE) {
        const enemies = creep.pos.findInRange(FIND_HOSTILE_CREEPS, 6);
        if (enemies.length > 0) return

        creep.moveTo(sources[1], { visualizePathStyle: { stroke: '#ffaa00' } });
      }
    }
  }
};

module.exports = roleUpgrader;