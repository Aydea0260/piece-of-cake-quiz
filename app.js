/* Piece of Cake — Quiz de Arquetipos
 * Lógica de scoring exacta según quiz-v2-spec.md:
 *  - cada opción suma 2.0 al arquetipo primario y 0.75 al secundario (pesos en data.json)
 *  - preguntas ancla (P1,P4,P9,P12,P15,P19) multiplican x1.25
 *  - margen = (1ro - 2do) / 1ro; alta >= 20%, media 8-20%, mixto < 8%
 *  - si mixto: el desempate familiar SOLO decide entre los 2 primeros por
 *    puntaje crudo (nunca promueve un tercero); ambos se reportan como co-primarios
 */
(function () {
  'use strict';

  var FAMILIES = {
    heroe: 'ego', mago: 'ego', rebelde: 'ego',
    inocente: 'libertad', explorador: 'libertad', sabio: 'libertad',
    hombre_comun: 'social', amante: 'social', bufon: 'social',
    cuidador: 'orden', gobernante: 'orden', creador: 'orden'
  };
  var ANCHOR_MULT = 1.25;

  function computeScores(answers, data) {
    var scores = {};
    Object.keys(data.archetypes).forEach(function (a) { scores[a] = 0; });

    data.questions.forEach(function (q, qi) {
      var choice = answers[qi];
      if (choice == null || choice < 0 || choice > 3) return;
      var w = q.anchor ? ANCHOR_MULT : 1.0;
      var opt = q.weights[choice]; // [[primario, pts], [secundario, pts]]
      scores[opt[0][0]] += w * opt[0][1];
      scores[opt[1][0]] += w * opt[1][1];
    });

    var ranked = Object.keys(scores).map(function (id) {
      return { id: id, pts: scores[id] };
    }).sort(function (a, b) { return b.pts - a.pts; });

    var first = ranked[0];
    var second = ranked[1];
    var margin = first.pts > 0 ? (first.pts - second.pts) / first.pts : 0;

    var confidence, mixed = false;
    var primary = first.id, secondary = second.id, coPrimary = null;

    if (margin >= 0.20) {
      confidence = 'alta';
    } else if (margin >= 0.08) {
      confidence = 'media';
    } else {
      confidence = 'mixto';
      mixed = true;
      // Desempate familiar SOLO entre los 2 primeros del puntaje crudo.
      var famScore = function (id) {
        var fam = FAMILIES[id];
        return ranked
          .filter(function (r) { return FAMILIES[r.id] === fam; })
          .reduce(function (s, r) { return s + r.pts; }, 0);
      };
      var f1 = famScore(first.id), f2 = famScore(second.id);
      var winner = f2 > f1 ? second.id : first.id;
      coPrimary = [winner, winner === first.id ? second.id : first.id];
      primary = coPrimary[0];
      secondary = coPrimary[1];
    }

    return {
      scores: scores,
      ranked: ranked,
      margin: margin,
      confidence: confidence,
      mixed: mixed,
      primary: primary,
      secondary: secondary,
      coPrimary: coPrimary,
      top5: ranked.slice(0, 5).map(function (r) {
        return { id: r.id, pts: Math.round(r.pts * 100) / 100 };
      })
    };
  }

  // Exportable para pruebas en node: require('./app.js').computeScores(...)
  if (typeof module !== 'undefined' && module.exports) {
    module.exports = { computeScores: computeScores, FAMILIES: FAMILIES };
    return;
  }

  /* ---------------- i18n ---------------- */
  var STRINGS = {
    es: {
      badge: 'Piece of Cake · Brand DNA',
      welcomeTitle: 'Descubre el arquetipo de tu marca',
      welcomeSub: '20 preguntas, 5 minutos. Sin email para ver tu resultado: al terminar obtienes tu arquetipo primario, tu secundario y tu nivel de confianza.',
      start: 'Comenzar el test',
      fine: 'Basado en los 12 arquetipos de marca. Tu resultado aparece al terminar, sin registro previo.',
      qOf: function (n, t) { return 'Pregunta ' + n + ' de ' + t; },
      back: '← Atrás',
      resultBadge: 'Tu resultado',
      resultHeading: 'Este es el ADN de tu marca',
      confAlta: 'Confianza alta',
      confMedia: 'Confianza media',
      confMixto: 'Perfil mixto',
      mixedNote: 'Tienes dos arquetipos dominantes muy parejos: ninguno se impone con claridad. Te mostramos ambos como co-primarios, porque tu marca habla con las dos voces.',
      rolePrimary: 'Arquetipo primario',
      roleSecondary: 'Arquetipo secundario',
      roleCoPrimary: 'Co-primario',
      examplesLabel: 'Marcas con este arquetipo',
      btnPlaybook: 'Recibe tu Brand Voice Playbook gratis',
      btnRetake: 'Rehacer el test',
      shareLabel: 'Comparte tu resultado',
      copyLink: 'Copiar enlace',
      copied: 'Enlace copiado',
      leadBadge: 'Gratis',
      leadTitle: 'Tu Brand Voice Playbook gratis',
      leadSub: 'Déjanos tus datos y te enviamos el playbook completo de tu arquetipo: tono de voz, vocabulario, pilares de contenido y 3 taglines listos para usar.',
      lNombre: 'Nombre', lMarca: 'Marca', lEmail: 'Email',
      lWeb: 'Web o Instagram', lIdioma: 'Idioma', lReto: 'Mayor reto de tu marca',
      retos: ['Definir la voz de mi marca', 'Crear contenido que conecte', 'Diferenciarme de la competencia', 'Crecer en redes sociales', 'Convertir seguidores en clientes', 'Otro'],
      submit: 'Enviar y recibir mi playbook',
      errRequired: 'Cuéntanos tu nombre y un email válido para enviarte el playbook.',
      successTitle: '¡Listo!',
      successSub: 'Tu playbook va en camino. Revisa tu bandeja de entrada en los próximos minutos.',
      footer: 'Hecho con amor por Piece of Cake · Descubre el ADN de tu marca',
      shareText: function (n) { return 'Descubrí el arquetipo de mi marca: ' + n + '. Haz el test gratis de 5 minutos:'; },
      loadError: 'No pudimos cargar el test. Revisa tu conexión e intenta de nuevo.'
    },
    en: {
      badge: 'Piece of Cake · Brand DNA',
      welcomeTitle: "Discover your brand's archetype",
      welcomeSub: '20 questions, 5 minutes. No email required to see your result: at the end you get your primary archetype, your secondary, and your confidence level.',
      start: 'Start the quiz',
      fine: 'Based on the 12 brand archetypes. Your result appears when you finish, with no sign-up first.',
      qOf: function (n, t) { return 'Question ' + n + ' of ' + t; },
      back: '← Back',
      resultBadge: 'Your result',
      resultHeading: "This is your brand's DNA",
      confAlta: 'High confidence',
      confMedia: 'Medium confidence',
      confMixto: 'Mixed profile',
      mixedNote: 'You have two very close dominant archetypes: neither one clearly wins. We show both as co-primary, because your brand speaks with both voices.',
      rolePrimary: 'Primary archetype',
      roleSecondary: 'Secondary archetype',
      roleCoPrimary: 'Co-primary',
      examplesLabel: 'Brands with this archetype',
      btnPlaybook: 'Get your free Brand Voice Playbook',
      btnRetake: 'Retake the quiz',
      shareLabel: 'Share your result',
      copyLink: 'Copy link',
      copied: 'Link copied',
      leadBadge: 'Free',
      leadTitle: 'Your free Brand Voice Playbook',
      leadSub: "Leave your details and we'll send you the full playbook for your archetype: voice tone, vocabulary, content pillars, and 3 ready-to-use taglines.",
      lNombre: 'Name', lMarca: 'Brand', lEmail: 'Email',
      lWeb: 'Website or Instagram', lIdioma: 'Language', lReto: "Your brand's biggest challenge",
      retos: ['Defining my brand voice', 'Creating content that connects', 'Standing out from competitors', 'Growing on social media', 'Turning followers into customers', 'Other'],
      submit: 'Send and get my playbook',
      errRequired: 'Tell us your name and a valid email so we can send your playbook.',
      successTitle: 'Done!',
      successSub: 'Your playbook is on its way. Check your inbox in the next few minutes.',
      footer: 'Made with love by Piece of Cake · Discover your brand DNA',
      shareText: function (n) { return "I discovered my brand's archetype: " + n + '. Take the free 5-minute quiz:'; },
      loadError: 'We could not load the quiz. Check your connection and try again.'
    }
  };

  /* ---------------- estado ---------------- */
  var state = {
    lang: (navigator.language || 'en').toLowerCase().indexOf('es') === 0 ? 'es' : 'en',
    data: null,
    answers: [],
    step: 0,
    result: null,
    utm: ''
  };

  function t() { return STRINGS[state.lang]; }
  function $(id) { return document.getElementById(id); }

  function showScreen(id) {
    document.querySelectorAll('.screen').forEach(function (s) { s.classList.remove('active'); });
    $(id).classList.add('active');
    window.scrollTo(0, 0);
  }

  /* ---------------- bienvenida ---------------- */
  function applyLang() {
    var s = t();
    document.documentElement.lang = state.lang;
    $('welcome-badge').textContent = s.badge;
    $('welcome-title').textContent = s.welcomeTitle;
    $('welcome-sub').textContent = s.welcomeSub;
    $('btn-start').textContent = s.start;
    $('welcome-fine').textContent = s.fine;
    $('site-footer').textContent = s.footer;
    $('lang-es').classList.toggle('active', state.lang === 'es');
    $('lang-en').classList.toggle('active', state.lang === 'en');
  }

  /* ---------------- quiz ---------------- */
  function startQuiz() {
    state.answers = new Array(state.data.questions.length).fill(null);
    state.step = 0;
    renderQuestion();
    showScreen('screen-quiz');
  }

  function renderQuestion() {
    var s = t();
    var q = state.data.questions[state.step];
    var total = state.data.questions.length;
    $('quiz-count').textContent = s.qOf(state.step + 1, total);
    $('progress-fill').style.width = ((state.step + 1) / total * 100) + '%';
    $('question-text').textContent = q[state.lang].q;
    $('btn-back').textContent = s.back;

    var box = $('options');
    box.innerHTML = '';
    var letters = ['A', 'B', 'C', 'D'];
    q[state.lang].options.forEach(function (optText, i) {
      var b = document.createElement('button');
      b.type = 'button';
      b.className = 'option';
      var key = document.createElement('span');
      key.className = 'key';
      key.textContent = letters[i];
      var label = document.createElement('span');
      label.textContent = optText;
      b.appendChild(key);
      b.appendChild(label);
      b.addEventListener('click', function () { answer(i); });
      box.appendChild(b);
    });
  }

  function answer(choice) {
    state.answers[state.step] = choice;
    if (state.step < state.data.questions.length - 1) {
      state.step += 1;
      renderQuestion();
    } else {
      finishQuiz();
    }
  }

  function goBack() {
    if (state.step === 0) {
      showScreen('screen-welcome');
    } else {
      state.step -= 1;
      renderQuestion();
    }
  }

  /* ---------------- resultado ---------------- */
  function archeName(id) { return state.data.archetypes[id][state.lang].name; }

  function archeCard(id, roleLabel, isPrimary) {
    var a = state.data.archetypes[id][state.lang];
    var card = document.createElement('div');
    card.className = 'arche-card' + (isPrimary ? ' primary' : '');
    var role = document.createElement('div');
    role.className = 'role';
    role.textContent = roleLabel;
    var name = document.createElement('h2');
    name.textContent = a.name;
    var essence = document.createElement('p');
    essence.className = 'essence';
    essence.textContent = a.essence;
    var exLabel = document.createElement('div');
    exLabel.className = 'examples-label';
    exLabel.textContent = t().examplesLabel + ':';
    var ex = document.createElement('div');
    ex.className = 'examples';
    a.examples.forEach(function (e) {
      var chip = document.createElement('span');
      chip.textContent = e;
      ex.appendChild(chip);
    });
    card.appendChild(role);
    card.appendChild(name);
    card.appendChild(essence);
    card.appendChild(exLabel);
    card.appendChild(ex);
    return card;
  }

  function finishQuiz() {
    state.result = computeScores(state.answers, state.data);
    renderResult();
    showScreen('screen-result');
  }

  function renderResult() {
    var s = t();
    var r = state.result;
    $('result-badge').textContent = s.resultBadge;
    $('result-heading').textContent = s.resultHeading;

    var pill = $('confidence-pill');
    var confKey = r.confidence === 'alta' ? 'confAlta' : (r.confidence === 'media' ? 'confMedia' : 'confMixto');
    pill.textContent = s[confKey];
    pill.className = 'confidence ' + r.confidence;

    var mixedNote = $('mixed-note');
    if (r.mixed) {
      mixedNote.textContent = s.mixedNote;
      mixedNote.style.display = 'block';
    } else {
      mixedNote.style.display = 'none';
    }

    var cards = $('arche-cards');
    cards.innerHTML = '';
    if (r.mixed) {
      cards.appendChild(archeCard(r.coPrimary[0], s.roleCoPrimary, true));
      cards.appendChild(archeCard(r.coPrimary[1], s.roleCoPrimary, true));
    } else {
      cards.appendChild(archeCard(r.primary, s.rolePrimary, true));
      cards.appendChild(archeCard(r.secondary, s.roleSecondary, false));
    }

    $('btn-playbook').textContent = s.btnPlaybook;
    $('btn-retake').textContent = s.btnRetake;
    $('share-label').textContent = s.shareLabel;
    $('copy-label').textContent = s.copyLink;
    $('copied-tip').textContent = '';
  }

  function shareUrl() {
    return window.location.href.split('?')[0];
  }

  function shareText() {
    var r = state.result;
    var names = r.mixed
      ? archeName(r.coPrimary[0]) + ' + ' + archeName(r.coPrimary[1])
      : archeName(r.primary);
    return t().shareText(names) + ' ' + shareUrl();
  }

  /* ---------------- lead form ---------------- */
  function renderLead() {
    var s = t();
    $('lead-badge').textContent = s.leadBadge;
    $('lead-title').textContent = s.leadTitle;
    $('lead-sub').textContent = s.leadSub;
    $('l-nombre').textContent = s.lNombre;
    $('l-marca').textContent = s.lMarca;
    $('l-email').textContent = s.lEmail;
    $('l-web').textContent = s.lWeb;
    $('l-idioma').textContent = s.lIdioma;
    $('l-reto').textContent = s.lReto;
    var retoSel = $('f-reto');
    retoSel.innerHTML = '';
    s.retos.forEach(function (r) {
      var o = document.createElement('option');
      o.value = r;
      o.textContent = r;
      retoSel.appendChild(o);
    });
    $('f-idioma').value = state.lang;
    $('btn-submit').textContent = s.submit;
    $('form-error').textContent = '';
    $('lead-form-wrap').style.display = 'block';
    $('lead-success').style.display = 'none';
    $('success-title').textContent = s.successTitle;
    $('success-sub').textContent = s.successSub;
    showScreen('screen-lead');
  }

  function buildPayload() {
    var r = state.result;
    return {
      nombre: $('f-nombre').value.trim(),
      marca: $('f-marca').value.trim(),
      email: $('f-email').value.trim(),
      web: $('f-web').value.trim(),
      idioma: $('f-idioma').value,
      reto: $('f-reto').value,
      utm: state.utm,
      primario: r.primary,
      secundario: r.secondary,
      margen: Math.round(r.margin * 1000) / 10, // porcentaje con 1 decimal
      confianza: r.confidence,
      mixto: r.mixed ? 'si' : 'no',
      top5: r.top5,
      respuestas: state.answers
    };
  }

  function postLead(payload, isRetry) {
    if (!window.APPS_SCRIPT_URL || window.APPS_SCRIPT_URL === 'PEGAR_URL_AQUI') {
      return Promise.resolve(false); // sin URL configurada: no se envía, pero no se rompe
    }
    return fetch(window.APPS_SCRIPT_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'text/plain;charset=utf-8' },
      body: JSON.stringify(payload)
    }).then(function (res) { return res.ok; }).catch(function () { return false; });
  }

  function submitLead(ev) {
    ev.preventDefault();
    var s = t();
    var payload = buildPayload();
    var emailOk = /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email);
    if (!payload.nombre || !emailOk) {
      $('form-error').textContent = s.errRequired;
      return;
    }
    $('btn-submit').disabled = true;
    // El resultado ya se mostró antes del formulario: el éxito es visible
    // aunque el POST falle; el reintento ocurre en silencio.
    postLead(payload, false).then(function (ok) {
      if (!ok) {
        setTimeout(function () { postLead(payload, true); }, 4000);
      }
      $('lead-form-wrap').style.display = 'none';
      $('lead-success').style.display = 'block';
      window.scrollTo(0, 0);
      $('btn-submit').disabled = false;
    });
  }

  /* ---------------- init ---------------- */
  function init() {
    try {
      var params = new URLSearchParams(window.location.search);
      state.utm = params.get('utm_source') || '';
    } catch (e) { state.utm = ''; }

    applyLang();
    $('lang-es').addEventListener('click', function () { state.lang = 'es'; applyLang(); });
    $('lang-en').addEventListener('click', function () { state.lang = 'en'; applyLang(); });
    $('btn-start').addEventListener('click', startQuiz);
    $('btn-back').addEventListener('click', goBack);
    $('btn-playbook').addEventListener('click', renderLead);
    $('btn-retake').addEventListener('click', function () {
      state.result = null;
      startQuiz();
    });
    $('lead-form').addEventListener('submit', submitLead);

    $('share-wa').addEventListener('click', function () {
      window.open('https://wa.me/?text=' + encodeURIComponent(shareText()), '_blank', 'noopener');
    });
    $('share-x').addEventListener('click', function () {
      window.open('https://x.com/intent/post?text=' + encodeURIComponent(shareText()), '_blank', 'noopener');
    });
    $('share-copy').addEventListener('click', function () {
      var done = function () { $('copied-tip').textContent = t().copied; };
      if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(shareUrl()).then(done).catch(done);
      } else {
        var ta = document.createElement('textarea');
        ta.value = shareUrl();
        document.body.appendChild(ta);
        ta.select();
        try { document.execCommand('copy'); } catch (e) {}
        document.body.removeChild(ta);
        done();
      }
    });

    fetch('data.json')
      .then(function (res) {
        if (!res.ok) throw new Error('http ' + res.status);
        return res.json();
      })
      .then(function (data) {
        state.data = data;
        showScreen('screen-welcome');
      })
      .catch(function () {
        $('welcome-sub').textContent = t().loadError;
        showScreen('screen-welcome');
      });
  }

  document.addEventListener('DOMContentLoaded', init);
})();
