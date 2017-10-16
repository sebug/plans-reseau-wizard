module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    context.res = {
        body: {
	    appID: String(context.bindings.settings.Value),
	    secret: String(context.bindings.secret.Value)
	}
    };
    context.done();
};
