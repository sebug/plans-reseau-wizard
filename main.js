/* global $, ko, FormData, URI */
(function () {

    var filePostUrl = "https://PlansReseau.azurewebsites.net/api/TemplateAnalyzeTrigger";

    var generateDocumentUrl = "https://PlansReseau.azurewebsites.net/api/GenerateDocumentTrigger";

    var currentTemplate;

    function generateDocument() {
	var res = $.Deferred();
	var formData = new FormData();
	formData.append("template", currentTemplate);
	var keys = [
	    'genre',
	    'numeroDeCours',
	    'etabliPar',
	    'organisation',
	    'dateDebut',
	    'dateFin',
	    'telephone',
	    'emplacement'
	];
	keys.forEach(function (k) {
	    if (ko.unwrap(viewModel[k])) {
		formData.append(k, ko.unwrap(viewModel[k]));
	    }
	});
	var request = new XMLHttpRequest();
	request.onreadystatechange = function () {
	    if(request.readyState === XMLHttpRequest.DONE && request.status === 200) {
		res.resolve(true);
	    }

	};
	request.open("POST", generateDocumentUrl);
	request.send(formData);
	return res.promise();
    }
    
    var viewModel = {
	templateFile: ko.observable(),
	analyzeTemplate: function(file) {
	    if (file) {
		currentTemplate = file;
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
	isGenerating: ko.observable(false),
	generateDocumentPutOnOneDrive: function () {
	    viewModel.isGenerating(true);
	    generateDocument().then(function () {
		viewModel.isGenerating(false);
	    });
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
	oneDriveUser: ko.observable(),
	protectionCivileFolder: ko.observable()
    };

    viewModel.oneDriveAppURL = ko.computed(function () {
	return 'https://login.microsoftonline.com/common/oauth2/v2.0/authorize?client_id=' + viewModel.oneDriveAppID() + '&scope=files.readwrite&response_type=token&redirect_url=' + encodeURI(location.href)
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
	    url: 'https://PlansReseau.azurewebsites.net/api/WizardEntryTrigger',
	    dataType: 'json'
	}).then(function (items) {
	    viewModel.oneDriveAppID(items.appID);
	});
    }

    var msGraphApiRoot = "https://graph.microsoft.com/v1.0/me";

    function accessTokenFromURL() {
	return /access_token=([^&]+)/.exec(location.href)[1];
    }

    function authHeader() {
	var access_token = accessTokenFromURL();
	return 'bearer '+ access_token;
    }

    function getChildItems(parentID) {
	return $.ajax({
	    url: msGraphApiRoot + '/drive/items/'+ parentID + '/children',
	    headers: {
		Authorization: authHeader()
	    }
	}).then(function (res) {
	    console.log(res);
	    return res;
	});
    }

    function getItem(itemID) {
	return $.ajax({
	    url: msGraphApiRoot + '/drive/items/'+ itemID,
	    headers: {
		Authorization: authHeader()
	    }
	}).then(function (res) {
	    console.log(res);
	    return res;
	});
    }

    function createFolder(parentID, folderName) {
	return $.ajax({
	    url: msGraphApiRoot + '/drive/items/' + parentID + '/children',
	    headers: {
		Authorization: authHeader()
	    },
	    contentType: 'application/json; charset=utf-8',
	    dataType: 'json',
	    data: JSON.stringify({
		name: folderName,
		folder: {},
		'@microsoft.graph.conflictBehavior': 'rename'
	    }),
	    type: 'POST'
	}).then(function (createdFolder) {
	    console.log(createdFolder);
	    return createdFolder;
	});
    }

    function getRoot() {
	return $.ajax({
	    url: msGraphApiRoot + '/drive/root',
	    headers: {
		Authorization: authHeader()
	    }
	}).then(function (res) {
	    console.log(res);
	    return res;
	});
    }

    function getFolder(children, folderName) {
	if (!children || !children.value) {
	    return false;
	}
	return children.value.filter(function (c) {
	    return c.name && c.name.toLowerCase() === folderName.toLowerCase();
	})[0];
    }

    function listDrive() {
	if (!accessTokenFromURL()) {
	    return;
	}
	$.ajax({
	    url: msGraphApiRoot + '/drive',
	    headers: {
		Authorization: authHeader()
	    }
	}).then(function (res) {
	    if (res && res.owner && res.owner.user) {
		viewModel.oneDriveUser(res.owner.user);
	    }
	    return getRoot().then(function (root) {
		return getItem(root.id).then(function (rootFolder) {
		    if (rootFolder.folder && rootFolder.folder.childCount) {
			return getChildItems(rootFolder.id).then(function (children) {
			    var f = getFolder(children, 'Protection Civile');
			    if (f) {
				return f;
			    } else {
				return createFolder(rootFolder.id, 'Protection Civile');
			    }
			}).then(function (f) {
			    viewModel.protectionCivileFolder(f);
			});
		    }
		});
	    });
	});
    }
    
    $(document).ready(function () {
	ko.applyBindings(viewModel, $('.main-content')[0]);
	fetchWizardEntryData();
	listDrive();
    });
}());
