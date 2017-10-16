module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    context.res = {
        body: String(context.bindings.settings.Value)
    };
    context.done();
};
