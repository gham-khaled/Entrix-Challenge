import {Capture, Template} from "aws-cdk-lib/assertions";
import * as cdk from 'aws-cdk-lib';
import {EntrixDataPipelineStack} from "../../lib/entrixDataPipeline";
import {EntrixOrdersStack} from "../../lib/entrixOrders";

// Test Resource Creation

test('Lambda Functions Created', () => {
    const stack = new cdk.Stack();
    const entrixDataPipelineStack = new EntrixDataPipelineStack(stack, 'EntrixDataPipeline');
    const template = Template.fromStack(entrixDataPipelineStack);
    template.resourceCountIs("AWS::Lambda::Function", 2);
});
test('S3 Bucket Created', () => {
    const stack = new cdk.Stack();
    const entrixDataPipelineStack = new EntrixDataPipelineStack(stack, 'EntrixDataPipeline');
    const template = Template.fromStack(entrixDataPipelineStack);
    template.resourceCountIs("AWS::S3::Bucket", 1);
});
test('SNS Topic Created', () => {
    const stack = new cdk.Stack();
    const entrixDataPipelineStack = new EntrixDataPipelineStack(stack, 'EntrixDataPipeline');
    const template = Template.fromStack(entrixDataPipelineStack);
    template.resourceCountIs("AWS::SNS::Topic", 1);
});
test('Step Functions Created', () => {
    const stack = new cdk.Stack();
    const entrixDataPipelineStack = new EntrixDataPipelineStack(stack, 'EntrixDataPipeline');
    const template = Template.fromStack(entrixDataPipelineStack);
    template.resourceCountIs("AWS::StepFunctions::StateMachine", 1);
});
test('Event Rule Created', () => {
    const stack = new cdk.Stack();
    const entrixDataPipelineStack = new EntrixDataPipelineStack(stack, 'EntrixDataPipeline');
    const template = Template.fromStack(entrixDataPipelineStack);
    template.resourceCountIs("AWS::Events::Rule", 1);
});

// Test Resource Creation
test('Lambda Has Environment Variables', () => {
    const stack = new cdk.Stack();
    const entrixDataPipelineStack = new EntrixDataPipelineStack(stack, 'EntrixDataPipeline');
    const template = Template.fromStack(entrixDataPipelineStack);
    const envCapture = new Capture();
    template.hasResourceProperties("AWS::Lambda::Function", {
        Handler: "lambda_b.lambda_handler",
        Environment: envCapture,
    });

    expect(envCapture.asObject()).toEqual(
        {
            Variables: {
                LOG_BUCKET: {
                    Ref: "MyLogBucketBD20E7D7",
                },
            },
        }
    );
});