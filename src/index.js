function CookieManager(options = {}) {
  let { onChange = () => {}, container = document.body } = options

  let value
  let elements
  let view = 'Default'
  let el = document.createElement('div')
  el.classList.add('cookie-manager')

  const Renderer = {
    getConfigView: options => `
  <div class="cookie-manager__modal">
    ${options.consents
      .map(
        c => `
      <label class="cookie-manager__consent">
        <span class="cookie-manager__consent-content">
          <span class="cookie-manager__consent-title">${c.title}</span>
          <span class="cookie-manager__consent-description">${c.description}</span>
        </span>
        
        <input type="checkbox" name="consent" value="${c.id}" ${
          (value && value.includes(c.id)) || (!value && (c.default || c.required)) ? 'checked' : ''
        } ${c.required ? 'disabled="disabled"' : ''} />
        
      </label>
    `,
      )
      .join('')}
      <div class="cookie-manager__actions">
      <button type="button" class="cookie-manager__accept">${options.labels.acceptAll}</button>
        <button type="button" class="cookie-manager__confirm cookie-manager__button-primary">${
          options.labels.confirm
        }</button>
      </div>
  </div>
`,
    getDefaultView: options => `
    <div class="cookie-manager__modal">
      <div class="cookie-manager__title">${options.title}</div>
      <div class="cookie-manager__description">${options.description}</div>
      
      <div class="cookie-manager__actions">
      <button type="button" class="cookie-manager__configure">${options.labels.configure}</button>
      <button type="button" class="cookie-manager__accept cookie-manager__button-primary">${options.labels.accept}</button>
      </div>
    </div>
`,
    getStyle: () => `
  .cookie-manager {
    background-color: rgba(0,0,0,0.8);

    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    padding: 2rem;
    z-index: 10000;

    display: flex;
    justify-content: center;
    align-items: flex-end;
  }

  .cookie-manager__modal {
    background-color: white;
    padding: 2rem;
    border-radius: var(--border-radius, 3px);
    max-width: 700px;
  }

  .cookie-manager__title,
  .cookie-manager__consent-title {
    font-weight: bold;
    font-size: 1.25rem;
    margin-bottom: 1rem;
    line-height: 1;
  }

  .cookie-manager__description {
    white-space: pre-line;
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
    white-space: pre-line;
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

  .cookie-manager__button-primary {
    background-color: var(--primary, #1d56d8);
    border-color: var(--primary, #1d56d8);
    color: var(--primary-contrast, white);
  }
`,
  }

  let style = document.createElement('style')
  style.innerHTML = Renderer.getStyle(options)

  document.head.appendChild(style)

  let save = consents => {
    window.localStorage.setItem(`cookie-manager`, consents)
    value = consents
  }
  let load = () => {
    let raw = window.localStorage.getItem('cookie-manager')
    if (!raw) return
    value = raw.split(',')
  }
  let hide = () => container.removeChild(el)
  let render = () => {
    el.innerHTML = Renderer[`get${view}View`](options)
    if (!container.contains(el)) container.appendChild(el)
  }
  let init = () => {
    load()
    el.addEventListener('click', handlers.submit)
    if (!value) {
      render()
    } else onChange(value)
  }
  let destroy = () => {
    el.removeEventListener('click', handlers.submit)
    hide()
  }

  let handlers = {
    submit: e => {
      if (!e.target.className) return
      e.preventDefault()

      let inputs = Array.from(el.querySelectorAll('input'))
      let consents

      if (e.target.className.includes('configure')) {
        view = 'Config'
        return render()
      }

      if (e.target.className.includes('accept')) {
        consents = options.consents.map(c => c.id)
      }

      if (e.target.className.includes('confirm')) {
        consents = inputs.filter(e => e.checked).map(e => e.value)
      }
      if (!consents) return

      onChange(consent)
      save(consents)
      hide()
    },
  }

  init()

  return {
    show: () => {
      view = 'Default'
      render()
    },
    hide,
    destroy,
  }
}

export default CookieManager
