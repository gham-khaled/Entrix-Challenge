#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import {EntrixCICDPipeline} from "../lib/entrixCICDPipeline";

const app = new cdk.App();
const envDev = {account: '830962405258', region: 'eu-west-1'}

new EntrixCICDPipeline(app, 'EntrixCICDPipeline', {env: envDev})