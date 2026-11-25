/*
 * Banner de consentimiento de cookies de magicdays.dongfeng-auto.es.
 * Provisional mientras Rigor CG emite el token de este subdominio: mismo aspecto, textos,
 * categorías y comportamiento que el CMP de Rigor que llevan dongfeng-auto.es y BOX
 * (cookie «rgcOptin», Consent Mode v2 y carga de GTM-P5RVP4GS), pero servido desde la propia landing.
 * Cuando llegue el token: quitar <link cmp.css> + <script cmp.js> y poner
 *   <script src="https://cookies.rigorcg.pt/script/?token=TOKEN"></script>
 * (la cookie tiene el mismo nombre y formato, así que el consentimiento ya dado se respeta).
 */
(function () {
  'use strict';
  var CFG = {"lang":"es","branding":{"main-color":"#252728","secondary-color":"#21485c","text-color":"#000000","secondary-text-color":"#79747e"},"gtmId":"GTM-P5RVP4GS","labels":{"bottomSheetTitle":"Definir cómo conducir a su privacidad","bottomSheetDescription":"<p>Las cookies se utilizan para brindarle una mejor experiencia en nuestro sitio web, brindar servicios y herramientas de terceros, ayudarnos a comprender mejor su uso, mejorar su funcionalidad y brindar publicidad más dirigida.</p>\n<p>Le recomendamos que active todas las cookies, pero si no está de acuerdo, simplemente puede editarlas utilizando la opción de edición disponible.</p>\n","bottomSheetCtaEditSettings":"Editar la configuración de cookies","bottomSheetCtaAccept":"Acepta todo","bottomSheetCtaReject":"Rechazar todo","cookiesSettingsTitle":"Defina cómo gestionar su Privacidad","cookiesSettingsDescription":"<p>Cuando visita un sitio web, este puede almacenar o recopilar información en su navegador, principalmente en forma de cookies. Esta información puede ser sobre usted, sus preferencias o su dispositivo y se utiliza principalmente para que el sitio web funcione como se espera. Por lo general, la información no lo identifica directamente, pero puede brindarle una experiencia web más personalizada.</p>\n<p>Como respetamos su derecho a la privacidad, puede optar por no permitir algunos tipos de cookies. Haga clic en los encabezados de las diferentes categorías para obtener más información y cambiar nuestra configuración predeterminada. Sin embargo, bloquear algunos tipos de cookies puede afectar su experiencia en el sitio web y los servicios que podemos ofrecer.</p>\n","cookiesSettingsCtaMoreInfo":"Más información","cookiesSettingsFormTitle":"Administrar preferencias de cookies","cookiesSettingsAlwaysActive":"Siempre activo","cookiesSettingsCtaAccept":"Acepta todo","cookiesSettingsSavePreferences":"Guardar preferencias","cookiesSettingsCtaReject":"Rechazar todo","cookiesListTitle":"Lista de cookies","cookiesListDescription":"<p>Una cookie es un pequeño fragmento de datos (archivo de texto) que un sitio web, cuando es visitado por un usuario, solicita a su navegador que almacene en su dispositivo para recordar información sobre usted, como su preferencia de idioma o información de inicio de sesión. Estas cookies las configuramos nosotros y se denominan cookies de origen. También utilizamos cookies de terceros, que son cookies de un dominio distinto al dominio del sitio web que está visitando, para nuestros esfuerzos de publicidad y marketing. Más específicamente, utilizamos cookies y otras tecnologías de seguimiento para los siguientes fines:</p>\n","cookiesListCtaReturn":null,"notificationsSavedPreferences":"Preferencias de cookies guardadas."},"types":[{"name":"Cookies estrictamente necesarias","slug":"rgcEssential","description":"Estas cookies son necesarias para el funcionamiento del sitio web y no pueden desactivarse en nuestros sistemas. Normalmente sólo se instalan en respuesta a acciones realizadas por usted que corresponden a una solicitud de servicios, como configurar sus preferencias de privacidad, iniciar sesión o rellenar formularios. Puede configurar su navegador para que bloquee o le avise de estas cookies, pero algunas partes del sitio web no funcionarán. Estas cookies no almacenan información personal identificable.","required":true},{"name":"Cookies de rendimiento","slug":"rgcPerformance","description":"Estas cookies nos permiten contar las visitas y las fuentes de tráfico para que podamos medir y mejorar el rendimiento de nuestro sitio web. Nos ayudan a saber qué páginas son las más y las menos populares y a ver cómo se mueven los visitantes por el sitio web. Toda la información recogida por estas cookies es agregada y, por tanto, anonimizada. Si no permite estas cookies, no sabremos cuándo ha visitado nuestro sitio.","required":false},{"name":"Cookies publicitarias","slug":"rgcTargeting","description":"Estas cookies pueden ser instaladas a través de nuestro sitio web por nuestros socios publicitarios. Estas empresas pueden utilizarlas para elaborar un perfil de sus intereses y mostrarle anuncios relevantes en otros sitios web. No almacenan directamente información personal, sino que se basan en la identificación exclusiva de su navegador y dispositivo de Internet. Si no permite el uso de estas cookies, recibirá menos publicidad personalizada.","required":false},{"name":"Cookies funcionales","slug":"rgcFunctional","description":"Estas cookies permiten mejorar la funcionalidad y la personalización del sitio. Podemos instalarlas nosotros o proveedores externos cuyos servicios hemos añadido a nuestras páginas. Si no permite estas cookies, es posible que algunas o todas estas funciones no funcionen correctamente.","required":false}]};
  var BASE = (document.currentScript && document.currentScript.src || '').replace(/[^\/]*$/, '');
  var IMG = function (n) { return BASE + n + '.svg'; };
  var COOKIE = 'rgcOptin', DAYS = 30;
  var L = CFG.labels, TYPES = CFG.types;
  var REQUIRED = TYPES.filter(function (t) { return t.required; }).map(function (t) { return t.slug; });
  var wrapper, sheet, settings, notes;

  function getCookie(n) {
    var m = document.cookie.match(new RegExp('(?:^|;\\s*)' + n + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : undefined;
  }
  function setCookie(n, v) {
    var d = new Date(); d.setTime(d.getTime() + DAYS * 864e5);
    document.cookie = n + '=' + v + ';path=/;expires=' + d.toUTCString() + ';SameSite=Lax' + (location.protocol === 'https:' ? ';Secure' : '');
  }
  function current() { var c = getCookie(COOKIE); return c ? c.split(',') : []; }
  window.dataLayer = window.dataLayer || [];
  function gtag() { window.dataLayer.push(arguments); }
  // Mismo mapa de categorías → señales que el CMP de Rigor (para que el contenedor GTM se comporte igual).
  function consentState(c) {
    return {
      ad_storage: c.indexOf('rgcFunctional') > -1 ? 'granted' : 'denied',
      ad_user_data: c.indexOf('rgcPerformance') > -1 ? 'granted' : 'denied',
      ad_personalization: c.indexOf('rgcTargeting') > -1 ? 'granted' : 'denied',
      analytics_storage: c.indexOf('rgcFunctional') > -1 ? 'granted' : 'denied'
    };
  }

  // Reactiva los <script type="text/plain" data-type="rgc..."> de las categorías aceptadas.
  function activateScripts() {
    var c = current();
    document.querySelectorAll('script[data-type]').forEach(function (s) {
      if (c.indexOf(s.dataset.type) < 0 || s.type !== 'text/plain') return;
      var n = document.createElement('script');
      for (var i = 0; i < s.attributes.length; i++) { var a = s.attributes[i]; if (a.name !== 'type') n.setAttribute(a.name, a.value); }
      n.type = 'text/javascript';
      if (!s.src) n.text = s.text;
      s.parentNode.insertBefore(n, s); s.remove();
    });
  }

  function closeModals() { [sheet, settings].forEach(function (m) { m && m.classList.remove('is-open'); }); }
  function notify(msg) {
    var n = document.createElement('div');
    n.className = 'rgc-notification';
    n.innerHTML = '<img src="' + IMG('check_circle') + '" class="rgc-notification__icon" alt="" />' +
      '<div class="rgc-notification__message">' + msg + '</div>' +
      '<button class="rgc-notification__closer" type="button" aria-label="Cerrar"><img src="' + IMG('close') + '" alt="" /></button>';
    notes.appendChild(n);
    n.querySelector('button').addEventListener('click', function () { n.remove(); });
    setTimeout(function () { n.remove(); }, 5000);
  }
  function save(types) {
    setCookie(COOKIE, types.join(','));
    closeModals();
    gtag('consent', 'update', consentState(types));
    window.dataLayer.push({ event: 'cookie_consent_update', cookie_consent: types.join(',') });
    notify(L.notificationsSavedPreferences);
    activateScripts();
    syncCheckboxes();
  }
  function acceptAll() { save(TYPES.map(function (t) { return t.slug; })); }
  function rejectAll() { save(REQUIRED.slice()); }
  function acceptSelected() {
    var sel = REQUIRED.slice();
    settings.querySelectorAll('.rgc-cookies-settings__checkbox input:checked').forEach(function (i) { sel.push(i.value); });
    save(sel);
  }
  function syncCheckboxes() {
    var c = current();
    settings.querySelectorAll('.rgc-cookies-settings__checkbox input').forEach(function (i) { i.checked = !c.length || c.indexOf(i.value) > -1; });
    updateAcceptButton();
  }
  function updateAcceptButton() {
    var inputs = settings.querySelectorAll('.rgc-cookies-settings__checkbox input');
    var all = Array.prototype.every.call(inputs, function (i) { return i.checked; });
    settings.querySelector('.js-rgc-accept-selected').textContent = all ? L.cookiesSettingsCtaAccept : L.cookiesSettingsSavePreferences;
  }
  function openSettings(e) { if (e) e.preventDefault(); closeModals(); syncCheckboxes(); settings.classList.add('is-open'); }

  function build() {
    var c = current();
    wrapper = document.createElement('div');
    wrapper.className = 'rigor-cookies';
    var root = ':root{' + Object.keys(CFG.branding).map(function (k) { return '--rgc-' + k + ':' + CFG.branding[k]; }).join(';') + '}';
    var st = document.createElement('style'); st.textContent = root; document.head.appendChild(st);

    sheet = document.createElement('div');
    sheet.className = 'rgc-bottom-sheet';
    sheet.setAttribute('role', 'dialog'); sheet.setAttribute('aria-label', L.bottomSheetTitle);
    sheet.innerHTML =
      '<div class="rgc-bottom-sheet__inner"><div class="rgc-container">' +
        '<div class="rgc-bottom-sheet__body">' +
          '<div class="rgc-bottom-sheet__header">' +
            '<img src="' + IMG('markers') + '" class="rgc-bottom-sheet__icon" alt="" />' +
            '<div class="rgc-bottom-sheet__title">' + L.bottomSheetTitle + '</div>' +
          '</div>' +
          '<div class="rgc-bottom-sheet__text">' + L.bottomSheetDescription +
            '<p><button type="button" class="rgc-bottom-sheet__button js-rgc-open-cookies-settings">' + L.bottomSheetCtaEditSettings + '</button></p>' +
          '</div>' +
        '</div>' +
        '<div class="rgc-bottom-sheet__footer">' +
          '<button type="button" class="rgc-button js-rgc-reject-all">' + L.bottomSheetCtaReject + '</button>' +
          '<button type="button" class="rgc-button js-rgc-accept-all">' + L.bottomSheetCtaAccept + '</button>' +
        '</div>' +
      '</div></div>';

    settings = document.createElement('div');
    settings.className = 'rgc-cookies-settings';
    settings.setAttribute('role', 'dialog'); settings.setAttribute('aria-label', L.cookiesSettingsTitle);
    settings.innerHTML =
      '<div class="rgc-cookies-settings__inner">' +
        '<div class="rgc-cookies-settings__header">' +
          '<img src="' + IMG('markers') + '" class="rgc-cookies-settings__icon" alt="" />' +
          '<div class="rgc-cookies-settings__title">' + L.cookiesSettingsTitle + '</div>' +
        '</div>' +
        '<div class="rgc-cookies-settings__body">' + L.cookiesSettingsDescription + '</div>' +
        '<div class="rgc-cookies-settings__form">' +
          '<div class="rgc-cookies-settings__form-title">' + L.cookiesSettingsFormTitle + '</div>' +
          '<div class="rgc-cookies-settings__fields">' +
          TYPES.map(function (t) {
            return '<div class="rgc-cookies-settings__field">' +
              '<div class="rgc-cookies-settings__field-title js-rgc-toggle-field">' +
                '<img src="' + IMG('plus') + '" class="rgc-cookies-settings__field-icon rgc-cookies-settings__field-icon--open" alt="" />' +
                '<img src="' + IMG('minus') + '" class="rgc-cookies-settings__field-icon rgc-cookies-settings__field-icon--close" alt="" />' +
                '<span>' + t.name + '</span>' +
                (t.required
                  ? '<div class="rgc-cookies-settings__pre-selected">' + L.cookiesSettingsAlwaysActive + '</div>'
                  : '<label class="rgc-cookies-settings__checkbox"><input type="checkbox" value="' + t.slug + '" class="js-rgc-update-accept-button" aria-label="' + t.name + '"' + (!c.length || c.indexOf(t.slug) > -1 ? ' checked' : '') + ' /><span></span></label>') +
              '</div>' +
              '<div class="rgc-cookies-settings__description">' + t.description + '</div>' +
            '</div>';
          }).join('') +
          '</div>' +
        '</div>' +
        '<div class="rgc-cookies-settings__footer">' +
          '<button type="button" class="rgc-button rgc-button--secondary js-rgc-reject-all">' + L.cookiesSettingsCtaReject + '</button>' +
          '<button type="button" class="rgc-button js-rgc-accept-selected">' + (c.length ? L.cookiesSettingsSavePreferences : L.cookiesSettingsCtaAccept) + '</button>' +
        '</div>' +
      '</div>';

    notes = document.createElement('div');
    notes.className = 'rgc-notifications';
    wrapper.appendChild(sheet); wrapper.appendChild(settings); wrapper.appendChild(notes);
    document.body.appendChild(wrapper);

    settings.querySelectorAll('.js-rgc-toggle-field').forEach(function (el) {
      el.addEventListener('click', function (e) { if (e.target.closest('label')) return; el.parentElement.classList.toggle('is-open'); });
    });
    settings.querySelectorAll('.js-rgc-update-accept-button').forEach(function (el) { el.addEventListener('change', updateAcceptButton); });
    // Delegado: vale también para el enlace «Cookies» del pie (class="js-rgc-open-cookies-settings").
    document.addEventListener('click', function (e) {
      var t = e.target.closest && e.target.closest('.js-rgc-open-cookies-settings, .js-rgc-accept-all, .js-rgc-reject-all, .js-rgc-accept-selected');
      if (!t) return;
      if (t.classList.contains('js-rgc-open-cookies-settings')) openSettings(e);
      else if (t.classList.contains('js-rgc-accept-all')) acceptAll();
      else if (t.classList.contains('js-rgc-reject-all')) rejectAll();
      else acceptSelected();
    });

    if (c.length) activateScripts(); else sheet.classList.add('is-open');
  }

  // Consent Mode por defecto + GTM, antes de pintar nada (igual que el CMP de Rigor).
  var initial = current();
  if (getCookie(COOKIE) === undefined) setCookie(COOKIE, '');
  gtag('consent', 'default', consentState(initial));
  (function (w, d, s, l, i) {
    w[l] = w[l] || []; w[l].push({ 'gtm.start': new Date().getTime(), event: 'gtm.js' });
    var f = d.getElementsByTagName(s)[0], j = d.createElement(s); j.async = true;
    j.src = 'https://www.googletagmanager.com/gtm.js?id=' + i; f.parentNode.insertBefore(j, f);
  })(window, document, 'script', 'dataLayer', CFG.gtmId);

  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', build); else build();
})();
