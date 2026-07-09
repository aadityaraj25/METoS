const Team = require('../models/team.model');

exports.createTeam = async (req, res) => {
  try {
    const { name, college, problemStatement, description } = req.body;

    if (!name || !college || !problemStatement) {
      return res.status(400).json({
        success: false,
        message: 'Name, college, and problem statement are required',
      });
    }

    const team = await Team.create({
      name,
      leader: req.user._id,
      college,
      problemStatement,
      description,
      members: [req.user._id],
    });

    res.status(201).json({ success: true, team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
