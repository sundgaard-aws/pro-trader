import * as Core from '@aws-cdk/core';
import EC2 = require('@aws-cdk/aws-ec2');
import S3 = require('@aws-cdk/aws-s3');
import { IRole } from "@aws-cdk/aws-iam";
import Lambda = require('@aws-cdk/aws-dynamodb');
import { IVpc } from '@aws-cdk/aws-ec2';
import { AttributeType, BillingMode, Table } from '@aws-cdk/aws-dynamodb';
import { MetaData } from './meta-data';
import { Bucket } from '@aws-cdk/aws-s3';
import { StackProps, Tags } from '@aws-cdk/core';

export class DataStack extends Core.Stack {
    private apiRole:IRole;
    constructor(scope: Core.Construct, id: string, vpc: IVpc, apiRole: IRole, props?: Core.StackProps) {
        super(scope, id, props);
        this.apiRole = apiRole;
        this.createLoginTable();
        this.createPortfolioTable();
        this.createPriceBucket();
        this.createPortfolioBucket();
        this.createAssetBucket();
    }

    private createAssetBucket() {
        var name = MetaData.PREFIX+"asset";
        var bucket = new Bucket(this, name, {
            bucketName: name
        });
        bucket.grantReadWrite(this.apiRole);
        Core.Tags.of(bucket).add(MetaData.NAME, name);
    }    
    
    private createPriceBucket() {
        var name = MetaData.PREFIX+"price";
        var bucket = new Bucket(this, name, {
            bucketName: name
        });
        bucket.grantReadWrite(this.apiRole);
        Core.Tags.of(bucket).add(MetaData.NAME, name);
    }

    private createPortfolioBucket() {
        var name = MetaData.PREFIX+"portfolio-s3";
        var bucket = new Bucket(this, name, {
            bucketName: name
        });
        bucket.grantReadWrite(this.apiRole);
        Core.Tags.of(bucket).add(MetaData.NAME, name);
    }    

    private createPortfolioTable() {
        var name = MetaData.PREFIX+"portfolio";
        new Table(this, name, {
            tableName: name,
            billingMode: BillingMode.PAY_PER_REQUEST,
            partitionKey: {name: "portfolioGuid", type: AttributeType.STRING},
            sortKey: {name: "userGuid", type: AttributeType.STRING}
        });
    }
    
    private createLoginTable() {
        var name = MetaData.PREFIX+"login";
        var table=new Table(this, name, {
            tableName: name,
            billingMode: BillingMode.PAY_PER_REQUEST,
            partitionKey: {name: "email", type: AttributeType.STRING}
        });
        //table.grantReadWriteData();
    }
}