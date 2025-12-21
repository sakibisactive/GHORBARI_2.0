const mongoose = require('mongoose');

const storySchema = new mongoose.Schema({
  authorId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  authorName: String,
  title: String,
  content: String,
  status: { type: String, enum: ['pending', 'approved'], default: 'pending' },
  category: { type: String, default: 'General' }, // <--- ADD THIS LINE
  likes: { type: Number, default: 0 },
  comments: [{
      user: String,
      text: String,
      date: { type: Date, default: Date.now }
  }]
}, { timestamps: true });

module.exports = mongoose.model('Story', storySchema);