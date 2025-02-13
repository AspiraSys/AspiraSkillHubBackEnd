const express = require('express');
const router = express.Router();
const CertificateController = require('../controllers/certificateController');

// Define Routes
router.get('/aspirants-certificates', CertificateController.getAllStudents);
router.post('/aspirants-certificates/create', CertificateController.createCertificate);
router.put('/aspirants-certificates/update/:id', CertificateController.updateCertificate);
router.delete('/aspirants-certificates/delete/:id', CertificateController.deleteCertificate);
router.get('/aspirants-certificates/view-all', CertificateController.getAllCertificates);
router.get('/aspirants-certificates/view/:user_id', CertificateController.getCertificatesByUser);

module.exports = router;
