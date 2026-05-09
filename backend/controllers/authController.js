
const User = require('../models/User');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const generateToken = (id) => {
    return jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });
};

const registerUser = async (req, res) => {
    const { name, email, password } = req.body;
    try {
        const userExists = await User.findOne({ email });
        if (userExists) return res.status(400).json({ message: 'User already exists' });

        const user = await User.create({ name, email, password, role: 'user' });
        res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user.id) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginUser = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email, role: { $ne: 'admin' } });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({ id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user.id) });
        } else {
            res.status(401).json({ message: 'Invalid email or password' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const loginAdmin = async (req, res) => {
    const { email, password } = req.body;
    try {
        const user = await User.findOne({ email, role: 'admin' });
        if (user && (await bcrypt.compare(password, user.password))) {
            res.json({ id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user.id) });
        } else {
            res.status(401).json({ message: 'Invalid admin credentials' });
        }
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const getProfile = async (req, res) => {
    try {
      const user = await User.findById(req.user.id);
      if (!user) {
        return res.status(404).json({ message: 'User not found' });
      }
  
      res.status(200).json({
        name: user.name,
        dateofbirth: user.dateofbirth,
        country: user.country,
        city: user.city,
        email: user.email,
        phone: user.phone,
        gender: user.gender
      });
    } catch (error) {
      res.status(500).json({ message: 'Server error', error: error.message });
    }
  };

const updateUserProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { name, dateofbirth, email, country, city, phone, gender } = req.body;
        user.name = name || user.name;
        user.dateofbirth = dateofbirth || user.dateofbirth;
        user.email = email || user.email;
        user.country = country || user.country;
        user.city = city || user.city;
        user.phone = phone || user.phone;
        user.gender = gender || user.gender;

        const updatedUser = await user.save();
        res.json({ id: updatedUser.id, name: updatedUser.name, email: updatedUser.email, dateofbirth: updatedUser.dateofbirth, country: updatedUser.country, city: updatedUser.city, phone: updatedUser.phone, gender: updatedUser.gender, token: generateToken(updatedUser.id) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};

const updatePassword = async (req, res) => {
    try {
        const user = await User.findById(req.user.id);
        if (!user) return res.status(404).json({ message: 'User not found' });

        const { currentPassword, newPassword } = req.body;

        if (!(await bcrypt.compare(currentPassword, user.password))) {
            return res.status(401).json({ message: 'Current password is incorrect' });
        }

        user.password = newPassword;

        const updatedPass = await user.save();
        res.status(201).json({ id: user.id, name: user.name, email: user.email, role: user.role, token: generateToken(user.id) });
    } catch (error) {
        res.status(500).json({ message: error.message });
    }
};
module.exports = { registerUser, loginUser, loginAdmin, updateUserProfile, getProfile, updatePassword };
