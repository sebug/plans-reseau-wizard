module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    var staticUrl = 'http://storageplansreseau.blob.core.windows.net/'

    context.res = {
        body: "Ohai " + context.bindings.settings.Value + staticUrl
    };
    context.done();
};
