/* global $ */
(function () {
    var d = $.Deferred();
    d.resolve(true);
    d.promise().then(function () {
	console.log('Test 2');
    });
}());
