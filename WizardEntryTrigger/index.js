module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    var staticUrl = 'http://storageplansreseau.blob.core.windows.net/'

    context.res = {
        // status: 200, /* Defaults to 200 */
        body: "Ohai " + context.bindings.settings + staticUrl
    };
    context.done();
};
