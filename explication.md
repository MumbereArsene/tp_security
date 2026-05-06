# Documentation Technique : CyberSOC Alpha-1

Ce document fournit une explication détaillée des fonctionnalités, de l'architecture et des mécanismes de sécurité implémentés dans le projet **CyberSOC Alpha-1**.

---

## 🏗️ Architecture du Système

Le projet suit une architecture client-serveur moderne :

1.  **Backend (Serveur Flask)** :
    *   Gère l'API REST pour l'authentification et la récupération des données.
    *   Maintient une connexion **WebSocket (Socket.io)** pour pousser les alertes en temps réel.
    *   Exécute un thread de simulation en arrière-plan pour animer le tableau de bord.
    *   Interface avec la base de données SQLite pour stocker les logs et les bannissements.

2.  **Frontend (React Dashboard)** :
    *   Interface utilisateur immersive (style Cyberpunk).
    *   Visualisation de données dynamique (Recharts).
    *   Gestion d'état en temps réel pour refléter les attaques instantanément.

---

## 🛠️ Fonctionnalités Détaillées

### 1. Tableau de Bord SOC (Onglet Monitor)
C'est le cœur du système. Il simule un centre d'opérations de sécurité réel.
*   **Vecteur d'Intensité d'Attaque** : Un graphique en temps réel montrant le volume de requêtes.
*   **Terminal de Logs Live** : Affiche chaque tentative de connexion entrante, son statut (SUCCESS, FAILED, BLOCKED), l'IP d'origine et les identifiants testés.
*   **Statistiques Clés** : Compteurs d'attaques totales, échecs, IPs bloquées et alertes critiques.
*   **Origines des Menaces** : Simulation de la répartition géographique des attaques par pays.

### 2. Laboratoire Brute Force (Onglet BruteForce_Lab)
Cette section permet de passer de la théorie à la pratique.
*   **Générateur de Commandes Hydra** : Permet de configurer une attaque (nom d'utilisateur, IP cible, dictionnaire) et génère la commande exacte à exécuter dans Kali Linux.
*   **Guide d'Exécution** : Instructions pour les étudiants sur la manière d'utiliser Hydra pour attaquer le formulaire de connexion du projet.

### 3. Inspection Réseau (Onglet Network_Inspect)
Une simulation de **Wireshark** intégrée.
*   **Capture de Paquets** : Affiche les flux TCP et HTTP.
*   **Analyse Hexadécimale** : Affiche le contenu brut des paquets (Hex Dump) pour l'analyse forensique.
*   **Détection de Patterns** : Analyse automatique signalant des comportements suspects comme le "TCP Flood".

---

## 🛡️ Mécanismes de Sécurité (Mitigations)

### 1. Détection de Force Brute et Blocage d'IP
Le backend surveille activement l'IP de chaque requête.
*   **Seuil** : Si une IP échoue **5 fois** en moins de **5 minutes**, elle est automatiquement bannie.
*   **Action** : Une entrée est créée dans la table `blocked_ips` et un signal est envoyé via Socket.io pour alerter le dashboard.
*   **Effet** : Toute tentative ultérieure de cette IP renverra une erreur **403 Forbidden** jusqu'à la fin du bannissement (1 heure par défaut).

### 2. Sécurité des Données
*   **Bcrypt** : Les mots de passe ne sont jamais stockés en clair. Ils sont "salés" et hachés.
*   **JWT (JSON Web Tokens)** : Les sessions sont gérées de manière sécurisée. Un jeton est requis pour accéder aux logs sensibles et aux fonctions d'administration.
*   **Protection SQLi** : Utilisation de SQLAlchemy (ORM) pour prévenir les injections SQL.

---

## 🤖 Système de Simulation
Pour garantir que le dashboard soit impressionnant lors d'une présentation (même sans attaque réelle en cours), un thread Python génère des "attaques fantômes" :
*   Il choisit des noms d'utilisateurs et des mots de passe aléatoires dans des dictionnaires courants (`admin`, `root`, `123456`).
*   Il simule des IPs et des pays variés.
*   Il injecte parfois des succès de connexion (CRITICAL) pour tester la réactivité des analystes SOC.

---

## 🎓 Guide pour la Soutenance (Présentation)

1.  **Introduction** : Présentez le CyberSOC comme un outil pédagogique pour comprendre la défense active.
2.  **Démonstration Passive** : Montrez le dashboard animé par la simulation. Expliquez les graphiques.
3.  **Démonstration Active** : Lancez une attaque Hydra depuis un terminal. Montrez comment le terminal du SOC réagit instantanément.
4.  **Conclusion** : Montrez le blocage automatique de l'IP de l'attaquant, prouvant l'efficacité de la mitigation.

---
*Documentation générée pour le projet universitaire : Web Authentication Brute Force Simulator.*
