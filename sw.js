// sw.js — Service worker minimal pour un fonctionnement hors-ligne basique.
//
// Objectif : une fois la page visitée au moins une fois avec une connexion,
// on peut la rouvrir sans réseau (formulaire, textes, mise en page) grâce
// aux fichiers mis en cache ci-dessous. Le graphique (Chart.js, chargé
// depuis un CDN externe) n'est pas mis en cache ici pour rester simple :
// il faudra donc une connexion la première fois qu'il doit se charger.

const NOM_CACHE = 'rockeval-cache-v1';

const FICHIERS_A_METTRE_EN_CACHE = [
  './',
  './index.html',
  './script.js',
  './manifest.json',
  './icon-192.png',
  './icon-512.png'
];

// À l'installation : on télécharge et on met en cache les fichiers essentiels.
self.addEventListener('install', function (evenement) {
  evenement.waitUntil(
    caches.open(NOM_CACHE).then(function (cache) {
      return cache.addAll(FICHIERS_A_METTRE_EN_CACHE);
    })
  );
  self.skipWaiting();
});

// À l'activation : on supprime les anciennes versions du cache, s'il y en a
// (utile plus tard, si on met à jour NOM_CACHE après une modification).
self.addEventListener('activate', function (evenement) {
  evenement.waitUntil(
    caches.keys().then(function (nomsCaches) {
      return Promise.all(
        nomsCaches
          .filter(function (nom) { return nom !== NOM_CACHE; })
          .map(function (nom) { return caches.delete(nom); })
      );
    })
  );
  self.clients.claim();
});

// À chaque requête : on sert depuis le cache si le fichier y est, sinon on
// va chercher sur le réseau (stratégie "cache d'abord", la plus simple).
self.addEventListener('fetch', function (evenement) {
  evenement.respondWith(
    caches.match(evenement.request).then(function (reponseEnCache) {
      return reponseEnCache || fetch(evenement.request);
    })
  );
});
