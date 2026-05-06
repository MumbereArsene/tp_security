# 🛡️ Laboratoire SIEM & SOC - CyberSOC Alpha-1

Ce projet est une plateforme de simulation de Centre d'Opérations de Sécurité (SOC) ultra-moderne, conçue pour démontrer en temps réel la détection et l'analyse d'attaques par force brute.

## 🚀 Fonctionnalités Clés

### 1. Pipeline SIEM Temps Réel
*   **Flux de Données Direct** : Utilisation de **Socket.IO** pour diffuser instantanément chaque tentative de connexion vers le dashboard.
*   **Source of Truth** : Les statistiques (Succès, Échecs, Alertes) sont calculées en temps réel à partir de la base de données SQLite pour une précision mathématique.
*   **Persistance Totale** : Toutes les données (logs, paquets, stats) survivent au rafraîchissement de la page jusqu'au lancement de la prochaine attaque.

### 2. Moteur d'Attaque Hydra (Audit de Sécurité)
*   **Simulation par Dictionnaire** : Script Python (`hydra.py`) effectuant un balayage exhaustif (121 combinaisons) contre l'API de login.
*   **Streaming Terminal** : Chaque ligne de la console Hydra est envoyée en direct à la page **"Hydra Attaque"** du dashboard via un tunnel WebSocket.
*   **Usurpation d'Identité (Session Hijacking)** : Lors d'un succès, le script force l'ouverture d'un nouvel onglet, remplit visuellement le formulaire de login et connecte l'utilisateur automatiquement après une analyse de 2 secondes.

### 3. Inspection de Paquets (Wireshark View)
*   **Analyse Réseau** : Génération de 3 paquets (TCP SYN, HTTP POST, HTTP RESPONSE) pour chaque tentative détectée.
*   **Détails Techniques** : Affichage des adresses IP sources (aléatoires), des protocoles, de la taille des paquets et des drapeaux TCP.
*   **Historique** : Les paquets sont stockés en base de données pour permettre une analyse post-mortem complète.

### 4. Interface SOC Premium
*   **Sidebar Fixe** : Navigation optimisée entre les Opérations, le Monitoring Live, le Simulateur et l'Inspecteur de Paquets.
*   **TopBar Uniforme** : Télémétrie en temps réel affichant le débit de paquets (GB/s) et le mode de chiffrement (AES-256).
*   **Design Cyber** : Esthétique sombre "Hacker" avec animations Framer Motion et thémisation cohérente.

## 🛠️ Architecture Technique

*   **Backend** : Flask (Python) avec Flask-SocketIO pour l'asynchrone, SQLAlchemy pour la base de données `hydra.sqlite`, et JWT pour la gestion des sessions.
*   **Frontend** : React.js (Vite) avec Tailwind CSS pour le style et Lucide React pour l'iconographie.
*   **Sécurité** : Hachage des mots de passe avec Bcrypt et protection des routes via JWT.

## 📖 Mode d'Emploi

1.  **Démarrage du Serveur** : `python server/app.py` (Réinitialise les utilisateurs et synchronise les stats).
2.  **Ouverture du Dashboard** : Se connecter en tant qu'`admin` (pass: `admin123`) sur `http://localhost:3000`.
3.  **Lancement de l'Attaque** : Exécuter `python server/hydra.py` dans un terminal séparé.
4.  **Surveillance** : Observer le flux de paquets dans le "Packet Inspector" et les logs bruts dans "Hydra Attaque".

---
*Ce projet a été développé dans un but éducatif pour illustrer les mécanismes de défense et de monitoring en cybersécurité.*
