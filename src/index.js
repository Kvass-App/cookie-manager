function CookieManager(options = {}) {
  const defaultKey = 'cookie-manager'

  let {
    onChange = () => {},
    container = document.body,
    storage = {
      get: () => {
        let qs = new URLSearchParams(location.search)
        let raw = qs.get(defaultKey) || window.localStorage.getItem(defaultKey)
        if (!raw) return null
        return raw.split(',')
      },
      set: consents => {
        window.localStorage.setItem(defaultKey, consents)
      },
    },
  } = options

  let value = []
  let view = 'Default'
  let el = document.createElement('div')
  el.classList.add('cookie-manager')

  function hasChanges() {
    return value.filter(i => i !== (options.consents.find(c => c.required) || {}).id).length
  }
  const Renderer = {
    getDefaultView: options => `
    <div class="cookie-manager__modal">
      <h3 class="cookie-manager__title">${options.title}</h3>
      <p class="cookie-manager__description">${options.description}</p>
    
      ${options.consents
        .map(
          c => `
        <label class="cookie-manager__consent">

          <input type="checkbox" name="consent" value="${c.id}" ${
            value && value.includes(c.id) ? 'checked' : ''
          } ${
            c.required ? 'disabled="disabled"' : ''
          } aria-describedby="cookie-manager-describedby-${c.id}" />
          <span class="cookie-manager__consent-content">
            <span class="cookie-manager__consent-title">${c.title}</span>
            <span class="cookie-manager__consent-description">${c.description}</span>
          </span>
        </label>
      `,
        )
        .join('')}
        <div class="cookie-manager__actions">
        <button type="button" class="cookie-manager__decline">${options.labels.decline}</button>
           ${
             hasChanges()
               ? `<button type="button" class="cookie-manager__confirm">${options.labels.confirm}</button>`
               : `<button type="button" class="cookie-manager__accept">${options.labels.acceptAll}</button>`
           }
        </div>
    </div>
`,
    getStyle: () => `
  .cookie-manager {
    --_cookie-manager-spacing: var(--cookie-manager-spacing, 1.5rem);
    --_cookie-manager-gap: var(--cookie-manager-gap, calc(var(--_cookie-manager-spacing) / 2));
    --_cookie-manager-border-radius: var(--cookie-manager-border-radius, 3px);
    --_cookie-manager-active-color: var(--cookie-manager-active-color, #000);
    
    background-color: rgba(0,0,0,0.8);
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: var(--_cookie-manager-spacing);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    accent-color: var(--_cookie-manager-active-color);
  }

  .cookie-manager__modal {
    background-color: white;
    padding: var(--_cookie-manager-spacing);
    border-radius: var(--_cookie-manager-border-radius);
    max-width: 700px;
    max-height: calc(100dvh - (var(--_cookie-manager-spacing) * 2));
    overflow-y: auto;

    display: flex;
    flex-direction: column;
    gap: var(--_cookie-manager-gap);
  }

  .cookie-manager__title {
    font-size: 1.25em;
  }

  .cookie-manager__title,
  .cookie-manager__consent-title {
    line-height: 1;
    margin: 0;
  }

  .cookie-manager__description {
    white-space: pre-line;
    font-size: 0.8em;
    margin: 0;
  }

  .cookie-manager__consent {
    border: 1px solid #d8d8d8;
    border-radius: var(--_cookie-manager-border-radius);
    padding: calc(var(--_cookie-manager-spacing) / 2);
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: baseline;
    gap: var(--_cookie-manager-gap);

    font-weight: normal;
    cursor: pointer;

    font-size: .8em;
  }

  .cookie-manager__consent span {
    // display: block;
  }

  .cookie-manager__consent input {
    transform: scale(1.2);
    margin: 0;
    position: relative;
    top: 2px;
  }

  .cookie-manager__consent-title {
    font-weight: bold;
  }
  
  .cookie-manager__consent-description:before {
   content: " - ";
  }

  .cookie-manager__consent-description:empty {
    display: none;
  }
  
  .cookie-manager__actions {
    display: flex;
    justify-content: center;
    flex-wrap: wrap;
    gap: var(--_cookie-manager-gap);
    margin-top: var(--_cookie-manager-gap);
  }
  
  .cookie-manager__actions button {
    padding: .5rem 1.5rem;
    border: 1px solid #d8d8d8;
    border-radius: var(--_cookie-manager-border-radius);
    cursor: pointer;
    color: inherit;
  }

  @media (max-width: 500px) {
    .cookie-manager {
      font-size: .8em;
    }
    .cookie-manager__actions {
      flex-direction: column;
    }
  }
`,
  }

  let style = document.createElement('style')
  style.innerHTML = Renderer.getStyle(options)

  document.head.appendChild(style)

  let save = consents => {
    storage.set(consents)
    value = consents
  }
  let load = () => {
    let result = storage.get()
    if (!result) return
    value = result
  }
  let updateOptions = newOptions => {
    options = newOptions
  }
  let hide = () => container.removeChild(el)
  let render = () => {
    if (!value.length) {
      value = options.consents.filter(i => i.required || i.default).map(i => i.id)
    }
    el.innerHTML = Renderer[`get${view}View`](options)

    if (!container.contains(el)) container.appendChild(el)
  }
  let init = () => {
    load()
    el.addEventListener('click', handlers.submit)
    el.addEventListener('click', handlers.update)
    if (!value.length) render()
    else onChange(value)
  }
  let destroy = () => {
    el.removeEventListener('click', handlers.submit)
    el.removeEventListener('click', handlers.update)
    hide()
  }

  let handlers = {
    update: e => {
      if (e.target.name !== 'consent') return
      if (e.target.checked) {
        value.push(e.target.value)
      } else if (value.includes(e.target.value)) {
        const index = value.indexOf(e.target.value)
        value.splice(index, 1)
      }
      render()
    },
    submit: e => {
      if (!['confirm', 'accept', 'decline'].some(i => e.target.className.includes(i))) return

      let consents = []

      if (e.target.className.includes('accept')) consents.push(...options.consents.map(c => c.id))
      if (e.target.className.includes('confirm')) {
        consents.push(...value)
      }
      if (e.target.className.includes('decline')) {
        //make sure to always include required
        consents = value.filter(i => i === (options.consents.find(c => c.required) || {}).id)
      }
      onChange(consents)
      save(consents)
      hide()
    },
  }

  init()
  return {
    updateOptions,
    show: () => {
      view = 'Default'
      render()
    },
    hide,
    destroy,
    getConsents: () => {
      load()
      return value
    },
  }
}

export default CookieManager
