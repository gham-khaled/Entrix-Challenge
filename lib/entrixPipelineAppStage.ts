import * as cdk from 'aws-cdk-lib';
import {Construct} from "constructs";
import {EntrixOrdersStack} from "./entrixOrders";
import {EntrixDataPipelineStack} from "./entrixDataPipeline";
import {CfnOutput} from "aws-cdk-lib";

export class EntrixPipelineAppStage extends cdk.Stage {
    public readonly urlOutput: CfnOutput;

    constructor(scope: Construct, id: string, props?: cdk.StageProps) {
        super(scope, id, props);
        const entrixOrders = new EntrixOrdersStack(this, 'EntrixOrders');
        new EntrixDataPipelineStack(this, 'EntrixOrders');
        this.urlOutput = entrixOrders.urlOutput;

    }
}