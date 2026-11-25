/* Formulario nativo de reserva de test drive · Magic Days Dongfeng.
   Replica el formulario del Apps Script del cliente sin iframe y habla con él por fetch.

   ENDPOINT
   · URL del web app (la misma /exec de siempre, con el adaptador pegado): reservas reales.
   · "demo": disponibilidad simulada, no se envía nada a ningún sitio y no se lanzan conversiones.
   Protocolo:
   · POST ENDPOINT, cuerpo text/plain con JSON { accion:"disponibilidad", concesionario:ID }
          → { ok, concesionario:{nombre,telefono}, dias:[{fecha,dow,dia,mes,larga,horas:[]}] }
   · POST ENDPOINT, cuerpo text/plain con JSON { accion:"reservar", datos:{…} } (sin preflight CORS)
          → { ok:true, reserva:{…} } | { ok:false, error, codigo?, campo?, disponibilidad? }
   · POST ENDPOINT, { accion:"llamada", datos:{nombre,telefono,email,concesionario,modelo,franja,…} }
          → { ok:true, solicitud:{id,nombre,concesionario,telefono,modelo,franja} } (Adaptador v2, 24-nov) */
var DFF_ENDPOINT = window.DFF_ENDPOINT || "demo";

(function () {
  'use strict';

  /* Configuración copiada del formulario del cliente (12-nov). Si cambian concesionarios o textos
     legales en su Apps Script, actualizar aquí. */
  var BOOT = {"concesionarios": [{"id": "DE00110012", "nombre": "Dongfeng A Coruña", "provincia": "A Coruña", "direccion": "Av. de las Jubias Casablanca , 15006 A Coruña", "telefono": ""}, {"id": "DE00110011", "nombre": "Dongfeng Alicante", "provincia": "Alicante", "direccion": "Av. de Orihuela 91 , 03007 Alicante", "telefono": ""}, {"id": "DE00090004", "nombre": "Dongfeng Almería", "provincia": "Almería", "direccion": "N-340a, 37, 04230 Huércal de Almería, Almería", "telefono": ""}, {"id": "DE00060002", "nombre": "Dongfeng Sabadell", "provincia": "Barcelona - Sabadell", "direccion": "Ctra. de Terrassa, 131, 08206 Sabadell, Barcelona", "telefono": ""}, {"id": "DE00200001", "nombre": "Dongfeng Manresa", "provincia": "Barcelona - Manresa", "direccion": "Pol. Ind. els Dolors, Carrer de Sallent, 45, 08243 Manresa, Barcelona", "telefono": ""}, {"id": "DE00180001", "nombre": "Dongfeng Girona", "provincia": "Girona", "direccion": "Joan Torro i Cabratosa, 30 AP, Acceso Girona Sur, 7, 7 Salida núm, 17005 Girona", "telefono": ""}, {"id": "DE07000012", "nombre": "Dongfeng Granada", "provincia": "Granada", "direccion": "CARRETERA DE CORDOBA Nº 26, KM 431", "telefono": ""}, {"id": "DE00780003", "nombre": "Dongfeng Las Palmas de Gran Canaria", "provincia": "Las Palmas de Gran Canaria", "direccion": "Diego Vega Sarmiento, 60, Las Palmas de Gran Canaria, 35014", "telefono": ""}, {"id": "DE00210001", "nombre": "Dongfeng Lleida", "provincia": "Lleida", "direccion": "LL-11, km 9,4,", "telefono": ""}, {"id": "DE00110002", "nombre": "Dongfeng Leganés", "provincia": "Madrid - Leganés", "direccion": "Av. Carlos Sainz, 27, 28914 Leganés,", "telefono": ""}, {"id": "DE00110007", "nombre": "Dongfeng Majadahonda", "provincia": "Madrid - Majadahonda", "direccion": "Calle Barco, 9, 28222 Majadahonda", "telefono": ""}, {"id": "DE00160001", "nombre": "Dongfeng Alcalá de Henares", "provincia": "Madrid - Alcalá de Henares", "direccion": "Vía Complutense, 117, 28805 ,Alcalá de Henares, Madrid", "telefono": ""}, {"id": "DE01050013", "nombre": "Dongfeng Málaga", "provincia": "Málaga", "direccion": "C/ de la Tierra 4 , 29004 Málaga", "telefono": ""}, {"id": "DE00840005", "nombre": "Dongfeng Mérida", "provincia": "Mérida - Badajoz", "direccion": "Av. Reina Sofia, 14, 06800 Mérida, Badajoz", "telefono": ""}, {"id": "DE00070002", "nombre": "Dongfeng Murcia", "provincia": "Murcia", "direccion": "Ronda de Levante 19 , 30008 Murcia", "telefono": ""}, {"id": "DE00110005", "nombre": "Dongfeng Oviedo", "provincia": "Oviedo", "direccion": "Ctra. Irún a Coruña 103 , 33010 Colloto", "telefono": ""}, {"id": "DE00150001", "nombre": "Dongfeng Pamplona", "provincia": "Pamplona", "direccion": "Polígono Talluntxe II, C. D, 53, 31110 Noáin (Navarra)", "telefono": ""}, {"id": "DE00090002", "nombre": "Dongfeng Santa Cruz de Tenerife", "provincia": "Tenerife", "direccion": "Calle las industrias ,12, SANTA CRUZ DE TENERIFE", "telefono": ""}, {"id": "DE00070001", "nombre": "Dongfeng Santander", "provincia": "Santander", "direccion": "Av. Parayas 13 , 39011 Santander", "telefono": ""}, {"id": "DE00110001", "nombre": "Dongfeng Sevilla", "provincia": "Sevilla", "direccion": "Av. Montes Sierra 21, 41007 Sevilla", "telefono": ""}, {"id": "DE00140001", "nombre": "Dongfeng Tarragona", "provincia": "Tarragona", "direccion": "C/Cambrils , s/n , 43204", "telefono": ""}, {"id": "DE06350009", "nombre": "Dongfeng Gandía", "provincia": "Valencia - Gandía", "direccion": "Avenida Villalonga 3 ,46720,Gandía", "telefono": ""}, {"id": "DE00090001", "nombre": "Dongfeng Valladolid", "provincia": "Valladolid", "direccion": "Av. de Gijón 194 , 47610 Zaratán (Valladolid)", "telefono": ""}, {"id": "DE01100014", "nombre": "Dongfeng Vizcaya", "provincia": "Vizcaya", "direccion": "Bilbao-Galdakao Errepidea, Km 6, 48960", "telefono": ""}, {"id": "DE00100004", "nombre": "Dongfeng Zaragoza", "provincia": "Zaragoza", "direccion": "Carretera del Aeropuerto 4 (Edif. San Lamberto), 50011 Zaragoza", "telefono": ""}], "modelos": [{"id": "BOX", "nombre": "Dongfeng BOX 100% eléctrico", "imagen": "https://stwfccmsprodwesteurope01.blob.core.windows.net/dongfenges-682314838578fb1e8576da0d-prod/boxxx-bbbbbbb_1760008522256.webp"}, {"id": "VIGO", "nombre": "Dongfeng VIGO 100% eléctrico", "imagen": "https://stwfccmsprodwesteurope01.blob.core.windows.net/dongfenges-682314838578fb1e8576da0d-prod/pestaaa-modelos-4.webp"}, {"id": "MAGE", "nombre": "Dongfeng MAGE híbrido enchufable", "imagen": "https://stwfccmsprodwesteurope01.blob.core.windows.net/dongfenges-682314838578fb1e8576da0d-prod/3-11.webp"}], "recordatorioHoras": 24, "privacidadUrl": "https://drive.google.com/drive/u/0/folders/136miUXOpf13DYom_xgbveNnOzWB6--mV", "responsable": "CAETANO AUTOMOTIVE ESPAÑA DISTRIBUCION, S.L. CIF B56691314", "retencionMeses": 12, "consentComercial": true, "preseleccion": {"concesionario": "", "modelo": "", "fijo": false}, "origen": "web-dongfeng"};
  var DEMO = DFF_ENDPOINT === "demo";
  /* Solo se reservan los días del evento (Magic Days, 9-12 dic). El script devuelve toda su ventana. */
  var FECHAS = window.DFF_FECHAS || { desde: '2026-12-09', hasta: '2026-12-12', texto: 'del 9 al 12 de diciembre' };
  var CATALOGOS = {
    BOX: "https://drive.google.com/file/d/1LBAVjf8rdbexKW_w5YBMAMd7D98_MEMb/view?usp=drive_link",
    VIGO: "https://drive.google.com/file/d/1TReOvErvGeiDp0ZO1QEOwSXHYolIKQSg/view?usp=drive_link",
    MAGE: "https://drive.google.com/file/d/1rmOYryWJOQYTWJkx-UHZ0y7fE1otEyj8/view?usp=drive_link"
  };

  var $ = function (id) { return document.getElementById('dff-' + id); };
  if (!$('form')) return;
  var el = {
    form: $('form'), ok: $('ok'), nombre: $('nombre'), telefono: $('telefono'), email: $('email'),
    conc: $('concesionario'), modelo: $('modelo'), privacidad: $('privacidad'), comercial: $('comercial'),
    web: $('web'), enviar: $('enviar'), resumen: $('resumen'), estado: $('estado'), cita: $('cita'),
    dias: $('dias'), horas: $('horas'), tituloDia: $('titulo-dia')
  };
  var state = { dias: [], fecha: '', hora: '', req: 0, enviando: false, t0: Date.now(), concNombre: '', modo: 'reserva' };
  window.dataLayer = window.dataLayer || [];

  /* ---------- Backend ---------- */
  function apiDisponibilidad(id) {
    if (DEMO) return demoDisponibilidad(id);
    return apiPost({ accion: 'disponibilidad', concesionario: id });
  }
  function apiReservar(datos) {
    if (DEMO) return demoReservar(datos);
    return apiPost({ accion: 'reservar', datos: datos });
  }
  function apiLlamada(datos) {
    if (DEMO) return demoLlamada(datos);
    return apiPost({ accion: 'llamada', datos: datos });
  }
  /* Todo va por POST (doPost del Adaptador.gs, que no toca el doGet del formulario de siempre).
     text/plain para no disparar la comprobación previa de CORS, y sin cookies: así no le afecta
     el fallo de Google con la sesión iniciada en el navegador. */
  function apiPost(cuerpo) {
    return fetch(DFF_ENDPOINT, {
      method: 'POST', redirect: 'follow', credentials: 'omit',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(cuerpo)
    }).then(function (r) { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); });
  }

  /* ---------- Modo demostración (sin red) ---------- */
  var DOW = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb'];
  var DOW_L = ['domingo', 'lunes', 'martes', 'miércoles', 'jueves', 'viernes', 'sábado'];
  function concPorId(id) { return BOOT.concesionarios.filter(function (c) { return c.id === id; })[0]; }
  function semilla(s) { var h = 7; for (var i = 0; i < s.length; i++) h = (h * 31 + s.charCodeAt(i)) % 9973; return h; }
  function demoDias(id) {
    var dias = [], h0 = semilla(id);
    [9, 10, 11, 12].forEach(function (n, i) {
      var d = new Date(2026, 11, n), horas = [];
      var fin = d.getDay() === 6 ? 14 : 20;
      for (var hh = 10; hh < fin; hh++) {
        ['00', '30'].forEach(function (mm, j) { if ((h0 + hh * 7 + j * 3 + i * 5) % 4 !== 0) horas.push(hh + ':' + mm); });
      }
      dias.push({ fecha: '2026-12-' + n, dow: DOW[d.getDay()], dia: String(n), mes: 'dic',
        larga: DOW_L[d.getDay()] + ', ' + n + ' de diciembre', horas: horas });
    });
    return dias;
  }
  function demoDisponibilidad(id) {
    var c = concPorId(id);
    return new Promise(function (ok) {
      setTimeout(function () {
        ok(c ? { ok: true, concesionario: { nombre: c.nombre, telefono: c.telefono }, dias: demoDias(id) }
             : { ok: false, error: 'Concesionario no válido.' });
      }, 450);
    });
  }
  function demoReservar(d) {
    var c = concPorId(d.concesionario) || {}, m = BOOT.modelos.filter(function (x) { return x.id === d.modelo; })[0] || {};
    var dia = demoDias(d.concesionario).filter(function (x) { return x.fecha === d.fecha; })[0] || {};
    var ini = d.fecha.replace(/-/g, '') + 'T' + ('0' + d.hora).slice(-5).replace(':', '') + '00';
    var hf = d.hora.split(':'), finMin = (+hf[0]) * 60 + (+hf[1]) + 30;
    var fin = d.fecha.replace(/-/g, '') + 'T' + ('0' + Math.floor(finMin / 60)).slice(-2) + ('0' + finMin % 60).slice(-2) + '00';
    var r = {
      id: 'DEMO-' + String(Date.now()).slice(-6), nombre: d.nombre.trim().split(/\s+/)[0], modelo: m.nombre || d.modelo,
      imagen: m.imagen || '', fechaLarga: dia.larga || d.fecha, hora: d.hora, duracion: 30,
      concesionario: c.nombre || '', direccion: c.direccion || '', telefono: c.telefono || '', email: d.email.trim(),
      catalogo: CATALOGOS[d.modelo] || '',
      agendaUrl: 'https://calendar.google.com/calendar/render?action=TEMPLATE&text=' + encodeURIComponent('Test drive ' + (m.nombre || '')) +
        '&dates=' + ini + '/' + fin + '&ctz=Europe/Madrid&location=' + encodeURIComponent((c.nombre || '') + ', ' + (c.direccion || '')),
      mapaUrl: 'https://www.google.com/maps/search/?api=1&query=' + encodeURIComponent((c.nombre || '') + ' ' + (c.direccion || ''))
    };
    return new Promise(function (ok) { setTimeout(function () { ok({ ok: true, reserva: r }); }, 700); });
  }

  var FRANJAS = { manana: 'Por la mañana', tarde: 'Por la tarde' };
  function demoLlamada(d) {
    var c = concPorId(d.concesionario) || {}, m = BOOT.modelos.filter(function (x) { return x.id === d.modelo; })[0] || {};
    return new Promise(function (ok) {
      setTimeout(function () {
        ok({ ok: true, solicitud: { id: 'DEMO-LL-' + String(Date.now()).slice(-6), nombre: d.nombre.trim().split(/\s+/)[0],
          concesionario: c.nombre || '', telefono: c.telefono || '', modelo: m.nombre || d.modelo, franja: FRANJAS[d.franja] || '' } });
      }, 600);
    });
  }

  /* ---------- Desplegables y textos legales ---------- */
  function opcion(valor, texto) { var o = document.createElement('option'); o.value = valor; o.textContent = texto; return o; }
  function pintarDesplegables() {
    var grupos = {};
    BOOT.concesionarios.forEach(function (c) { var p = c.provincia || 'Otros'; (grupos[p] = grupos[p] || []).push(c); });
    Object.keys(grupos).sort(function (a, b) { return a.localeCompare(b, 'es'); }).forEach(function (p) {
      var g = document.createElement('optgroup'); g.label = p; el.conc.appendChild(g);
      grupos[p].sort(function (a, b) { return a.nombre.localeCompare(b.nombre, 'es'); })
        .forEach(function (c) { g.appendChild(opcion(c.id, c.nombre)); });
    });
    BOOT.modelos.forEach(function (m) { el.modelo.appendChild(opcion(m.id, m.nombre)); });
  }
  function pintarLegal() {
    $('link-privacidad').href = BOOT.privacidadUrl;
    $('bloque-comercial').hidden = !BOOT.consentComercial;
    var llamada = state.modo === 'llamada';
    $('legal').textContent = 'Responsable: ' + BOOT.responsable + '. Finalidad: ' +
      (llamada ? 'atender tu solicitud y llamarte para informarte sobre la oferta. ' : 'gestionar tu prueba de conducción y contactarte sobre ella. ') +
      'Destinatario: el concesionario que elijas. Conservación: hasta ' + BOOT.retencionMeses + ' meses ' +
      (llamada ? 'desde tu solicitud. ' : 'después de la cita. ') +
      'Puedes ejercer tus derechos de acceso, rectificación, supresión, oposición, limitación y portabilidad como se indica en la política de privacidad.';
  }

  /* ---------- Disponibilidad ---------- */
  function mostrarEstado(texto, cargando, esError, conLlamada) {
    el.cita.hidden = true; el.estado.hidden = false;
    el.estado.className = 'dff-aviso' + (esError ? ' is-error' : '');
    el.estado.textContent = '';
    if (cargando) { var sp = document.createElement('span'); sp.className = 'dff-spinner'; el.estado.appendChild(sp); }
    el.estado.appendChild(document.createTextNode(texto));
    if (esError) {
      var b = document.createElement('button'); b.type = 'button'; b.textContent = 'Reintentar';
      b.onclick = cargarDisponibilidad; el.estado.appendChild(b);
    }
    if (conLlamada) {
      var ll = document.createElement('button'); ll.type = 'button'; ll.textContent = 'Prefiero que me llaméis';
      ll.onclick = function () { cambiarModo('llamada'); }; el.estado.appendChild(ll);
    }
  }
  function cargarDisponibilidad() {
    var id = el.conc.value;
    state.fecha = ''; state.hora = ''; actualizarResumen();
    if (!id) { mostrarEstado('Selecciona un concesionario para ver los huecos disponibles.'); return; }
    var req = ++state.req;
    mostrarEstado('Consultando disponibilidad…', true);
    apiDisponibilidad(id)
      .then(function (res) { if (req === state.req) pintarDisponibilidad(res); })
      .catch(function () { if (req === state.req) mostrarEstado('No hemos podido consultar la disponibilidad.', false, true); });
  }
  function pintarDisponibilidad(res) {
    if (!res || !res.ok) { mostrarEstado((res && res.error) || 'No hemos podido consultar la disponibilidad.', false, true); return; }
    state.dias = (res.dias || []).filter(function (d) { return d.fecha >= FECHAS.desde && d.fecha <= FECHAS.hasta; });
    state.concNombre = res.concesionario.nombre;
    if (!state.dias.length) {
      mostrarEstado('Ahora mismo no hay huecos libres en ' + res.concesionario.nombre + ' para los Magic Days (' + FECHAS.texto + '). ' +
        'Déjanos tus datos y te llamamos para buscarte una cita.', false, false, true);
      return;
    }
    el.estado.hidden = true; el.cita.hidden = false; el.dias.textContent = '';
    state.dias.forEach(function (d) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'dff-dia'; b.dataset.fecha = d.fecha;
      b.setAttribute('aria-pressed', 'false');
      b.setAttribute('aria-label', d.larga + ', ' + d.horas.length + ' horas libres');
      [['dow', d.dow], ['num', d.dia], ['mes', d.mes]].forEach(function (p) {
        var s = document.createElement('span'); s.className = p[0]; s.textContent = p[1]; b.appendChild(s);
      });
      b.onclick = function () { seleccionarDia(d.fecha); };
      el.dias.appendChild(b);
    });
    seleccionarDia(state.dias[0].fecha);
  }
  function seleccionarDia(fecha) {
    var dia = state.dias.filter(function (d) { return d.fecha === fecha; })[0];
    if (!dia) return;
    state.fecha = fecha; state.hora = '';
    Array.prototype.forEach.call(el.dias.children, function (b) { b.setAttribute('aria-pressed', String(b.dataset.fecha === fecha)); });
    el.tituloDia.textContent = dia.larga;
    el.horas.textContent = '';
    dia.horas.forEach(function (h) {
      var b = document.createElement('button');
      b.type = 'button'; b.className = 'dff-hora'; b.textContent = h; b.dataset.hora = h;
      b.setAttribute('aria-pressed', 'false');
      b.onclick = function () { seleccionarHora(h); };
      el.horas.appendChild(b);
    });
    actualizarResumen();
  }
  function seleccionarHora(h) {
    state.hora = h;
    Array.prototype.forEach.call(el.horas.children, function (b) { b.setAttribute('aria-pressed', String(b.dataset.hora === h)); });
    error('cita', '');
    actualizarResumen();
  }
  function actualizarResumen() {
    if (state.modo === 'llamada') { el.enviar.textContent = 'Quiero que me llaméis'; el.resumen.textContent = ''; return; }
    var dia = state.dias.filter(function (d) { return d.fecha === state.fecha; })[0];
    if (dia && state.hora) {
      el.enviar.textContent = 'Reservar el ' + dia.dow + ' ' + dia.dia + ' ' + dia.mes + ' a las ' + state.hora;
      el.resumen.textContent = state.concNombre;
    } else {
      el.enviar.textContent = 'Reservar test drive';
      el.resumen.textContent = '';
    }
  }

  /* ---------- Validación (mismas reglas y textos que el formulario del cliente) ---------- */
  function normalizarTelefono(t) {
    var s = String(t || '').trim().replace(/[\s\-.()\/]/g, '');
    if (s.indexOf('00') === 0) s = '+' + s.slice(2);
    if (/^\+34/.test(s)) s = s.slice(3);
    else if (s.charAt(0) === '+') return /^\+[1-9]\d{6,14}$/.test(s) ? s : null;
    if (/^34[6789]\d{8}$/.test(s)) s = s.slice(2);
    return /^[6789]\d{8}$/.test(s) ? '+34' + s : null;
  }
  var REGLAS = {
    nombre: function () {
      var v = el.nombre.value.trim().replace(/\s+/g, ' ');
      if (!v) return 'Indica tu nombre y apellidos.';
      if (!/^[\p{L}\p{M}][\p{L}\p{M}\s'’.\-]{1,79}$/u.test(v) || v.split(' ').length < 2) return 'Indica tu nombre y al menos un apellido.';
    },
    telefono: function () {
      if (!el.telefono.value.trim()) return 'Indica tu teléfono.';
      if (!normalizarTelefono(el.telefono.value)) return 'Usa un número español de 9 cifras o uno internacional con prefijo (+…).';
    },
    email: function () {
      var v = el.email.value.trim();
      if (!v) return 'Indica tu email.';
      if (v.indexOf('..') >= 0 || !/^[^\s@]+@[^\s@]+\.[A-Za-z]{2,}$/.test(v)) return 'Revisa el email, parece incorrecto.';
    },
    concesionario: function () { if (!el.conc.value) return 'Selecciona un concesionario.'; },
    modelo: function () { if (!el.modelo.value) return 'Selecciona un modelo.'; },
    cita: function () { if (state.modo === 'reserva' && (!state.fecha || !state.hora)) return 'Elige día y hora para tu prueba.'; },
    privacidad: function () { if (!el.privacidad.checked) return 'Debes aceptar la política de privacidad.'; }
  };
  var CAMPO_FOCO = { cita: 'dias' };
  function error(campo, msg) {
    var p = $('err-' + campo); if (p) p.textContent = msg || '';
    var input = $(campo);
    if (input && input.tagName !== 'DIV') input.setAttribute('aria-invalid', msg ? 'true' : 'false');
  }
  function validarTodo() {
    var primero = null;
    Object.keys(REGLAS).forEach(function (k) { var msg = REGLAS[k]() || ''; error(k, msg); if (msg && !primero) primero = k; });
    if (primero) { var f = $(CAMPO_FOCO[primero] || primero); if (f && f.focus) f.focus(); }
    return !primero;
  }
  ['nombre', 'telefono', 'email'].forEach(function (k) {
    el[k].addEventListener('blur', function () { if (el[k].value) error(k, REGLAS[k]() || ''); });
    el[k].addEventListener('input', function () { if ($('err-' + k).textContent) error(k, REGLAS[k]() || ''); });
  });
  el.conc.addEventListener('change', function () { error('concesionario', ''); if (state.modo === 'reserva') cargarDisponibilidad(); });
  el.modelo.addEventListener('change', function () { error('modelo', ''); });
  el.privacidad.addEventListener('change', function () { if (el.privacidad.checked) error('privacidad', ''); });

  /* ---------- Envío ---------- */
  el.form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (state.enviando) return;
    $('err-general').textContent = '';
    if (!validarTodo()) return;
    state.enviando = true; el.enviar.disabled = true;
    if (state.modo === 'llamada') { enviarLlamada(); return; }
    el.enviar.textContent = 'Reservando…';
    apiReservar({
      nombre: el.nombre.value, telefono: el.telefono.value, email: el.email.value,
      concesionario: el.conc.value, modelo: el.modelo.value, fecha: state.fecha, hora: state.hora,
      privacidad: el.privacidad.checked, comercial: el.comercial.checked,
      web: el.web.value,                 // honeypot: el backend descarta si viene relleno
      t: Date.now() - state.t0,          // tiempo en página: el backend descarta envíos instantáneos
      origen: BOOT.origen
    }).then(alResponder).catch(function () {
      alResponder({ ok: false, error: 'No hemos podido completar la reserva por un problema de conexión. Inténtalo de nuevo.' });
    });
  });
  function alResponder(res) {
    state.enviando = false; el.enviar.disabled = false;
    if (res && res.ok) { mostrarConfirmacion(res.reserva); return; }
    actualizarResumen();
    var msg = (res && res.error) || 'No se ha podido completar la reserva.';
    if (res && res.codigo === 'OCUPADO') {
      if (res.disponibilidad) pintarDisponibilidad(Object.assign({ ok: true }, res.disponibilidad)); else cargarDisponibilidad();
      error('cita', msg);
      el.cita.scrollIntoView({ block: 'center' });
    } else if (res && res.campo && $('err-' + res.campo)) {
      error(res.campo, msg);
      var f = $(CAMPO_FOCO[res.campo] || res.campo); if (f && f.focus) f.focus();
    } else {
      $('err-general').textContent = msg;
    }
  }
  function mostrarConfirmacion(r) {
    el.form.hidden = true; el.ok.hidden = false;
    var hero = $('ok-hero'), img = $('ok-img');
    hero.classList.toggle('sin-foto', !r.imagen);
    if (r.imagen) { img.alt = r.modelo; img.onerror = function () { hero.classList.add('sin-foto'); }; img.src = r.imagen; }
    $('ok-titulo').textContent = '¡Te esperamos, ' + r.nombre + '!';
    $('ok-modelo').textContent = r.modelo;
    var tarjetas = $('ok-tarjetas'); tarjetas.textContent = '';
    [
      { et: 'Fecha', val: r.fechaLarga, ancha: true },
      { et: 'Hora', val: r.hora + ' h', mini: 'Duración aprox. ' + r.duracion + ' min' },
      { et: 'Referencia', val: r.id },
      { et: 'Concesionario', val: r.concesionario, mini: [r.direccion, r.telefono].filter(Boolean).join(' · '), ancha: true }
    ].forEach(function (t) {
      var d = document.createElement('div'); d.className = 'dff-tarjeta' + (t.ancha ? ' ancha' : '');
      var a = document.createElement('div'); a.className = 'et'; a.textContent = t.et;
      var b = document.createElement('div'); b.className = 'val'; b.textContent = t.val;
      d.appendChild(a); d.appendChild(b);
      if (t.mini) { var c = document.createElement('div'); c.className = 'mini'; c.textContent = t.mini; d.appendChild(c); }
      tarjetas.appendChild(d);
    });
    $('ok-agenda').href = r.agendaUrl;
    var mapa = $('ok-mapa'); mapa.hidden = !r.mapaUrl; if (r.mapaUrl) mapa.href = r.mapaUrl;
    $('ok-catalogo').hidden = !r.catalogo;
    if (r.catalogo) {
      $('ok-catalogo-titulo').textContent = 'Catálogo del ' + r.modelo.replace(/\s+(100%|híbrido).*$/i, '');
      $('ok-catalogo-enlace').href = r.catalogo;
    }
    var notas = ['Trae tu carné de conducir en vigor.'];
    if (r.email) notas.push('Te hemos enviado la confirmación a ' + r.email + '.');
    if (BOOT.recordatorioHoras) notas.push('Te enviaremos un recordatorio ' + BOOT.recordatorioHoras + ' horas antes para que confirmes tu asistencia.');
    notas.push('¿Necesitas cambiar la cita? ' + (r.telefono ? 'Llama al ' + r.telefono + '.' : 'Llama al concesionario.'));
    var ul = $('ok-nota'); ul.textContent = '';
    notas.forEach(function (n) { var li = document.createElement('li'); li.textContent = n; ul.appendChild(li); });
    el.ok.focus();
    document.getElementById('reserva').scrollIntoView({ behavior: 'smooth', block: 'start' });

    // Conversión para GTM / GA4, sin datos personales. En modo demo no se lanza (el contenedor es el real).
    var evs = [
      { event: 'test_drive_reservado', concesionario: r.concesionario, modelo: r.modelo },
      { event: 'generate_lead', form_name: 'test_drive_magic_days', dealer: r.concesionario || '', model: r.modelo || '' }
    ];
    if (DEMO) { window.dffDemoEventos = evs; if (window.console) console.info('[demo] eventos no enviados a dataLayer:', evs); }
    else evs.forEach(function (ev) { window.dataLayer.push(ev); });
  }
  /* ---------- Modo «que me llamen» ---------- */
  function enviarLlamada() {
    el.enviar.textContent = 'Enviando…';
    apiLlamada({
      nombre: el.nombre.value, telefono: el.telefono.value, email: el.email.value,
      concesionario: el.conc.value, modelo: el.modelo.value, franja: $('franja').value,
      privacidad: el.privacidad.checked, comercial: el.comercial.checked,
      web: el.web.value, t: Date.now() - state.t0, origen: BOOT.origen + '-llamada'
    }).then(alResponderLlamada).catch(function () {
      alResponderLlamada({ ok: false, error: 'No hemos podido enviar tu solicitud por un problema de conexión. Inténtalo de nuevo.' });
    });
  }
  function alResponderLlamada(res) {
    state.enviando = false; el.enviar.disabled = false; actualizarResumen();
    if (!(res && res.ok)) {
      var msg = (res && res.error) || 'No se ha podido enviar tu solicitud.';
      if (res && res.campo && $('err-' + res.campo)) { error(res.campo, msg); var f = $(res.campo); if (f && f.focus) f.focus(); }
      else $('err-general').textContent = msg;
      return;
    }
    var s = res.solicitud, okLl = $('ok-llamada');
    el.form.hidden = true; okLl.hidden = false;
    $('ll-titulo').textContent = '¡Gracias, ' + s.nombre + '!';
    $('ll-texto').textContent = 'Te llamaremos ' + (s.franja ? s.franja.toLowerCase() + ' ' : '') +
      'desde ' + s.concesionario + ' para contarte la oferta Magic Days del ' + s.modelo.replace(/\s+(100%|híbrido).*$/i, '') + '.';
    var t = $('ll-tarjetas'); t.textContent = '';
    [{ et: 'Concesionario', val: s.concesionario, mini: s.telefono, ancha: true }, { et: 'Referencia', val: s.id, ancha: true }]
      .forEach(function (x) {
        var d = document.createElement('div'); d.className = 'dff-tarjeta' + (x.ancha ? ' ancha' : '');
        var a = document.createElement('div'); a.className = 'et'; a.textContent = x.et;
        var b = document.createElement('div'); b.className = 'val'; b.textContent = x.val;
        d.appendChild(a); d.appendChild(b);
        if (x.mini) { var c = document.createElement('div'); c.className = 'mini'; c.textContent = x.mini; d.appendChild(c); }
        t.appendChild(d);
      });
    okLl.focus();
    document.getElementById('reserva').scrollIntoView({ behavior: 'smooth', block: 'start' });
    var evs = [
      { event: 'solicitud_llamada', concesionario: s.concesionario, modelo: s.modelo },
      { event: 'generate_lead', form_name: 'llamada_magic_days', dealer: s.concesionario || '', model: s.modelo || '' }
    ];
    if (DEMO) { window.dffDemoEventos = evs; if (window.console) console.info('[demo] eventos no enviados a dataLayer:', evs); }
    else evs.forEach(function (ev) { window.dataLayer.push(ev); });
  }
  function cambiarModo(modo) {
    if (state.modo === modo) return;
    state.modo = modo;
    Array.prototype.forEach.call(document.querySelectorAll('.dff-modo-op'), function (b) {
      b.setAttribute('aria-pressed', String(b.dataset.modo === modo));
    });
    $('bloque-cita').hidden = modo === 'llamada';
    $('bloque-franja').hidden = modo !== 'llamada';
    error('cita', ''); $('err-general').textContent = '';
    pintarLegal();
    if (modo === 'reserva') cargarDisponibilidad(); else actualizarResumen();
  }
  Array.prototype.forEach.call(document.querySelectorAll('.dff-modo-op'), function (b) {
    b.addEventListener('click', function () { cambiarModo(b.dataset.modo); });
  });
  $('ll-volver').addEventListener('click', function () {
    el.form.reset(); state.t0 = Date.now();
    $('ok-llamada').hidden = true; el.form.hidden = false;
    actualizarResumen();
  });

  $('otra').addEventListener('click', function () {
    el.form.reset(); state.t0 = Date.now();
    el.ok.hidden = true; el.form.hidden = false;
    cargarDisponibilidad();
  });

  /* ---------- Preselección desde los CTA de la landing ---------- */
  var MODELO_ID = { 'BOX': 'BOX', 'VIGO': 'VIGO', 'MAGE PHEV': 'MAGE', 'MAGE': 'MAGE' };
  function norm(s) { return String(s || '').normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase().trim(); }
  window.DFF = {
    // modelo: "BOX" | "VIGO" | "MAGE PHEV"; provincia y direccion: las de la ficha de concesionario de la landing
    preseleccionar: function (o) {
      o = o || {};
      if (o.modelo && MODELO_ID[o.modelo]) { el.modelo.value = MODELO_ID[o.modelo]; error('modelo', ''); }
      if (o.provincia || o.direccion) {
        var p = norm(o.provincia), dir = norm(o.direccion).slice(0, 14);
        var c = BOOT.concesionarios.filter(function (x) { return dir && norm(x.direccion).slice(0, 14) === dir; })[0] ||
          BOOT.concesionarios.filter(function (x) { return p && norm(x.provincia) === p; })[0] ||
          BOOT.concesionarios.filter(function (x) { return p && norm(x.provincia).indexOf(p) === 0; })[0];
        if (c && el.conc.value !== c.id) { el.conc.value = c.id; error('concesionario', ''); if (state.modo === 'reserva') cargarDisponibilidad(); }
      }
    }
  };

  if (DEMO) $('demo').hidden = false;
  pintarLegal();
  pintarDesplegables();
  if (/[?&]modo=llamada\b/.test(location.search) || location.hash === '#llamada') cambiarModo('llamada');
})();
