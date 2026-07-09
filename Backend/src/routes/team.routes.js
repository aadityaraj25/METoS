const express = require('express');
const { createTeam } = require('../controllers/team.controllers');
const { protect } = require('../middlewares/auth.middlewares');

const router = express.Router();

router.post('/', protect, createTeam);

module.exports = router;
