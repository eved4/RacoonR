const { getMaxListeners } = require('../lib/db');

const ROLE = {
  STANDARD: 'standard',
  GROUP: 'group',
};

module.exports = {
  ROLE: ROLE,
  users: [
    { email: 'evedavies4@gmail.com', role: ROLE.GROUP },
    { email: 's@gmail.com', role: ROLE.STANDARD },
  ],
};
