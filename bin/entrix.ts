#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {EntrixOrdersStack} from '../lib/entrixOrders';
import {EntrixDataPipelineStack} from "../lib/entrixDataPipeline";

const app = new cdk.App();
const envDev = {account: '830962405258', region: 'eu-west-1'}
new EntrixOrdersStack(app, 'EntrixOrders', {
    env: envDev
});
new EntrixDataPipelineStack(app, 'EntrixDataPipeline', {
    env: envDev
});