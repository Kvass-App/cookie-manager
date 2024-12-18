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
    acceptAll: 'Aksepter alle',
    declineAll: 'Avslå alle',
    confirm: 'Bekreft',
  },
  consents: [
    {
      id: 'required',
      required: true,
      title: 'Nødvendige cookies',
    },
    {
      id: 'statistics',
      default: true,
      title: 'Statistikk',
    },
    {
      id: 'marketing',
      default: true,
      title: 'Markedsføring',
    },
  ],
  onChange(consents) {
    console.log(consents)
  },
})
```
