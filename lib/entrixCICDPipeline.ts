import * as cdk from 'aws-cdk-lib';
import {Construct} from 'constructs';
import {CodePipeline, CodePipelineSource, ShellStep} from 'aws-cdk-lib/pipelines';
import {EntrixPipelineAppStage} from "./entrixPipelineAppStage";

export class EntrixCICDPipeline extends cdk.Stack {
    constructor(scope: Construct, id: string, props?: cdk.StackProps) {
        super(scope, id, props);

        const pipeline = new CodePipeline(this, 'Pipeline', {
            pipelineName: 'MyPipeline',
            synth: new ShellStep('Synth', {
                input: CodePipelineSource.gitHub('gham-khaled/Entrix-Challenge', 'master'),
                installCommands: ['npm ci', 'npm run build'],
                commands: ['npm run test', 'npx cdk synth']
            })
        });

        const devApp = new EntrixPipelineAppStage(this, "Dev", {env: {account: '830962405258', region: 'eu-west-1'}})

        const devStage = pipeline.addStage(devApp);

        devStage.addPost(new ShellStep("API Testing", {
            envFromCfnOutputs: {ENDPOINT_URL: devApp.urlOutput},
            commands: ['curl -Ssf  --location $ENDPOINT_URL \\\n' +
            '--header \'Content-Type: application/json\' \\\n' +
            '--data \'[\n' +
            ' {\n' +
            ' "record_id": "unique_id_1",\n' +
            ' "parameter_1": "abc",\n' +
            ' "parameter_2": 4\n' +
            ' },{\n' +
            ' "record_id": "unique_id_2",\n' +
            ' "parameter_1": "def",\n' +
            ' "parameter_2": 2.1\n' +
            ' }\n' +
            ']\'']

        }));

    }
}