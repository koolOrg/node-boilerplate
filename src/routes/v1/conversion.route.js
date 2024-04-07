
const express = require('express');
const validate = require('../../middlewares/validate');
const conversionValidation = require('../../validations/conversion.validation');
const conversionRequestController = require('../../controllers/conversion.controller');
const auth = require('../../middlewares/auth');


const router = express.Router();

// POST /conversion to submit a new conversion request
router.post('/conversion', auth(), validate(conversionValidation.createConversionRequest), conversionRequestController.submitConversionRequest);

// GET /conversion/:id to get a specific conversion request by ID
router.get('/conversion/:id', auth(), conversionRequestController.getConversionRequestById);

// PUT /conversion/:id to update a specific conversion request by ID (if needed, depending on your app logic)
router.put('/conversion/:id', auth(), validate(conversionValidation.createConversionRequest), conversionRequestController.updateConversionRequestById);

// DELETE /conversion/:id to cancel or delete a specific conversion request by ID
router.delete('/conversion/:id', auth(), conversionRequestController.deleteConversionRequestById);


module.exports = router;

