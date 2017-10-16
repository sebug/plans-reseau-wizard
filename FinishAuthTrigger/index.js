var request = require('request');

module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger for finish auth. ' +
		context.bindings.settings.Value + " " +
		context.bindings.secret.Value + " " +
		(req.query.code || req.body.code) + " " +
		(req.query.redirectUri || req.body.redirectUri));

    request({
	method: 'POST',
	uri: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
	form: {
	    client_id: context.bindings.settings.Value,
	    redirect_uri: (req.query.redirectUri || req.body.redirectUri),
	    client_secret: context.bindings.secret.Value,
	    code: (req.query.code || req.body.code)
	}
    }, function (error, response, body) {
	if (response.statusCode == 200) {
	    context.res = {
		body: body
	    };
	} else {
	    context.res = {
		status: response.statusCode,
		body: 'error: ' + body
	    };
	}
    });
    context.done();
};
