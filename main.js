/* global $, ko, FormData */
(function () {
    var viewModel = {
	templateFile: ko.observable(),
	analyzeTemplate: function(file) {
	    if (file) {
		var formData = new FormData();
		formData.append("template", file);
		var request = new XMLHttpRequest();
		request.open("POST",".");
		request.send(formData);
	    }
	}
    };

    function fetchWizardEntryData() {
	return $.ajax({
	    url: 'http://PlansReseau.azurewebsites.net/api/WizardEntryTrigger?name=Sebastian',
	    dataType: 'json'
	}).then(function (msg) {
	    console.log(msg);
	});
    }
    
    $(document).ready(function () {
	ko.applyBindings(viewModel, $('.main-content')[0]);
	fetchWizardEntryData();
    });
}());
