module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger for finish auth. ' +
		context.bindings.settings.Value + " " +
		context.bindings.secret.Value + " " +
		(req.query.code || req.body.code) + " " +
		(req.query.redirectUri || req.body.redirectUri));

    context.res = {
        body: {
	    appID: String(context.bindings.settings.Value)
	}
    };
    context.done();
};
