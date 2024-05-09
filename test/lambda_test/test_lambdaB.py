import json
import os
import unittest
import boto3
import moto
from moto import mock_aws


@mock_aws
class TestLambdaB(unittest.TestCase):
    bucket_name = "test-bucket"

    def setUp(self):
        self.mock_aws = moto.mock_aws()
        self.mock_aws.start()
        s3 = boto3.resource("s3", region_name='eu-west-1')
        self.bucket = s3.Bucket(self.bucket_name)
        self.bucket.create(CreateBucketConfiguration={'LocationConstraint': 'eu-west-1'})
        os.environ['LOG_BUCKET'] = self.bucket_name

    def tearDown(self):
        self.mock_aws.stop()

    def test_function_succeeding(self):
        """
        Testing that the S3 object will be saved correctly in LOG BUCKET when the status is accepted
        """
        from test.lambda_test.dataPipeline.lambda_b import lambda_handler
        event = {"status": "accepted", "power": 1}
        lambda_handler(event, None)
        s3_objects = [obj for obj in self.bucket.objects.all()]
        self.assertEqual(len(s3_objects), 1)
        file_content = s3_objects[0].get()['Body'].read().decode('utf-8')
        self.assertEqual(json.loads(file_content), event)

    def test_function_failing(self):
        """
        Testing that the function will raive an error if the status is rejected
        """
        from test.lambda_test.dataPipeline.lambda_b import lambda_handler
        event = {
            "status": "rejected",
            "power": 1,
        }
        with self.assertRaises(ValueError):
            lambda_handler(event, None)
