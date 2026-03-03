const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema({
  name: { type: String, required: true },
  email: { type: String, required: true, unique: true },
  password: { type: String, required: true }
}, { timestamps: true });

// CORRECTED PRE-SAVE HOOK
userSchema.pre("save", async function() {
  // Agar password modify nahi hua toh yahin se return kar jayein
  if (!this.isModified("password")) return;

  // Password hash karein (No next() needed in async hooks)
  this.password = await bcrypt.hash(this.password, 10);
});

userSchema.methods.comparePassword = async function(password) {
  return await bcrypt.compare(password, this.password);
};

module.exports = mongoose.model("User", userSchema);