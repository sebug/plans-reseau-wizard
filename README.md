## Créateur des plans réseau
Cet outil permet de faire des demandes de plan réseau d'une manière guidée.

# Documentation dev
	az group create --name plansReseauGroup --location westeurope
	az storage account create --name storageplansreseau --location westeurope --resource-group plansReseauGroup --sku Standard_LRS
	az functionapp create --name PlansReseau --storage-account storageplansreseau --resource-group plansReseauGroup --consumption-plan-location westeurope



