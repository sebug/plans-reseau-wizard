/* global $, ko, FormData */
(function () {

    var filePostUrl = "https://PlansReseau.azurewebsites.net/api/TemplateAnalyzeTrigger";
    
    var viewModel = {
	templateFile: ko.observable(),
	analyzeTemplate: function(file) {
	    if (file) {
		var formData = new FormData();
		formData.append("template", file);
		var request = new XMLHttpRequest();
		request.onreadystatechange = function () {
		    if(request.readyState === XMLHttpRequest.DONE && request.status === 200) {
			fillFields(JSON.parse(request.responseText));
  }

		};
		request.open("POST", filePostUrl);
		request.send(formData);
	    }
	},
	genre: ko.observable(),
	numeroDeCours: ko.observable(),
	etabliPar: ko.observable(),
	organisation: ko.observable(),
	dateDebut: ko.observable(),
	dateFin: ko.observable(),
	telephone: ko.observable(),
	emplacement: ko.observable()
    };

    function fillFields(templateInfo) {
	var d;
	var dashI;
	if (templateInfo) {
	    Object.keys(templateInfo).forEach(function (k) {
		if (typeof viewModel[k] === 'function' && templateInfo[k]) {
		    viewModel[k](templateInfo[k]);
		}
	    });


	    d = templateInfo.date;
	    if (typeof d === 'string' && d) {
		dashI = d.indexOf('-');
		if (dashI >= 0) {
		    viewModel.dateDebut(d.substring(0, dashI).trim());
		    viewModel.dateFin(d.substring(dashI + 1).trim());
		} else {
		    viewModel.dateDebut(d.trim());
		    viewModel.dateFin(d.trim());
		}
	    }
	}
    }

    function fetchWizardEntryData() {
	return $.ajax({
	    url: 'https://PlansReseau.azurewebsites.net/api/WizardEntryTrigger?name=Sebastian',
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
