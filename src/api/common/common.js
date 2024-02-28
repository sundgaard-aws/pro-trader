module.exports = class Common {
    tweakOrigin(origin) {
        var tweakedOrigin = "-";
        ALLOWED_ORIGINS.forEach(allowedOrigin => {
            if(allowedOrigin == origin) tweakedOrigin = origin;
        });
        return tweakedOrigin;
    }

    preFlightResponse(origin, referer) {
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

    respondOK(origin, data) {
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

    respondError(origin, errorCode, errorMessage) {
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
}