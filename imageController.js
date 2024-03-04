const AWS = require('aws-sdk');
const fs = require('fs');

// Initialize AWS SDK with credentials
AWS.config.update({
  accessKeyId: 'xxxx',//ACCESS_KEY_ID
  secretAccessKey: 'xxxx',//SECRET_ACCESS_KEYS
  region: 'xxxx'//AWS_REGION
});

const s3 = new AWS.S3();
const sns = new AWS.SNS();
const sqs = new AWS.SQS();

// Controller function for handling image upload
exports.uploadImage = (req, res) => {
  const file = req.file;
  const params = {
    Bucket: 'xxx',///S3_BUCKET_NAME
    Key: file.originalname,
    Body: fs.createReadStream(file.path)
  };
  
  s3.upload(params, (err, data) => {
    if (err) {
      console.error('Error uploading image to S3:', err);
      return res.status(500).json({ error: 'Failed to upload image' });
    }
    
    // Publish message to SQS queue for processing
    const message = { bucket: params.Bucket, key: params.Key };
    const params = {
      MessageBody: JSON.stringify(message),
      QueueUrl: 'xxx'//SQS_QUEUE_URL
    };
    
    sqs.sendMessage(params, (err, data) => {
      if (err) {
        console.error('Error sending message to SQS:', err);
        return res.status(500).json({ error: 'Failed to send message for processing' });
      }
      res.status(200).json({ message: 'Image uploaded successfully' });
    });
  });
};

// Controller function for handling image processing
exports.processImage = (req, res) => {
  const message = req.body;
  
  // Triggers Lambda function for image processing using SNS
  const params = {
    Message: JSON.stringify(message),
    TopicArn: 'xxx' //SNS_TOPIC_ARN
  };
  
  sns.publish(params, (err, data) => {
    if (err) {
      console.error('Error sending message to SNS:', err);
      return res.status(500).json({ error: 'Failed to trigger image processing' });
    }
    res.status(200).json({ message: 'Image processing triggered successfully' });
  });
};