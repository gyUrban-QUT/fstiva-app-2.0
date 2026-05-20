
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');

const userSchema = new mongoose.Schema({
    name: { type: String, required: true },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
    dateofbirth: { type: String }, // added date of birth field
    country: { type: String },
    city: { type: String },
    phone: { type: String },
    gender: { type: String }
});

userSchema.pre('save', async function () { //removed next as it breaks in Mongoose 9
    if (!this.isModified('password')) return;
    const salt = await bcrypt.genSalt(10);
    this.password = await bcrypt.hash(this.password, salt);
});

module.exports = mongoose.model('User', userSchema);
