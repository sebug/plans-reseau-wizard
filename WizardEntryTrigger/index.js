module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    context.res = {
        body: {
	    appID: String(context.bindings.settings.Value)
	}
    };
    context.done();
};
