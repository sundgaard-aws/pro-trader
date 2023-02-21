$functionName="om-pt-create-login-fn"
$awsRegion="eu-north-1"
echo $functionName
clear
echo "Compressing function code..."
#zip -rq drop.zip .
7z a -r drop.zip *
echo "Uploading to Lambda..."
aws lambda update-function-code --function-name $functionName --region $awsRegion --zip-file fileb://drop.zip > $null
echo "Cleaning up..."
rm drop.zip
echo Done.

#aws s3 cp invoke-sfn-api.zip s3://iac-demo-lambda-code-bucket
#rm invoke-sfn-api.zip

# Upload to Lambda
#s3://iac-demo-lambda-code-bucket/invoke-sfn-api.zip