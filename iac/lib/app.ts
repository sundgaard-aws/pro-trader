#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from '@aws-cdk/core';
//import { MetaData } from './meta-data';
import { env } from 'process';
import EC2 = require('@aws-cdk/aws-ec2');
import { MetaData } from './meta-data';
import { PipelineStack } from './pipeline-stack';
import { NetworkStack } from './network-stack';
import { ComputeStack } from './compute-stack';
import { DataStack } from './data-stack';
import { WebStack } from './web-stack';

const app = new cdk.App();
var region=process.env["CDK_DEFAULT_REGION"];
region="eu-north-1"
var props = {env: {account: process.env["CDK_DEFAULT_ACCOUNT"], region: region } };
var metaData = new MetaData();

var networkStack = new NetworkStack(app, MetaData.PREFIX+"network-stack", props);
var computeStack = new ComputeStack(app, MetaData.PREFIX+"compute-stack", networkStack.Vpc, networkStack.ApiSecurityGroup, props);
var dataStack=new DataStack(app, MetaData.PREFIX+"data-stack", networkStack.Vpc, computeStack.apiRole, props);
var webStack=new WebStack(app, MetaData.PREFIX+"web-stack", props);

//new PipelineStack(app, MetaData.PREFIX+"pipeline-stack");
//new DatabaseStackL2(app, metaData.PREFIX+"database-stack", metaData, props);
//new CodeStarStackL2(app, metaData.PREFIX+"code-star-stack", metaData, props);
//new CodeStarStackL2(app, metaData.PREFIX+"codestar-stack-via-yaml", metaData, props);