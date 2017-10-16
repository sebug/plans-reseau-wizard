module.exports = function (context, req) {
    context.log('JavaScript HTTP trigger function processed a request.');

    var staticUrl = 'http://storageplansreseau.blob.core.windows.net/'

    if (req.query.name || (req.body && req.body.name)) {
        context.res = {
            // status: 200, /* Defaults to 200 */
            body: "Ohai " + context.bindings.settings
        };
    }
    else {
        context.res = {
            status: 400,
            body: "Please pass a name on the query string or in the request body"
        };
    }
    context.done();
};
