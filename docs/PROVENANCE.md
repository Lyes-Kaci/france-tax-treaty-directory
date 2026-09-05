# Provenance et équivalence à la page publique

## Source observée

- Page : `https://fiscaliteinternationale.fr/conventions-fiscales/`
- Identifiant WordPress public : `10422`
- Date de capture : `2026-09-05`
- Date de couverture annoncée par l’application : `2026-07-31`

La page WordPress embarque l’application autonome sous forme d’un document HTML encodé en Base64 puis injecté dans un `iframe` par `srcdoc`.

L’application a été extraite mécaniquement du contenu public, décodée sans réécriture et enregistrée dans `app/index.html`.

## Empreintes

| Objet | SHA-256 |
|---|---|
| Réponse JSON publique de la page WordPress | `872f4f353884518a65cd75e363728fd191d32d69f59e645d580092f10f443c9b` |
| Contenu WordPress rendu contenant l’application encodée | `93b8e4a2eea6f361fa74cd423d5191a6badf6b36606fb02bd0317f5ab23c064a` |
| Application autonome décodée, publiée dans `app/index.html` | `3d8f13c89664ef4ab11521b4e20e24b4482ded88ed853e1787a77f854d2c86b3` |

La réponse WordPress peut évoluer pour des raisons éditoriales ou techniques. L’empreinte déterminante pour cette version du dépôt est celle de l’application autonome.

## Reconstruction des données

`scripts/build-public-catalogue.mjs` lit le bloc de données de l’application et produit :

- `data/public-catalogue.json`, structuré par juridiction ;
- `data/instruments.csv`, comportant une ligne par référence d’instrument.

La reconstruction est déterministe. Le mode `--check` compare les octets reconstruits aux fichiers publiés.

## Limites

Les liens principaux conduisent fréquemment à des versions consolidées publiées à titre informatif. Ils ne dispensent pas de rapprocher les textes bilatéraux authentiques, les actes modificatifs, la Convention multilatérale et leurs dates de prise d’effet.

Le dépôt décrit l’état du répertoire public à une date donnée. Il ne certifie pas qu’une URL tierce restera stable ni qu’un instrument demeurera applicable après cette date.
