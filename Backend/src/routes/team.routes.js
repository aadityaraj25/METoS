const express = require('express');
const { createTeam, searchTeams } = require('../controllers/team.controllers');
const { protect } = require('../middlewares/auth.middlewares');

const router = express.Router();

router.get('/search', searchTeams);
router.post('/', protect, createTeam);

module.exports = router;
