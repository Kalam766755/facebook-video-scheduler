const AWS = require('aws-sdk');
// ... rest of the code

// Configure AWS S3 for Cloudflare R2
const s3 = new AWS.S3({
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  accessKeyId: process.env.R2_ACCESS_KEY_ID,
  secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
  signatureVersion: 'v4',
  region: 'auto'
});

// Upload code में change करें:
const uploadParams = {
  Bucket: process.env.R2_BUCKET_NAME,
  Key: key,
  Body: req.file.buffer,
  ContentType: req.file.mimetype,
};

await s3.upload(uploadParams).promise();    res.json(videos);
  } catch (error) {
    res.status(500).json({ message: error.message });
  }
});

module.exports = router;
