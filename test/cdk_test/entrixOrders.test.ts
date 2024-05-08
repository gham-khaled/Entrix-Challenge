import {EntrixOrdersStack} from "../../lib/entrixOrders";
import {Capture, Template} from "aws-cdk-lib/assertions";
import * as cdk from 'aws-cdk-lib';

test('DynamoDB Table Created', () => {
    const stack = new cdk.Stack();
    const entrixOrdersStack = new EntrixOrdersStack(stack, 'TestStack');
    const template = Template.fromStack(entrixOrdersStack);
    template.resourceCountIs("AWS::DynamoDB::Table", 1);
});
test('Lambda Created', () => {
    const stack = new cdk.Stack();
    const entrixOrdersStack = new EntrixOrdersStack(stack, 'TestStack');
    const template = Template.fromStack(entrixOrdersStack);
    template.resourceCountIs("AWS::Lambda::Function", 1);
});
test('API Gateway Created', () => {
    const stack = new cdk.Stack();
    const entrixOrdersStack = new EntrixOrdersStack(stack, 'TestStack');
    const template = Template.fromStack(entrixOrdersStack);
    template.resourceCountIs("AWS::ApiGateway::RestApi", 1);
});
test('Lambda Has Environment Variables', () => {
    const stack = new cdk.Stack();
    const entrixOrdersStack = new EntrixOrdersStack(stack, 'TestStack');

    // THEN
    const template = Template.fromStack(entrixOrdersStack);
    const envCapture = new Capture();
    template.hasResourceProperties("AWS::Lambda::Function", {
        Environment: envCapture,
    });

    expect(envCapture.asObject()).toEqual(
        {
            Variables: {
                DYNAMODB_TABLE_NAME: {
                    Ref: "recordsTable65B95BD2",
                },
            },
        }
    );
});
test('DynamoDB Billing mode is set to pay per request', () => {
    const stack = new cdk.Stack();
    const entrixOrdersStack = new EntrixOrdersStack(stack, 'TestStack');
    const template = Template.fromStack(entrixOrdersStack);
    template.hasResourceProperties('AWS::DynamoDB::Table', {
        BillingMode: "PAY_PER_REQUEST"
    });
});