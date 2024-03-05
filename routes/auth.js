// import express from 'express'
const express = require('express');
const authenticateToken = require('../middleware/authenticateToken');
const router = express.Router();

//controllers
// import {register, login, getAllUsers, updateUser, deleteUser, refreshToken, logoutUser} from '../controllers/auth';
const { register, login, getAllUsers, updateUser, deleteUser, refreshToken, logoutUser } = require('../controllers/auth');


router.post('/register', register);
router.post('/login', login);
router.post('/token', refreshToken);
router.get('/getAllUsers', getAllUsers);
router.put('/updateUser/:id',authenticateToken, updateUser);
router.delete('/deleteUser/:id',authenticateToken,deleteUser);
router.delete('/logout',logoutUser);

module.exports = router;