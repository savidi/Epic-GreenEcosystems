const express = require('express');
const router = express.Router();
const { getAllSpices, addSpice , getSpiceById } = require('../controllers/SpiceSaleController');

router.get('/spices', getAllSpices);
router.get('/spices/:id', getSpiceById);
router.post('/spices', addSpice);

module.exports = router;