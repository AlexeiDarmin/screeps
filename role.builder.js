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
        createRoadConstructionSite()
      }
    }
    else {
      var sources = creep.room.find(FIND_SOURCES);
      if (creep.harvest(sources[0]) == ERR_NOT_IN_RANGE) {
        creep.moveTo(sources[0], { visualizePathStyle: { stroke: '#ffaa00' } });
      }
    }
  }
};

function createRoadConstructionSite() {
  const harvesters = _.filter(Game.creeps, (creep) => creep.memory.role == 'harvester')

  for (let name in harvesters) {
    const creep = harvesters[name]
    Game.rooms.sim.createConstructionSite(creep.pos, STRUCTURE_ROAD)
  }
}

module.exports = roleBuilder;