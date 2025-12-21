const mongoose = require('mongoose');

const faqSchema = new mongoose.Schema({
  userId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  question: String,
  answer: { type: String, default: "" }, 
  isAnswered: { type: Boolean, default: false },
  category: { type: String, default: "General Info" } // <--- ADD THIS LINE
}, { timestamps: true });

module.exports = mongoose.model('FAQ', faqSchema);