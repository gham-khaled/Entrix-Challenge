import {Construct} from 'constructs';
import * as dynamodb from 'aws-cdk-lib/aws-dynamodb';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as apigateway from 'aws-cdk-lib/aws-apigateway';
import * as cdk from 'aws-cdk-lib';

export class EntrixOrdersStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        // Dynamo DB Table
        const recordsTable = new dynamodb.Table(this, 'recordsTable', {
            partitionKey: {name: 'record_id', type: dynamodb.AttributeType.STRING},
            billingMode: dynamodb.BillingMode.PAY_PER_REQUEST,
        });

        // Lambda Function
        const postLambda = new lambda.Function(this, 'postLambda', {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: 'post_lambda.lambda_handler',
            code: lambda.Code.fromAsset('lib/lambda/recordsService'),
            environment: {
                DYNAMODB_TABLE_NAME: recordsTable.tableName,
                LOGLEVEL: "INFO",
            },
        });
        recordsTable.grantWriteData(postLambda)

        // API Gateway
        const api = new apigateway.RestApi(this, 'recordsAPI');


        const requestValidator = new apigateway.RequestValidator(this, 'BodyRequestValidator', {
            restApi: api,
            validateRequestBody: true,
        });

        const recordsRequestModel = api.addModel('RecordsRequestModel', {
            contentType: 'application/json',
            modelName: 'RecordsRequestModel',
            schema: {
                type: apigateway.JsonSchemaType.ARRAY,
                items: {
                    type: apigateway.JsonSchemaType.OBJECT,
                    properties: {
                        record_id: {type: apigateway.JsonSchemaType.STRING},
                    },
                    required: ['record_id'],
                },
            },
        });
        api.root.addMethod('POST',  new apigateway.LambdaIntegration(postLambda), {
            requestValidator: requestValidator,
            requestModels: {
                'application/json': recordsRequestModel,
            },
        });


    }

}
