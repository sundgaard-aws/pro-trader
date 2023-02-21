//const AWS = require("aws-sdk");

//const UUID = require('uuid');
//const FV = require('./field-verifier.js');

const { DynamoDB } = require("@aws-sdk/client-dynamodb");
const UUID = require('uuid');

const MAX_TURNS = 50;
const LOGIN_TABLE_NAME = "om-pt-login";
const ASSET_TABLE_NAME = "om-pt-asset"
const ALLOWED_ORIGINS = ["http://localhost", "http://localhost:81", "http://localhost:81/"]
//console.log(process.env["AWS_REGION"]);
const ddb = new DynamoDB({apiVersion: '2012-08-10', region: "eu-north-1"});

// Callback is (error, response)
exports.handler = async function(event, context) {
    console.log(JSON.stringify(event));
    var method = event.requestContext.http.method;
    var origin = event.headers.origin;
    var referer = event.headers.referer;
    if(method == "OPTIONS") return preFlightResponse(origin, referer);
    console.log("method="+method);
    
    var login=JSON.parse(event.body);
    if(login.email == null || login.password == null || login.passwordRepeated == null) {
        console.error("Email, password or repeatedPassword was missing!"); 
        return respondError(origin, 500, "Failed to create login(0)");
    }
    try {
        console.log("step1");
        var existingLogin=await getLogin(login.email);
        console.log("step2");
        if(existingLogin != null) {
            console.log("Found the following user information while checking for existing login:");
            console.log(JSON.stringify(existingLogin));        
        }
        console.log("step3");
        if(existingLogin != null && existingLogin.email != null && existingLogin.email.S == login.email) { console.error("User name already exists"); return respondError(origin, 500, "User name already exists"); }
        var userData=await createLogin(login);
        console.log("step4");
        return respondOK(origin, userData);
    }    
    catch(ex) {
        console.error(ex); return respondError(origin, 500, "Failed to create login", callback);
    }    
};

async function getLogin(email) {
    var params = {
      TableName: LOGIN_TABLE_NAME,
      Key: {
        'email': {S: email}
      }      
      //ProjectionExpression: 'ATTRIBUTE_NAME'
    };
    var logins=await ddb.getItem(params);
    return logins.Item;
}

async function createLogin(login) {
    var userGuid = UUID.v4();
    var params = {
        TableName: LOGIN_TABLE_NAME,
        Item: {
          'email': {S: login.email},
          'userGuid': {S: userGuid},
          'password': {S: login.password},
          'accessToken': {S: ""}
        },
        ReturnConsumedCapacity: "TOTAL", 
        //ProjectionExpression: 'ATTRIBUTE_NAME'
    };    
    var userData=await ddb.putItem(params);
    console.log("User created");
    return { "userGuid": userGuid };
}

function insertInitialData(userGuid, callback) {
    var params = {
        TableName: ASSET_TABLE_NAME,
        Item: {
          'userGuid': {S: userGuid}
          //'heroGuids': {SS: []}
        },
        ReturnConsumedCapacity: "TOTAL", 
        //ProjectionExpression: 'ATTRIBUTE_NAME'
    };    
    ddb.putItem(params, function(err, userData) {
        if (err) { console.error(err); callback(err); }
        else {       
            console.log("Inserted initial score");
            callback(null);
        }
    });    
}

function tweakOrigin(origin) {
    var tweakedOrigin = "-";
    ALLOWED_ORIGINS.forEach(allowedOrigin => {
        if(allowedOrigin == origin) tweakedOrigin = origin;
    });
    return tweakedOrigin;
}

function preFlightResponse(origin, referer) {
    var tweakedOrigin = "";
    if(origin == ALLOWED_ORIGINS[0] || origin == ALLOWED_ORIGINS[1])
        tweakedOrigin = origin;

    const response = {
        statusCode: 200,
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin' :   tweakOrigin(origin),
            'Access-Control-Allow-Credentials' : true, // Required for cookies, authorization headers with HT
            'Access-Control-Allow-Headers' : "content-type"
        },
    };
    return response;
}

function respondOK(origin, data, callback) {
    const response = {
        statusCode: 200,
        body: JSON.stringify({ response: 'Login created', data: data }),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin' : tweakOrigin(origin),
            'Access-Control-Allow-Credentials' : true, // Required for cookies, authorization headers with HT
            'Access-Control-Allow-Headers' : "content-type"
        },
    };
    return response;
}

function respondError(origin, errorCode, errorMessage, callback) {
    const response = {
        statusCode: errorCode,
        body: JSON.stringify({ response: errorMessage }),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin' : tweakOrigin(origin),
            'Access-Control-Allow-Credentials' : true, // Required for cookies, authorization headers with HT
            'Access-Control-Allow-Headers' : "content-type"
        },
    };
    return response;
}
