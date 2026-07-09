const test = require('node:test');
const assert = require('node:assert/strict');
const Team = require('../src/models/team.model');

test('team model should create a team with default recruitment settings', () => {
  const team = new Team({
    name: 'Innovators',
    leader: '507f1f77bcf86cd799439011',
    college: 'IIT Delhi',
    problemStatement: 'Smart city platform',
  });

  assert.equal(team.name, 'Innovators');
  assert.equal(team.maxMembers, 6);
  assert.equal(team.isOpen, true);
  assert.equal(team.status, 'recruiting');
});
