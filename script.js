/**
 * script.js — Génération des trois courbes de pyrolyse Rock-Eval (S1, S2, S3).
 *
 * Ce fichier ne contient que la partie "modèle mathématique" du simulateur :
 * trois fonctions, chacune indépendante, qui transforment un jeu de
 * paramètres (TOC, HI, IO, Tmax, saisis dans index.html) en un tableau de
 * points {temperature, valeur} prêt à être tracé avec Chart.js.
 *
 * Toute la logique d'interface (formulaire, validation, graphique, thème,
 * exports) vit dans le <script> de index.html — ce fichier reste focalisé
 * sur le calcul, pour rester facile à tester et à faire évoluer séparément.
 *
 * Les trois courbes sont des gaussiennes (voir gaussienne() ci-dessous),
 * choisies pour leur forme réaliste plutôt que pour une exactitude
 * scientifique stricte — voir la section "Limites scientifiques" du
 * README.md du dépôt pour le détail des simplifications assumées.
 */

/**
 * Calcule la valeur d'une gaussienne à une température donnée.
 *
 * Fonction utilitaire commune à genererS1, genererS2 et genererS3 :
 * les trois courbes suivent la même forme mathématique de base — seuls
 * leur position (centre), leur largeur et leur hauteur diffèrent. La
 * regrouper ici évite de répéter trois fois la même formule.
 *
 * @param {number} temperature - Température (°C) où évaluer la courbe
 * @param {number} centre - Position du sommet du pic (°C)
 * @param {number} largeur - Écart-type : plus il est petit, plus le pic est étroit
 * @param {number} hauteur - Amplitude maximale du pic
 * @returns {number} Valeur de la gaussienne à cette température
 */
function gaussienne(temperature, centre, largeur, hauteur) {
  const exposant = -0.5 * Math.pow((temperature - centre) / largeur, 2);
  return hauteur * Math.exp(exposant);
}

/**
 * Génère les points de la courbe S1 (hydrocarbures libres).
 *
 * Le pic S1 correspond aux hydrocarbures déjà présents dans la roche
 * avant la pyrolyse : ils s'évaporent tôt et rapidement pendant la
 * chauffe, d'où une gaussienne volontairement étroite, centrée à 300°C.
 *
 * @param {number[]} temperatures - Températures (°C) où calculer la courbe
 * @param {number} valeurS1 - Valeur totale de S1 (mg HC/g roche) : pilote
 *                            la hauteur du pic (aire sous la courbe)
 * @returns {{temperature: number, valeur: number}[]} Tableau de points
 */
function genererS1(temperatures, valeurS1) {
  const centre = 300;  // °C — position du sommet du pic S1
  const largeur = 15;  // °C — écart-type : pic étroit et pointu

  // Ce facteur assure que l'aire totale sous la courbe reste
  // proportionnelle à valeurS1, quelle que soit la largeur choisie.
  const hauteur = valeurS1 / (largeur * Math.sqrt(2 * Math.PI));

  return temperatures.map(function (temperature) {
    return {
      temperature: temperature,
      valeur: gaussienne(temperature, centre, largeur, hauteur)
    };
  });
}

/**
 * Génère les points de la courbe S2 (hydrocarbures issus du craquage
 * du kérogène pendant la pyrolyse).
 *
 * Contrairement à S1, le pic S2 est asymétrique : la montée est
 * progressive (le craquage du kérogène s'accélère doucement avec la
 * température) tandis que la descente après le sommet est plus rapide
 * (le kérogène disponible s'épuise vite une fois le pic dépassé). Le
 * sommet de la courbe correspond à Tmax.
 *
 * @param {number[]} temperatures - Températures (°C), typiquement entre 300 et 650°C
 * @param {number} valeurS2 - Valeur totale de S2 (mg HC/g roche) : pilote la hauteur du pic
 * @param {number} tmax - Température (°C) du sommet du pic
 * @returns {{temperature: number, valeur: number}[]} Tableau de points
 */
function genererS2(temperatures, valeurS2, tmax) {
  const largeurMontee = 55;   // °C — écart-type avant tmax : plus large = montée lente
  const largeurDescente = 35; // °C — écart-type après tmax : plus étroit = descente rapide

  // Hauteur approximative pour garder l'aire sous la courbe
  // proportionnelle à valeurS2, malgré l'asymétrie du pic.
  const largeurMoyenne = (largeurMontee + largeurDescente) / 2;
  const hauteur = valeurS2 / (largeurMoyenne * Math.sqrt(2 * Math.PI));

  return temperatures.map(function (temperature) {
    // Avant le sommet : montée lente (largeur plus grande).
    // Après le sommet : descente rapide (largeur plus petite).
    const largeur = temperature <= tmax ? largeurMontee : largeurDescente;

    return {
      temperature: temperature,
      valeur: gaussienne(temperature, tmax, largeur, hauteur)
    };
  });
}

/**
 * Génère les points de la courbe S3 (CO2 libéré par les groupes
 * fonctionnels oxygénés du kérogène pendant la pyrolyse).
 *
 * Le pic S3 est plus large que S2 : contrairement au craquage des
 * hydrocarbures (qui dépend fortement de la maturité, donc de tmax),
 * la décomposition des groupes oxygénés se produit sur une plage de
 * température plus étendue et à peu près indépendante de tmax — le
 * pic reste donc centré sur une position fixe.
 *
 * @param {number[]} temperatures - Températures (°C), typiquement entre 300 et 650°C
 * @param {number} valeurIO - Indice d'oxygène (mg CO2/g TOC) : pilote la hauteur du pic
 * @returns {{temperature: number, valeur: number}[]} Tableau de points
 */
function genererS3(temperatures, valeurIO) {
  const centre = 400;  // °C — position du pic S3, indépendante de tmax
  const largeur = 90;  // °C — écart-type large : pic plus étalé que S2

  const hauteur = valeurIO / (largeur * Math.sqrt(2 * Math.PI));

  return temperatures.map(function (temperature) {
    return {
      temperature: temperature,
      valeur: gaussienne(temperature, centre, largeur, hauteur)
    };
  });
}
