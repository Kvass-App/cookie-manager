[![Commitizen friendly](https://img.shields.io/badge/commitizen-friendly-brightgreen.svg)](http://commitizen.github.io/cz-cli/)

# @kvass/cookie-manager

## Docs

### Example

```js
let CM = new CookieManager({
  title: 'Denne nettsiden bruker cookies',
  description: `Vi bruker informasjonskapsler (cookies) for å gi deg en best mulig brukeropplevelse. Informasjonskapslene brukes for å analysere trafikken vår, forbedre nettsidene, gi innhold og annonser et personlig preg, og for å tilby funksjoner knyttet til sosiale medier.

 For mer informasjon se vår Personvernerklæring.`,
  labels: {
    accept: 'Aksepter',
    decline: 'Kun nødvendige',
  },
  consents: [
    {
      id: 'required',
      required: true,
      title: 'Nødvendige cookies',
      description:
        'Nødvendige informasjonskapsler ivaretar grunnleggende funksjoner som sidenavigasjon og tilgang til sikre områder av nettstedet. Nettstedet kan ikke fungere optimalt uten disse informasjonskapslene.',
    },
    {
      id: 'statistics',
      default: true,
      title: 'Statistikk',
      description:
        'Analytiske informasjonskapsler hjelper oss å forbedre nettstedet vårt ved å samle inn og rapportere statistikk informasjon om bruken. Informasjonen er anonymisert.',
    },
    {
      id: 'marketing',
      default: true,
      title: 'Markedsføring',
      description:
        'Markedsførings-informasjonskapsler brukes for å vise innhold fra sosiale medier og annonser som er mer relevante og engasjerende.',
    },
  ],
  onChange(consents) {
    console.log(consents)
  },
})
```
