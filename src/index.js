function CookieManager(options = {}) {
  let { onChange = () => {}, container = document.body } = options;

  let value;
  let el = document.createElement("form");
  el.classList.add("cookie-manager");

  const getMarkup = (options) => `
  <form class="cookie-manager">
    <div class="cookie-manager__modal">
      <div class="cookie-manager__title">${options.title}</div>
      <div class="cookie-manager__description">${options.description}</div>
      ${options.consents
        .map(
          (c) => `
        <label class="cookie-manager__consent">
          <span class="cookie-manager__consent-content">
            <span class="cookie-manager__consent-title">${c.title}</span>
            <span class="cookie-manager__consent-description">${
              c.description
            }</span>
          </span>
          
          <input type="checkbox" name="consent" value="${c.id}" ${
            (value && value.includes(c.id)) ||
            (!value && (c.default || c.required))
              ? "checked"
              : ""
          } ${c.required ? 'disabled="disabled"' : ""} />
          
        </label>
      `
        )
        .join("")}
        <div class="cookie-manager__actions">
            <button type="submit" class="cookie-manager__accept">${
              options.labels.accept
            }</button>
            <button type="submit" class="cookie-manager__decline">${
              options.labels.decline
            }</button>
          </div>
    </div>
  </form>
`;
  const getStyle = () => `
  .cookie-manager {
    background-color: rgba(0,0,0,0.8);

    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 2rem;

    display: flex;
    justify-content: center;
    align-items: center;
  }

  .cookie-manager__modal {
    background-color: white;
    padding: 2rem;
    border-radius: var(--border-radius, 3px);
    max-width: 600px;
  }

  .cookie-manager__title,
  .cookie-manager__consent-title {
    font-weight: bold;
    font-size: 1.25rem;
    margin-bottom: .5rem;
  }

  .cookie-manager__consent {
    border: 1px solid var(--border-color, #eaeaea);
    border-radius: var(--border-radius, 3px);
    margin-top: 1rem;
    padding: 1rem;
    display: flex;

    font-weight: normal;
    cursor: pointer;
  }

  .cookie-manager__consent span {
    display: block;
  }

  .cookie-manager__consent input {
    transform: scale(1.2);
  }

  .cookie-manager__consent-title {
    font-size: 1rem;
  }
  
  .cookie-manager__consent-description {
    font-size: .8rem;
  }

  .cookie-manager__actions {
    display: flex;
    justify-content: center;
    gap: 1rem;
    flex-wrap: wrap;
    background-color: #f9f9f9;
    padding: 2rem;
    margin: 2rem -2rem -2rem -2rem;
  }
  
  .cookie-manager__actions button {
    padding: .5rem 1.5rem;
    border: 1px solid #d8d8d8;
    border-radius: var(--border-radius, 3px);
    cursor: pointer;
  }

  .cookie-manager__accept {
    background-color: var(--primary, #1d56d8);
    border-color: var(--primary, #1d56d8);
    color: var(--primary-contrast, white);
  }
`;

  let style = document.createElement("style");
  style.innerHTML = getStyle(options);

  document.head.appendChild(style);

  let save = (consents) => {
    window.localStorage.setItem(`cookie-manager`, consents);
    value = consents;
  };
  let load = () => {
    let raw = window.localStorage.getItem("cookie-manager");
    if (!raw) return;
    value = raw.split(",");
  };
  let hide = () => container.removeChild(el);
  let render = () => {
    el.innerHTML = getMarkup(options);
    container.appendChild(el);
  };
  let init = () => {
    load();
    el.addEventListener("click", handlers.clickaway);
    el.addEventListener("submit", handlers.submit);
    if (!value) render();
    else onChange(value);
  };
  let destroy = () => {
    el.removeEventListener("click", handlers.clickaway);
    el.removeEventListener("submit", handlers.submit);
    hide();
  };

  let handlers = {
    clickaway: (e) => e.target === el && hide(),
    submit: (e) => {
      e.preventDefault();
      let consents = e.submitter.className.includes("decline")
        ? options.consents.filter((c) => c.required).map((c) => c.id)
        : Array.from(e.target.querySelectorAll("input"))
            .filter((e) => e.checked)
            .map((e) => e.value);
      onChange(consents);
      save(consents);
      hide();
    },
  };

  init();

  return {
    show: render,
    hide,
    destroy,
  };
}

// Sample
let CM = new CookieManager({
  title: "Denne nettsiden bruker cookies",
  description: `Vi bruker informasjonskapsler (cookies) for å gi deg en best mulig brukeropplevelse. Informasjonskapslene brukes for å analysere trafikken vår, forbedre nettsidene, gi innhold og annonser et personlig preg, og for å tilby funksjoner knyttet til sosiale medier.

  For mer informasjon se vår Personvernerklæring.`,
  labels: {
    accept: "Aksepter",
    decline: "Kun nødvendige",
  },
  consents: [
    {
      id: "required",
      required: true,
      title: "Nødvendige cookies",
      description:
        "Nødvendige informasjonskapsler ivaretar grunnleggende funksjoner som sidenavigasjon og tilgang til sikre områder av nettstedet. Nettstedet kan ikke fungere optimalt uten disse informasjonskapslene.",
    },
    {
      id: "statistics",
      default: true,
      title: "Statistikk",
      description:
        "Analytiske informasjonskapsler hjelper oss å forbedre nettstedet vårt ved å samle inn og rapportere statistikk informasjon om bruken. Informasjonen er anonymisert.",
    },
    {
      id: "marketing",
      default: true,
      title: "Markedsføring",
      description:
        "Markedsførings-informasjonskapsler brukes for å vise innhold fra sosiale medier og annonser som er mer relevante og engasjerende.",
    },
  ],
  onChange(consents) {
    console.log(consents);
  },
});
