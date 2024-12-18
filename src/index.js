function CookieManager(options = {}) {
  let { onChange = () => { }, container = document.body } = options

  let value = []
  let view = 'Default'
  let el = document.createElement('div')
  el.classList.add('cookie-manager')

  function hasChanges() {
    return value.filter(
      (i) => i !== (options.consents.find((c) => c.required) || {}).id
    ).length
  }
  const Renderer = {
    getDefaultView: (options) => `
    <div class="cookie-manager__modal">
      <h3 class="cookie-manager__title">${options.title}</h3>
      <p class="cookie-manager__description">${options.description}</p>
    
      ${options.consents
        .map(
          (c) => `
        <label class="cookie-manager__consent">

          <input type="checkbox" name="consent" value="${c.id}" ${value && value.includes(c.id) ? 'checked' : ''
            } ${c.required ? 'disabled="disabled"' : ''} aria-describedby="cookie-manager-describedby-${c.id
            }" />
          <span class="cookie-manager__consent-content">
            <span class="cookie-manager__consent-title">${c.title}</span>
          </span>
        </label>
      `
        )
        .join('')}
        <div class="cookie-manager__actions">
        <button type="button" class="cookie-manager__decline">${options.labels.declineAll}</button>
           ${hasChanges()
        ? `<button type="button" class="cookie-manager__confirm cookie-manager__button-primary">${options.labels.confirm
        }</button>`
        : `<button type="button" class="cookie-manager__accept cookie-manager__button-primary">${options.labels.acceptAll
        }</button>`
      }
        </div>
    </div>
`,
    getStyle: () => `
  .cookie-manager {
    --cookie-manager-spacing: 2rem;
    background-color: rgba(0,0,0,0.8);
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: var(--cookie-manager-spacing);
    z-index: 10000;
    display: flex;
    justify-content: center;
    align-items: flex-end;
    accent-color: var(--primary);
  }

  .cookie-manager__modal {
    background-color: white;
    padding: var(--cookie-manager-spacing);
    border-radius: var(--border-radius, 3px);
    max-width: 500px;
    max-height: 100dvh;
    overflow-y: auto;
  }


  .cookie-manager__title,
  .cookie-manager__consent-title {
    line-height: 1;
  }

  .cookie-manager__description {
    white-space: pre-line;
    font-size: 0.8em;
  }

  .cookie-manager__consent {
    border: 1px solid var(--border-color, #eaeaea);
    border-radius: var(--border-radius, 3px);
    padding: 1rem;
    display: grid;
    grid-template-columns: auto 1fr;
    align-items: baseline;
    gap: 1rem;

    font-weight: normal;
    cursor: pointer;
  }

  .cookie-manager__consent:not(:first-child) {
    margin-top: 1rem;
  }

  .cookie-manager__consent:has(input:checked) {
    border-color: var(--primary);
  }

  .cookie-manager__consent span {
    display: block;
  }

  .cookie-manager__consent input {
    transform: scale(1.2);
  }

  .cookie-manager__consent-title {
    font-size: 0.9rem;
  }
  
  .cookie-manager__actions {
    display: flex;
    justify-content: end;
    gap: 1rem;
    flex-wrap: wrap;
    padding-top: var(--cookie-manager-spacing);
  }
  
  .cookie-manager__actions button {
    padding: .5rem 1.5rem;
    border: 1px solid #d8d8d8;
    border-radius: var(--border-radius, 3px);
    cursor: pointer;
    color: inherit;
  }

  .cookie-manager__button-primary {
    background-color: var(--primary, #1d56d8);
    border-color: var(--primary, #1d56d8);
    color: var(--primary-contrast, white) !important;
  }


  

  @media (max-width: 900px) {
    .cookie-manager {
      --cookie-manager-spacing: 1.5rem;
      padding: 0;
    }
  }

  @media (max-width: 500px) {
    .cookie-manager__actions {
      flex-direction: column;
    }
  }
`,
  }

  let style = document.createElement('style')
  style.innerHTML = Renderer.getStyle(options)

  document.head.appendChild(style)

  let save = (consents) => {
    window.localStorage.setItem(`cookie-manager`, consents)
    value = consents
  }
  let load = () => {
    let qs = new URLSearchParams(location.search)
    let raw =
      qs.get('cookie-manager') || window.localStorage.getItem('cookie-manager')
    if (!raw) return
    value = raw.split(',')
  }
  let updateOptions = (newOptions) => {
    options = newOptions
  }
  let hide = () => container.removeChild(el)
  let render = () => {
    if (!value.length) {
      value = options.consents
        .filter((i) => i.required || i.default)
        .map((i) => i.id)
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
    update: (e) => {
      if (e.target.name !== 'consent') return
      if (e.target.checked) {
        value.push(e.target.value)
      } else if (value.includes(e.target.value)) {
        const index = value.indexOf(e.target.value)
        value.splice(index, 1)
      }
      render()
    },
    submit: (e) => {
      if (
        !['confirm', 'accept', 'decline'].some((i) =>
          e.target.className.includes(i)
        )
      )
        return

      let consents = []

      if (e.target.className.includes('accept'))
        consents.push(...options.consents.map((c) => c.id))
      if (e.target.className.includes('confirm')) consents = value
      if (e.target.className.includes('decline')) {
        //make sure to always include required
        consents = value.filter(
          (i) => i === (options.consents.find((c) => c.required) || {}).id
        )
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
