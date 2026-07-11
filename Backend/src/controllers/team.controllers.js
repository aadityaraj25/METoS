const Team = require('../models/team.model');

exports.createTeam = async (req, res) => {
  try {
    const { name, college, problemStatement, description, skills } = req.body;

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
      skills: skills || [],
      members: [req.user._id],
    });

    res.status(201).json({ success: true, team });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};

exports.searchTeams = async (req, res) => {
  try {
    const { name, college, skills } = req.query;
    
    // Build filter object
    const filter = { isOpen: true, status: 'recruiting' };
    
    // Filter by team name (case-insensitive partial match)
    if (name) {
      filter.name = { $regex: name, $options: 'i' };
    }
    
    // Filter by college (case-insensitive exact match)
    if (college) {
      filter.college = { $regex: college, $options: 'i' };
    }
    
    // Filter by skills (match if team requires any of the provided skills)
    if (skills) {
      const skillsArray = Array.isArray(skills) 
        ? skills.map(s => s.toLowerCase().trim())
        : [skills.toLowerCase().trim()];
      filter.skills = { $in: skillsArray };
    }
    
    // Execute query with pagination
    const page = parseInt(req.query.page) || 1;
    const limit = parseInt(req.query.limit) || 10;
    const skip = (page - 1) * limit;
    
    const teams = await Team.find(filter)
      .select('name college description skills members maxMembers status createdAt')
      .populate('leader', 'name email college')
      .populate('members', 'name email college')
      .skip(skip)
      .limit(limit)
      .sort({ createdAt: -1 });
    
    const total = await Team.countDocuments(filter);
    
    res.status(200).json({
      success: true,
      count: teams.length,
      total,
      page,
      pages: Math.ceil(total / limit),
      teams,
    });
  } catch (error) {
    res.status(500).json({ success: false, message: error.message });
  }
};
