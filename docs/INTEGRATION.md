# Intégration

## Application autonome

`app/index.html` peut être servi comme n’importe quel fichier HTML statique ou placé dans un répertoire d’une extension WordPress.

Exemple d’intégration lorsque le fichier est publié sous `/outils/annuaire-conventions/index.html` :

```html
<iframe
  title="Annuaire des conventions fiscales conclues par la France"
  src="/outils/annuaire-conventions/index.html"
  style="display:block;width:100%;height:100vh;min-height:900px;border:0"
  sandbox="allow-scripts allow-same-origin allow-popups allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation"
  referrerpolicy="strict-origin-when-cross-origin"
></iframe>
```

L’interface envoie au parent un message de redimensionnement de la forme :

```json
{"type":"annuaire-conventions:resize","height":1200}
```

Le parent peut écouter ce message et ajuster la hauteur de l’iframe après avoir contrôlé son origine.

## Données

Les exports JSON et CSV sont des photographies déterministes des données intégrées à l’application. Ils ne sont pas chargés dynamiquement par l’application v1.0.0 : une modification des exports sans reconstruction de `app/index.html` ne modifie pas l’interface publique.
