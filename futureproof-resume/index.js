require('dotenv').config();
const express = require('express');
const multer = require('multer');
const pdfParse = require('pdf-parse');
const mammoth = require('mammoth');
const path = require('path');

const { getAIAnalysis } = require('./ai-handler'); 

const app = express();
const port = 3000;
const storage = multer.memoryStorage();
const upload = multer({ storage: storage });

app.use(express.static('public'));

app.post('/analyze', upload.single('cvFile'), async (req, res) => {
    try {
        // Validasi input
        if (!req.file) {
            return res.status(400).json({ message: 'File CV tidak ditemukan.' });
        }
        const careerInterest = req.body.careerInterest;
        if (!careerInterest) {
            return res.status(400).json({ message: 'Minat bidang karir harus diisi.' });
        }

        // Ekstrak teks dari file
        let cvText = '';
        if (req.file.mimetype === 'application/pdf') {
            const data = await pdfParse(req.file.buffer);
            cvText = data.text;
        } else if (req.file.mimetype === 'application/vnd.openxmlformats-officedocument.wordprocessingml.document') {
            const { value } = await mammoth.extractRawText({ buffer: req.file.buffer });
            cvText = value;
        } else {
            return res.status(400).json({ message: 'Format file tidak didukung. Harap unggah PDF atau DOCX.' });
        }

        if (cvText.trim().length < 50) {
            return res.status(400).json({ message: 'Gagal membaca teks dari CV atau konten terlalu sedikit.' });
        }

        const analysisResult = await getAIAnalysis(cvText, careerInterest);
        
        res.json({ analysis: analysisResult });

    } catch (error) {
        console.error('Error during analysis:', error);
        res.status(500).json({ message: 'Terjadi kesalahan internal saat menganalisis CV.' });
    }
});

/*app.listen(port, () => {
    console.log(`Server berjalan di http://localhost:${port}`);
});
*/

module.exports = app;