## Créateur des plans réseau
Cet outil permet de faire des demandes de plan réseau d'une manière guidée.

# Documentation dev
You'll need to specify environment variables for AZURE_STORAGE_CONNECTION_STRING that you can obtain using

	az storage account show-connection-string --name storageplansreseau --resource-group PlansReseauGroup


	az group create --name plansReseauGroup --location westeurope
	az storage account create --name storageplansreseau --location westeurope --resource-group plansReseauGroup --sku Standard_LRS
	az functionapp create --name PlansReseau --storage-account storageplansreseau --resource-group plansReseauGroup --consumption-plan-location westeurope
	az functionapp deployment source config --name PlansReseau --resource-group PlansReseauGroup --branch master --repo-url https://github.com/sebug/plans-reseau-wizard --manual-integration
	az storage container create --name reseaustatic
	az storage blob upload --container-name reseaustatic --file index.html --name index.html
	az storage container set-permission --name reseaustatic --public-access blob
	az storage blob update --container-name reseaustatic --name index.html --content-type "text/html"
	az storage blob upload --container-name reseaustatic --file main.js --name main.js --content-type "application/javascript"


To update (since I'm not yet doing CD):

	az functionapp deployment source sync --name PlansReseau --resource-group plansReseauGroup

