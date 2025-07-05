# Push Swap Tools

Une application web complète pour tester et visualiser les algorithmes push_swap avec une interface moderne et sombre.

## 🚀 Démo en direct

**[Essayez l'application ici](https://push-swap-visualizerv2.onrender.com/)**

## 🎥 Aperçu en GIF

Voici un aperçu de l'application en action :

![Demo Push Swap Tools](./assets/demo.gif)

## 📖 Description

Push Swap Tools est une suite d'outils dédiée au projet push_swap de l'école 42. L'application offre deux modes principaux :

- **Mode Testeur** : Validation rigoureuse de vos exécutables push_swap avec des tests automatisés
- **Mode Visualiseur** : Animation étape par étape du tri pour comprendre votre algorithme

## ✨ Fonctionnalités

### Mode Testeur
- Upload de fichiers push_swap et checker
- Tests automatisés avec paramètres configurables
- Validation des résultats et analyse des performances
- Statistiques détaillées sur la réussite des tests
- Affichage des arguments en cas d'échec

### Mode Visualiseur
- Animation fluide des opérations push_swap
- Contrôles de lecture (play/pause/restart)
- Vitesse d'animation ajustable
- Mise en évidence des éléments en mouvement
- Interface intuitive avec indicateurs visuels

### Interface utilisateur
- Thème sombre moderne avec accents cyan/teal
- Interface responsive pour desktop et mobile
- Navigation par onglets entre les modes
- Design professionnel avec shadcn/ui

## 🛠️ Technologies utilisées

### Frontend
- **React 18** avec TypeScript
- **Vite** pour le développement et le build
- **Tailwind CSS** pour le styling
- **Shadcn/ui** pour les composants UI
- **TanStack Query** pour la gestion d'état
- **Wouter** pour le routing
- **Lucide React** pour les icônes

### Backend
- **Express.js** avec TypeScript
- **Multer** pour l'upload de fichiers
- **Drizzle ORM** avec PostgreSQL
- **Node.js child_process** pour l'exécution des binaires

### Base de données
- **PostgreSQL** avec Neon Database
- **Drizzle ORM** pour les migrations et requêtes

## 🏗️ Architecture

```
push-swap-tools/
├── client/                 # Frontend React
│   ├── src/
│   │   ├── components/     # Composants React
│   │   ├── pages/          # Pages de l'application
│   │   ├── lib/            # Utilitaires et types
│   │   └── hooks/          # Hooks personnalisés
│   └── index.html
├── server/                 # Backend Express
│   ├── index.ts           # Point d'entrée du serveur
│   ├── routes.ts          # Routes API
│   └── storage.ts         # Interface de stockage
├── shared/                # Types partagés
│   └── schema.ts          # Schémas Drizzle
└── uploads/               # Fichiers uploadés temporaires
```

## 🚀 Installation locale

### Prérequis
- Node.js 18+ 
- PostgreSQL (optionnel, utilise la mémoire par défaut)

### Installation
```bash
# Cloner le repository
git clone https://github.com/amn93p/push_swap_visualizerv2.git
cd push_swap_visualizerv2

# Installer les dépendances
npm install

# Lancer en mode développement
npm run dev
```

L'application sera disponible sur `http://localhost:5000`

### Variables d'environnement (optionnel)
```env
DATABASE_URL=postgresql://...  # Pour utiliser PostgreSQL
```

## 📝 Utilisation

### Mode Testeur
1. Uploadez votre exécutable `push_swap`
2. Uploadez votre binaire `checker`
3. Configurez les paramètres de test :
   - Taille de la liste (nombre d'éléments à trier)
   - Nombre maximum d'opérations autorisées
   - Nombre de tests à effectuer
4. Lancez les tests et consultez les résultats

### Mode Visualiseur
1. Uploadez votre exécutable `push_swap`
2. Choisissez la taille de la liste (3-500 éléments)
3. Ajustez la vitesse d'animation
4. Générez et visualisez le tri étape par étape

## 🎯 Fonctionnalités à venir

- [ ] Sauvegarde des configurations de test
- [ ] Comparaison de différents algorithmes
- [ ] Export des résultats en PDF
- [ ] Mode sombre/clair
- [ ] Historique des tests

## 🤝 Contribution

Les contributions sont les bienvenues ! Pour contribuer :

1. Forkez le projet
2. Créez une branche pour votre fonctionnalité (`git checkout -b feature/AmazingFeature`)
3. Committez vos changements (`git commit -m 'Add some AmazingFeature'`)
4. Poussez vers la branche (`git push origin feature/AmazingFeature`)
5. Ouvrez une Pull Request

## 📄 Licence

Ce projet est sous licence MIT. Voir le fichier `LICENSE` pour plus de détails.

## 🙏 Remerciements

- École 42 pour le projet push_swap
- La communauté React et Express.js
- Les mainteneurs de shadcn/ui pour les composants UI

## 📞 Support

Si vous rencontrez des problèmes ou avez des questions :
- Ouvrez une issue sur GitHub
- Consultez la documentation du projet push_swap

---

**Développé avec ❤️ pour la communauté 42**
