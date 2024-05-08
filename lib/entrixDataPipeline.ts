import {Construct} from 'constructs';
import * as lambda from 'aws-cdk-lib/aws-lambda';
import * as cdk from 'aws-cdk-lib';
import * as tasks from 'aws-cdk-lib/aws-stepfunctions-tasks'
import * as sfn from 'aws-cdk-lib/aws-stepfunctions'
import * as s3 from 'aws-cdk-lib/aws-s3'
import * as sns from 'aws-cdk-lib/aws-sns'
import {Duration} from 'aws-cdk-lib';
import {
    EventbridgeToStepfunctions,
    EventbridgeToStepfunctionsProps
} from '@aws-solutions-constructs/aws-eventbridge-stepfunctions';
import * as stepfunctions from 'aws-cdk-lib/aws-stepfunctions';
import * as events from 'aws-cdk-lib/aws-events';

export class EntrixDataPipelineStack extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);
        // S3 Bucket
        const logBucket = new s3.Bucket(this, 'MyLogBucket');

        // Lambda Functions
        const lambdaA = new lambda.Function(this, 'lambdaA', {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: 'lambda_a.lambda_handler',
            code: lambda.Code.fromAsset('lib/lambda/dataPipeline/'),
        });
        const lambdaB = new lambda.Function(this, 'lambdaB', {
            runtime: lambda.Runtime.PYTHON_3_9,
            handler: 'lambda_b.lambda_handler',
            code: lambda.Code.fromAsset('lib/lambda/dataPipeline/'),
            environment: {
                LOG_BUCKET: logBucket.bucketName
            },
        });

        // SNS Topic
        const errorTopic = new sns.Topic(this, 'ErrorTopic');

        // SF Tasks
        const LambdaAJob = new tasks.LambdaInvoke(this, 'LambdaA', {
            lambdaFunction: lambdaA,
        });

        const publishError = new tasks.SnsPublish(this, 'Publish Error', {
            topic: errorTopic,
            message: sfn.TaskInput.fromJsonPathAt('$')
        });

        const LambdaBJob = new tasks.LambdaInvoke(this, 'LambdaB', {
            lambdaFunction: lambdaB,
        }).addCatch(publishError, {errors: [sfn.Errors.TASKS_FAILED]});

        const mapLambdaBJob = new sfn.Map(this, 'LambdaBMap', {
            itemsPath: sfn.JsonPath.stringAt('$.orders'),
        }).itemProcessor(LambdaBJob)

        const definition = LambdaAJob.next(new sfn.Choice(this, 'Results Empty?', {inputPath: "$.Payload"})
            .when(sfn.Condition.booleanEquals('$.results', false), LambdaAJob)
            .when(sfn.Condition.booleanEquals('$.results', true), mapLambdaBJob)
            .afterwards())


        // SF Cron
        const constructProps: EventbridgeToStepfunctionsProps = {
            stateMachineProps: {
                definition: definition
            },
            eventRuleProps: {
                schedule: events.Schedule.rate(Duration.hours(1))
            }
        };

        new EventbridgeToStepfunctions(this, 'hourlyDataPipeline', constructProps);

        // Permissions
        logBucket.grantPut(lambdaB);
        // errorTopic.addSubscription(new subscriptions.EmailSubscription('gham.khaled@gmail.com'));


    }

}