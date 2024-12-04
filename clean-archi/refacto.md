## Fichier DeployerLoadBalancer & AwsLoadBalancerRepository

2 notations possibles pour le passage de parametres comme objet :

1. deploy(targetGroups: [targetGroupTraefik, targetGroupTraefikAPI])
    - Avantages : meilleur lisibilité (ex. targetGroupArn: targetGroupTraefik.arn)
    - inconvenients: nombre de parametres limités. Si on veut ajouter un autre objet, on doit modifier cette fonction deploy et l'interface

2. deploy(targetGroups: [])
    - Avantages : nombre de parametres ilimités, on peut utiliser foreach() pour les deploiements (voir methode deploy du AwsLoadBalancer)
    - Inconvenients : pas de lisibilité (targetGroupArn: targetGroups[0].arn) - il y a quoi dans l'indice 0 ?

On envoie comme parametre `vpcRepository`. L'objectf est de recuperer les resources dans l'use-case et puis, envoyer une liste d'objets deployés. Cette liste doit accepter un nombre quelconque d'elements et a la fois, d'etre lisible (pas de indices liste[0])
- methode map ?