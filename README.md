# Talk - Infra as Code as Code

Repository de code utilisé pour les démonstrations du talk "Infra as code, as code" d'Ulysse Fontaine et de Sébastien Gahat.

## Démo

### Pré-requis

- Se mettre dans le dossier ``duck-ts``
- nvm install ([nvm](https://github.com/nvm-sh/nvm) ou installer à la main la version de Node inscrite dans ce fichier)
- Avoir des credentials AWS / Scaleway, et les configurer avec des variables d'environnement
- Avoir configuré son backend Pulumi. 
Exemple de `.envrc` ([direnv](https://direnv.net/)) à la racine de `duck-ts`, pour un backend local :
```
export PULUMI_BACKEND_URL="file://$PWD"
export PULUMI_CONFIG_PASSPHRASE=""
```

### Exécution du code

````
npm run build
npm link
duck --help
````
Les commandes ainsi listées sont disponibles et peuvent être lancées.
