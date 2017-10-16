/* global $, ko */
(function () {
    var viewModel = {
	message: ko.observable('Oh, hey')
    };

    function fetchWizardEntryData() {
	return $.ajax({
	    url: 'http://PlansReseau.azurewebsites.net/api/WizardEntryTrigger?name=Sebastian'
	}).then(function (msg) {
	    viewModel.message(msg);
	});
    }
    
    $(document).ready(function () {
	ko.applyBindings(viewModel, $('.main-content')[0]);
	fetchWizardEntryData();
    });
}());
