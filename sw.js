// sw.js — Service worker minimal pour un fonctionnement hors-ligne basique.
//
// Objectif : une fois la page visitée au moins une fois avec une connexion,
// on peut la rouvrir sans réseau (formulaire, textes, mise en page) grâce
// aux fichiers mis en cache ci-dessous. Chart.js (chargé depuis un CDN
// externe) est rangé dans le cache dès qu'il passe par ce service worker,
// c'est-à-dire à la 2e visite en ligne (à la 1re, le service worker vient
// juste de s'installer). Ensuite, plus besoin de connexion.

const NOM_CACHE = 'rockeval-cache-v3';

// Adresse exacte de Chart.js dans index.html (doit rester identique).
const URL_CHARTJS = 'https://cdn.jsdelivr.net/npm/chart.js@4/dist/chart.umd.min.js';

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
  // Chart.js : même stratégie, mais on le télécharge puis on le range dans
  // le cache au passage. On ne garde la copie que si la réponse est bonne
  // (code 200), pour ne jamais mémoriser une erreur du CDN.
  if (evenement.request.url === URL_CHARTJS) {
    evenement.respondWith(
      caches.match(URL_CHARTJS).then(function (reponseEnCache) {
        if (reponseEnCache) return reponseEnCache;
        return fetch(URL_CHARTJS, { mode: 'cors' }).then(function (reponse) {
          if (reponse.ok) {
            const copie = reponse.clone();
            caches.open(NOM_CACHE).then(function (cache) {
              cache.put(URL_CHARTJS, copie);
            });
          }
          return reponse;
        }).catch(function () {
          // Échec du téléchargement "cors" : on tente la requête d'origine.
          return fetch(evenement.request);
        });
      })
    );
    return;
  }

  evenement.respondWith(
    caches.match(evenement.request).then(function (reponseEnCache) {
      return reponseEnCache || fetch(evenement.request);
    })
  );
});
