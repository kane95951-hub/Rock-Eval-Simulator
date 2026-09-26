# PetroRock-Eval Simulator

Simulateur pédagogique de pyrolyse Rock-Eval — visualise, de façon simplifiée, comment une roche mère génère ses signaux **S1, S2, S3** et **Tmax** pendant une analyse Rock-Eval.

**Démo en ligne :** [kane95951-hub.github.io/PetroRock-Eval-Simulator](https://kane95951-hub.github.io/PetroRock-Eval-Simulator/)

Projet étudiant — EHES, Génie Pétrolier et Gaz, Dakar. Réalisé avec l'assistance de Claude (Anthropic).

## À quoi ça sert ?

Cet outil s'adresse aux étudiants en géologie pétrolière qui découvrent la pyrolyse Rock-Eval et veulent relier intuitivement la théorie (TOC, HI, IO, Tmax) aux courbes qu'elle produit, sans avoir besoin d'un laboratoire ni d'échantillons réels.

## Fonctionnalités

- Formulaire de paramètres : **TOC** (%), **HI** (mg HC/g TOC), **IO** (mg CO2/g TOC), **Tmax cible** (°C)
- Préréglages rapides par type de kérogène (I, II, III)
- Validation des champs avec messages d'erreur en français
- Graphique interactif (Chart.js) des trois courbes S1/S2/S3, avec une ligne annotant Tmax
- Export des points calculés en **CSV**
- Export du graphique en **image PNG**
- Mode sombre / clair (mémorisé d'une visite à l'autre)
- Application installable (PWA), avec un fonctionnement hors-ligne basique après une première visite en ligne

## Comment ça marche (modèle simplifié)

Le simulateur ne mesure rien : il **génère** des courbes plausibles à partir des paramètres saisis, selon des règles simplifiées à visée pédagogique :

- `S2 = HI × TOC / 100`, tracée comme une gaussienne asymétrique centrée sur Tmax (montée lente, descente rapide)
- `S3 = IO × TOC / 100`, tracée comme un pic plus large, centré à 400°C, indépendant de Tmax
- `S1 ≈ 0,075 × S2`, tracée comme une gaussienne étroite centrée à 300°C — le formulaire ne demandant pas S1 directement, cette valeur est estimée comme une petite fraction de S2

## Limites scientifiques — à lire avant utilisation

⚠️ **Ceci est une simulation pédagogique simplifiée, pas un outil de mesure.** Plusieurs approximations sont assumées :

- Les courbes sont des gaussiennes construites mathématiquement, pas des données de pyrolyse réelles
- S1 n'a pas de champ dédié et est estimé arbitrairement à partir de S2 (voir ci-dessus), ce qui ne reflète pas toujours la réalité géochimique
- La position et la largeur des pics (centre de S1 à 300°C, centre de S3 à 400°C, largeurs des trois pics) sont des valeurs fixes choisies pour donner une allure réaliste, pas calibrées sur des mesures de laboratoire
- Aucune variable de temps de rétention, de vitesse de chauffe ou d'appareil réel n'est prise en compte

Les sources scientifiques précises ayant inspiré ce modèle simplifié sont listées ci-dessous.

## Sources scientifiques

- Behar, F., Beaumont, V., De B. Penteado, H.L. (2001). *Rock-Eval 6 Technology: Performances and Developments*. Oil & Gas Science and Technology – Rev. IFP, 56(2), 111-134. [doi:10.2516/ogst:2001013](https://doi.org/10.2516/ogst:2001013) — décrit les paramètres Rock-Eval (S1, S2, S3, TOC, Tmax) et leur méthode d'acquisition.
- IFP Énergies nouvelles (IFPEN). [*Rock-Eval® : analyse thermique des roches et des sols*](https://www.ifpenergiesnouvelles.fr/breve/rock-evalr-analyse-thermique-des-roches-et-des-sols) et [*Rock-Eval® : pour aller plus loin*](https://www.ifpenergiesnouvelles.fr/breve/rock-evalr-aller-plus-loin) — présentation générale de la méthode et des indices dérivés (HI, IO).
- Pimmel, A., and Claypool, G. (2001). *Introduction to Shipboard Organic Geochemistry on the JOIDES Resolution*. ODP Tech. Note, 30. [doi:10.2973/odp.tn.30.2001](https://doi.org/10.2973/odp.tn.30.2001) — définit notamment HI, IO et confirme que le pic S3 est mesuré jusqu'à environ 390°C, cohérent avec le centre choisi (400°C) pour la courbe S3 de ce simulateur.

## Utilisation

**En ligne :** ouvre simplement le [lien de démo](https://kane95951-hub.github.io/PetroRock-Eval-Simulator/), aucune installation requise.

**En local :**
1. Clone ou télécharge ce dépôt
2. Ouvre `index.html` dans un navigateur (double-clic suffit, aucun serveur requis)

## Structure du projet

```
├── index.html      # Page principale (formulaire + graphique)
├── script.js       # Fonctions de génération des courbes (genererS1/S2/S3)
├── manifest.json   # Métadonnées de l'application installable (PWA)
├── sw.js           # Service worker (fonctionnement hors-ligne basique)
└── icons/          # Icônes de l'application
    ├── icon-192.png
    └── icon-512.png
```

## Technologies

HTML, CSS et JavaScript natifs (aucun framework) pour le code, [Chart.js](https://www.chartjs.org/) pour les graphiques ; le tout hébergé gratuitement sur GitHub Pages.

## Auteur

Ousmane Kane — EHES, Génie Pétrolier et Gaz, Dakar
