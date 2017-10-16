module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger for finish auth. ' +
		context.bindings.settings.Value + " " +
		context.bindings.secret + " " +
	       req.body.code);

    context.res = {
        body: {
	    appID: String(context.bindings.settings.Value)
	}
    };
    context.done();
};
