const express = require('express');
const AWS = require('aws-sdk');
const multer = require('multer');
const fs = require('fs');

const app = express();

AWS.config.update({
  accessKeyId: 'AKIATBRPQQOWCIPZ645E', // Ganti dengan Access Key ID Anda
  secretAccessKey: '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', // Ganti dengan Secret Access Key Anda
  region: 'us-east-1c' // Sesuaikan dengan region Anda
});

const s3 = new AWS.S3();
const upload = multer({ dest: 'uploads/' });

app.use(express.static('views'));

app.post('/upload', upload.single('file'), (req, res) => {
  const fileContent = fs.readFileSync(req.file.path);
  const params = {
    Bucket: 'alipbucket', // Ganti dengan nama bucket Anda
    Key: req.file.originalname,
    Body: fileContent
  };

  s3.upload(params, function(err, data) {
    fs.unlinkSync(req.file.path);
    if (err) {
      return res.status(500).send("Error saat mengunggah file");
    }
    res.send(`File berhasil diunggah. Lokasi: ${data.Location}`);
  });
});

// Endpoint untuk mendapatkan daftar file dari S3
app.get('/files', async (req, res) => {
  try {
    const params = { Bucket: 'alipbucket' }; // Ganti dengan nama bucket Anda
    const data = await s3.listObjectsV2(params).promise();
    
    const files = data.Contents.map(item => ({
      name: item.Key,
      url: `https://${params.Bucket}.s3.${AWS.config.region}.amazonaws.com/${item.Key}`
    }));

    res.json(files);
  } catch (error) {
    console.error("Error saat mengambil daftar file:", error);
    res.status(500).json({ error: "Gagal mengambil daftar file" });
  }
});

app.listen(3000, () => {
  console.log('Server berjalan di http://localhost:3000');
});
