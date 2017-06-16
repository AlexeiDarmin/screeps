var roleStatus = require('role.status.js')

var roleUpgrader = {

  /** @param {Creep} creep **/
  run: function (creep) {

    if (!creep.memory.status || creep.memory.status == 'default') creep.memory.status = 'harvesting'
    const status = creep.memory.status

    roleStatus.run(creep, status, 1)
  }
};

module.exports = roleUpgrader;