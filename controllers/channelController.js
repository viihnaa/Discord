const Channel = require('../models/Channel');

exports.getChannels = async (req, res) => {
  const channels = await Channel.find().sort('name');
  res.json(channels);
};

exports.createChannel = async (req, res) => {
  const { name, description } = req.body;
  if (!name) return res.status(400).json({ message: 'Channel name required' });
  const channel = await Channel.create({ name, description });
  res.json(channel);
};