const AWS = require("aws-sdk");
const UUID = require('uuid');
const ALLOWED_ORIGINS = ["http://localhost", "http://aws..."]

// Callback is (error, response)
exports.handler = function(event, context, callback) {
    console.log(JSON.stringify(event));
    //AWS.config.update({region: 'eu-central-1'});
    var method = event.requestContext.http.method;
    var origin = event.headers.origin;
    var referer = event.headers.referer;
    if(method == "OPTIONS") {
        preFlightResponse(origin, referer, callback);
        return;
    }
    console.log("method="+method);

    /*ATV.validateAccessToken(userInfo.userName, userInfo.accessToken, function(valid, reason) {
        if(!valid) respondError(401, reason, callback);
    });*/

    var ddb = new AWS.DynamoDB({apiVersion: '2012-08-10'});

    var params = {
        TableName: 'xmas-fun-high-score'
    };
      
    ddb.scan(params, function(err, data) {
        if (err) { console.log(err); respondError(500, err, callback); }
        else {
            highScores = sortHighScores(data.Items);
            respondOK(highScores, callback);
        }
    });

};

function pad(n, width, z) {
    z = z || '0';
    n = n + '';
    return n.length >= width ? n : new Array(width - n.length + 1).join(z) + n;
}

function sortHighScores(highScoresUnsorted) {
    var sorted = new Array();
    for(var i=0;i<highScoresUnsorted.length;i++) {
        var item = highScoresUnsorted[i];
        var score = parseInt(item.score.N);
        if(score < 0) {
            sorted.push("-"+pad(score*-1,9)+"#"+item.userName.S);
        }
        else
            sorted.push(pad(score,10)+"#"+item.userName.S);
    }
    return sorted.sort().reverse();
};

function tweakOrigin(origin) {
    var tweakedOrigin = "-";
    ALLOWED_ORIGINS.forEach(allowedOrigin => {
        if(allowedOrigin == origin) tweakedOrigin = origin;
    });
    return tweakedOrigin;
}

function preFlightResponse(origin, referer, callback) {
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
    callback(null, response);
}

function respondOK(data, callback) {
    const response = {
        statusCode: 200,
        body: JSON.stringify({ response: 'Got high score', data: data }),
        headers: {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin' : tweakOrigin(origin),
            'Access-Control-Allow-Credentials' : true, // Required for cookies, authorization headers with HT
            'Access-Control-Allow-Headers' : "content-type"
        },
    };
    callback(null, response);
}

function respondError(errorCode, errorMessage, callback) {
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
    callback(null, response);
}
