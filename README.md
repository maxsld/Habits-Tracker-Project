# Habit Tracker App

## Description
L'application **Habit Tracker** est un outil intuitif permettant aux utilisateurs de suivre leurs habitudes quotidiennes et de mesurer leur progression au fil du temps. Conçue avec une interface conviviale, elle aide à encourager la responsabilisation et la discipline personnelle. Elle permet d'ajouter, de suivre et d'analyser les habitudes dans un format simple et engageant.

Cette application web est développée avec **HTML**, **CSS**, et **JavaScript**, offrant une expérience utilisateur fluide et réactive. Elle intègre également une API **Node.js** pour interagir avec une base de données **MongoDB**.

## Fonctionnalités
- **Ajout et suppression d'habitudes** : Créez de nouvelles habitudes à suivre et supprimez celles que vous ne souhaitez plus suivre.
- **Suivi quotidien** : Visualisez votre score et vos progrès au fil du temps.
- **Statistiques de progression** : Suivez votre évolution avec des graphiques et statistiques simples.
- **Réinitialisation facile** : Mettez à jour le statut d'une habitude à tout moment pour suivre votre évolution de manière flexible.

## Prérequis
Pour exécuter ce projet, vous aurez besoin :
- D’un navigateur web récent et compatible.
- Du **VPN Cisco** pour accéder à la base de données MongoDB.
- De **Node.js** installé sur votre machine pour l'exécution de l'API.
- D’une instance **MongoDB** configurée, soit locale, soit distante.

## Installation
1. Clonez le dépôt sur votre machine locale :
   ```bash
   git clone https://github.com/maxsld/Habits-Tracker-Project.git
   ```
2. Accédez au répertoire du projet et entrez dans le dossier `server` :
   ```bash
   cd Habits-Tracker-Project/server
   ```
3. Exécutez la commande suivante pour installer les dépendances Node.js :
   ```bash
   npm install
   ```
4. Lancez l'application Node.js :
   ```bash
   node server.js
   ```
5. Ouvrez le répertoire racine du projet avec **VS Code** et ouvrez la page `index.html` avec **LiveServer** (situé dans le dossier `app`).
   - Assurez-vous que le serveur LiveServer fonctionne sur le port **5500** de votre machine.
   - L'application est conçue exclusivement pour les appareils mobiles et doit être visualisée en utilisant l'outil d'inspection du navigateur pour simuler une vue mobile.
   - Vous devez être connecté au **VPN Cisco** pour accéder à la base de données MongoDB.

## Structure du Projet
- **/app** : Contient les fichiers statiques HTML, CSS, et JavaScript pour l'application côté client.
- **/server** : Contient les fichiers utilisés par l'API Node.js pour gérer les interactions avec MongoDB et la logique métier.

## Utilisation
1. Lancez l'application dans votre navigateur.
2. Appuyez sur "Ajouter une habitude" pour créer une nouvelle entrée dans votre suivi d'habitudes.
3. Faites glisser les cartes représentant vos habitudes vers la gauche pour modifier leur statut (complété ou non).
4. Accédez à la section "Profil" pour suivre vos progrès et ceux de vos amis, et pour ajouter des habitudes supplémentaires.

## Licence
Ce projet est sous **licence MIT** – consultez le fichier [LICENSE](LICENSE) pour plus de détails.

## Auteurs
- **SOLDAN Maxens** - *Développeur principal* - [https://github.com/maxsld](https://github.com/maxsld)
- **RENAND Baptiste** - *Développeur principal* - [https://github.com/baptiste-rnd](https://github.com/baptiste-rnd)
