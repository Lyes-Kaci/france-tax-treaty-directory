# France Tax Treaty Directory

Répertoire public des conventions et accords fiscaux conclus par la France, accompagné de l’application interactive utilisée sur [fiscaliteinternationale.fr](https://fiscaliteinternationale.fr/conventions-fiscales/).

Cette première version publique reprend l’état affiché au **31 juillet 2026** :

- **128 juridictions** ;
- **255 références d’instruments** ;
- **7 textes signés non encore entrés en vigueur** ;
- les impôts couverts, actes complémentaires, statuts particuliers et liens vers les sources officielles.

## Contenu du dépôt

| Chemin | Contenu |
|---|---|
| `app/index.html` | Application autonome correspondant exactement à l’application décodée depuis la page publique le 5 septembre 2026 |
| `data/public-catalogue.json` | Corpus public structuré par juridiction |
| `data/instruments.csv` | Une ligne par référence d’instrument, soit 255 lignes de données |
| `data/public-catalogue.schema.json` | Schéma du fichier JSON |
| `scripts/` | Reconstruction déterministe des données et des empreintes |
| `tests/` | Contrôles d’intégrité du paquet public |

Le corpus publié ici est **le corpus français qui alimente l’annuaire**. Il ne s’agit ni d’un corpus mondial de conventions fiscales, ni d’une base de raisonnement juridique.

## Utilisation

L’application ne nécessite aucune installation : ouvrir `app/index.html` dans un navigateur moderne. La consultation par pays fonctionne localement. La carte utilise des bibliothèques et un fond cartographique externes et nécessite donc une connexion internet.

Pour reconstruire et contrôler les exports :

```sh
npm run build:data
npm run build:checksums
npm test
```

Node.js 20 ou une version ultérieure est nécessaire uniquement pour les scripts de reconstruction et de contrôle.

## Périmètre juridique

Le répertoire facilite l’accès aux instruments et à leurs sources. Il ne remplace pas la vérification des textes authentiques, de leur entrée en vigueur, de leurs dates de prise d’effet, des suspensions, des dénonciations ni des effets de la Convention multilatérale.

Les versions consolidées intégrant la Convention multilatérale sont publiées à titre informatif. Le dépôt ne produit aucune conclusion juridique ou fiscale automatisée.

Les PDF et textes intégraux hébergés par les administrations ou organisations compétentes ne sont pas recopiés dans ce dépôt : les liens officiels sont conservés.

## Sources principales

- [Répertoire DGFiP des conventions internationales](https://www.impots.gouv.fr/les-conventions-internationales)
- [Liste BOFiP des conventions fiscales conclues par la France](https://bofip.impots.gouv.fr/bofip/2509-PGP.html/identifiant=BOI-ANNX-000306-20260429)
- Légifrance, assemblées parlementaires et OCDE lorsque leurs publications sont nécessaires à la compréhension d’un instrument ou de son état

La provenance et les limites de la photographie publiée sont détaillées dans [`docs/PROVENANCE.md`](docs/PROVENANCE.md).

## Citation

Les métadonnées de citation sont fournies dans [`CITATION.cff`](CITATION.cff).

## Droits

Copyright © 2026 Lyès Kaci. Tous droits réservés.

La présence du code et des données sur GitHub ne leur confère pas le statut de logiciel ou de jeu de données open source. Les ressources officielles liées conservent leur propre statut juridique et leurs propres conditions de réutilisation.

---

## English summary

This repository contains the public directory of tax treaties and related instruments concluded by France, together with the standalone browser application deployed on fiscaliteinternationale.fr. Release 1.0.0 covers 128 jurisdictions, 255 instrument references and seven signed instruments not yet in force, as displayed on 31 July 2026. It is a reference directory, not an automated legal conclusion system. Copyright © 2026 Lyès Kaci. All rights reserved.
