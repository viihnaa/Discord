const Message = require('../models/Message');

exports.getMessages = async (req, res) => {
  try {
    const { channelId } = req.params;
    const messages = await Message.find({ channel: channelId })
      .populate('sender', 'username avatar')
      .sort('createdAt');
    res.json(messages);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};

// Optional REST endpoint to create a message
exports.createMessage = async (req, res) => {
  try {
    const { channelId, content } = req.body;
    const msg = await Message.create({ sender: req.user.id, channel: channelId, content });
    await msg.populate('sender', 'username avatar');
    res.json(msg);
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: 'Server error' });
  }
};