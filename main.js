/* global $, ko, FormData, URI */
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
	emplacement: ko.observable(),
	oneDriveAppID: ko.observable(),
	oneDriveSecret: ko.observable()
    };

    viewModel.oneDriveAppURL = ko.computed(function () {
	return 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=' + viewModel.oneDriveAppID() + '&scope=files.readwrite&response_type=code&redirect_url=' + encodeURI(location.href)
    });

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
	}).then(function (items) {
	    viewModel.oneDriveAppID(items.appID);
	    viewModel.oneDriveSecret(items.secret);
	});
    }

    function postIfHasCode() {
	var parts = URI.parseQuery(location.search);
	if (parts.code) {
	    $.ajax({
		url: 'https://login.microsoftonline.com/common/oauth2/v2.0/token',
		data: {
		    client_id: viewModel.oneDriveAppID(),
		    redirect_uri: location.href.replace(location.search, ""),
		    client_secret: viewModel.oneDriveSecret(),
		    code: parts.code
		}
	    }).then(function (res) {
		console.log(res);
	    });
	}
    }
    
    $(document).ready(function () {
	ko.applyBindings(viewModel, $('.main-content')[0]);
	fetchWizardEntryData();
	postIfHasCode();
    });
}());
