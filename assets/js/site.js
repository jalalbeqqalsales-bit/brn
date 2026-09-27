/* BRN Dirtworks — progressive enhancement only. The page works without it. */
(function () {
  'use strict';

  var PHONE = '780-689-0758';
  var EMAIL = 'brnnash11@gmail.com';

  /* ---------- Footer year ---------- */
  document.querySelectorAll('[data-year]').forEach(function (el) {
    el.textContent = String(new Date().getFullYear());
  });

  /* ---------- Mobile menu ---------- */
  var header = document.querySelector('[data-header]');
  var menuBtn = document.querySelector('[data-menu-btn]');
  var nav = document.getElementById('site-nav');

  if (header && menuBtn && nav) {
    var setMenu = function (open) {
      menuBtn.setAttribute('aria-expanded', String(open));
      header.classList.toggle('is-open', open);
    };
    menuBtn.addEventListener('click', function () {
      setMenu(menuBtn.getAttribute('aria-expanded') !== 'true');
    });
    nav.addEventListener('click', function (e) {
      if (e.target.closest('a')) setMenu(false);
    });
    document.addEventListener('keydown', function (e) {
      if (e.key === 'Escape' && menuBtn.getAttribute('aria-expanded') === 'true') {
        setMenu(false);
        menuBtn.focus();
      }
    });
    document.addEventListener('click', function (e) {
      if (!header.contains(e.target)) setMenu(false);
    });
    window.matchMedia('(min-width: 900px)').addEventListener('change', function (e) {
      if (e.matches) setMenu(false);
    });
  }

  /* ---------- Open / closed, in Lac La Biche time ---------- */
  // Day 0 = Sunday. [open hour, close hour], 24h. Keep in sync with the hours table.
  var HOURS = { 1: [7, 19], 2: [7, 19], 3: [7, 19], 4: [7, 19], 5: [7, 19], 6: [7, 12] };
  var DAY_NAMES = ['Sunday', 'Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'];

  function edmontonNow() {
    var parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'America/Edmonton',
      weekday: 'short',
      hour: 'numeric',
      minute: 'numeric',
      hourCycle: 'h23'
    }).formatToParts(new Date());
    var get = function (type) {
      var p = parts.find(function (x) { return x.type === type; });
      return p ? p.value : '';
    };
    var day = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].indexOf(get('weekday'));
    return { day: day, minutes: Number(get('hour')) * 60 + Number(get('minute')) };
  }

  function fmtHour(h) {
    if (h === 12) return 'noon';
    return (h % 12 || 12) + (h < 12 ? ' am' : ' pm');
  }

  function openStatus() {
    var now = edmontonNow();
    if (now.day < 0) return null;
    var today = HOURS[now.day];
    if (today && now.minutes >= today[0] * 60 && now.minutes < today[1] * 60) {
      return { open: true, text: 'Open now until ' + fmtHour(today[1]) };
    }
    if (today && now.minutes < today[0] * 60) {
      return { open: false, text: 'Closed now. Opens today at ' + fmtHour(today[0]) };
    }
    for (var i = 1; i <= 7; i++) {
      var d = (now.day + i) % 7;
      if (HOURS[d]) {
        var when = i === 1 ? 'tomorrow' : DAY_NAMES[d];
        return { open: false, text: 'Closed now. Opens ' + when + ' at ' + fmtHour(HOURS[d][0]) };
      }
    }
    return null;
  }

  try {
    var status = openStatus();
    if (status) {
      document.querySelectorAll('[data-open-status]').forEach(function (el) {
        el.textContent = status.text;
        el.classList.toggle('is-open', status.open);
        el.hidden = false;
      });
      var todayDay = String(edmontonNow().day);
      document.querySelectorAll('.hours tr[data-days]').forEach(function (row) {
        row.classList.toggle('is-today', row.getAttribute('data-days').split(' ').indexOf(todayDay) !== -1);
      });
    }
  } catch (err) {
    // Intl time zones unsupported: the static hours stay as written.
  }

  /* ---------- Mobile action bar ---------- */
  // Hidden while the hero buttons are on screen (they do the same job) and
  // while the quote form is on screen (so it never covers a field or the
  // on-screen keyboard).
  var bar = document.querySelector('[data-mbar]');
  var heroActions = document.querySelector('[data-hero-actions]');
  var quoteForm = document.getElementById('quote-form');

  if (bar) {
    if (!('IntersectionObserver' in window) || !heroActions || !quoteForm) {
      bar.classList.add('is-shown');
    } else {
      var heroVisible = true;
      var formVisible = false;
      var sync = function () {
        bar.classList.toggle('is-shown', !heroVisible && !formVisible);
      };
      new IntersectionObserver(function (entries) {
        heroVisible = entries[0].isIntersecting;
        sync();
      }).observe(heroActions);
      new IntersectionObserver(function (entries) {
        formVisible = entries[0].isIntersecting;
        sync();
      }, { rootMargin: '0px 0px -25% 0px' }).observe(quoteForm);
    }
  }

  /* ---------- Image reveal ---------- */
  if (document.documentElement.classList.contains('can-reveal')) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (entry) {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-in');
          io.unobserve(entry.target);
        }
      });
    }, { rootMargin: '0px 0px -12% 0px' });
    document.querySelectorAll('[data-reveal]').forEach(function (el) { io.observe(el); });
  }

  /* ---------- Quote form ---------- */
  if (!quoteForm) return;

  var form = quoteForm;
  var statusBox = form.querySelector('[data-form-status]');
  var submitBtn = form.querySelector('[type="submit"]');
  var submitLabel = submitBtn.textContent;
  var f = {
    name: form.querySelector('#f-name'),
    phone: form.querySelector('#f-phone'),
    email: form.querySelector('#f-email')
  };

  // A service tile's "Request a quote" link opens the form with that service picked.
  var typeSelect = form.querySelector('#f-type');
  document.querySelectorAll('[data-service]').forEach(function (link) {
    link.addEventListener('click', function () {
      if (typeSelect) typeSelect.value = link.getAttribute('data-service');
    });
  });

  function preferred() {
    var checked = form.querySelector('input[name="Preferred contact"]:checked');
    return checked ? checked.value : '';
  }

  function check(input) {
    var v = input.value.trim();
    if (input === f.name) {
      return v ? '' : 'Enter your name.';
    }
    if (input === f.phone) {
      if (!v) return 'Enter a phone number so BRN can reach you.';
      return v.replace(/\D/g, '').length >= 10 ? '' : 'Enter a 10-digit phone number, like 780-555-0123.';
    }
    if (input === f.email) {
      if (!v) return preferred() === 'Email' ? 'Enter an email address, or choose Call or Text.' : '';
      return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v) ? '' : 'Enter an email address like name@example.com.';
    }
    return '';
  }

  function show(input, message) {
    var field = input.closest('.field');
    var err = document.getElementById(input.id + '-err');
    field.classList.toggle('is-invalid', !!message);
    input.setAttribute('aria-invalid', message ? 'true' : 'false');
    if (err) {
      err.textContent = message;
      err.hidden = !message;
    }
  }

  function validate() {
    var firstBad = null;
    [f.name, f.phone, f.email].forEach(function (input) {
      var msg = check(input);
      show(input, msg);
      if (msg && !firstBad) firstBad = input;
    });
    if (firstBad) firstBad.focus();
    return !firstBad;
  }

  // Re-check a field once the visitor leaves it, and live-clear errors as they fix them.
  [f.name, f.phone, f.email].forEach(function (input) {
    input.addEventListener('blur', function () {
      if (input.value.trim() || input.getAttribute('aria-invalid') === 'true') show(input, check(input));
    });
    input.addEventListener('input', function () {
      if (input.getAttribute('aria-invalid') === 'true' && !check(input)) show(input, '');
    });
  });
  form.querySelectorAll('input[name="Preferred contact"]').forEach(function (radio) {
    radio.addEventListener('change', function () {
      if (f.email.getAttribute('aria-invalid') === 'true') show(f.email, check(f.email));
    });
  });

  function setStatus(tone, title, body) {
    statusBox.hidden = false;
    statusBox.setAttribute('data-tone', tone);
    statusBox.innerHTML = '';
    var strong = document.createElement('strong');
    strong.textContent = title;
    var p = document.createElement('p');
    p.innerHTML = body;
    statusBox.appendChild(strong);
    statusBox.appendChild(p);
  }

  function setBusy(busy) {
    submitBtn.disabled = busy;
    submitBtn.setAttribute('aria-busy', String(busy));
    submitBtn.textContent = busy ? 'Sending…' : submitLabel;
  }

  function buildEmail(data) {
    var val = function (k) { return (data.get(k) || '').toString().trim() || '—'; };
    var lines = [
      'Quote request from the BRN Dirtworks website',
      '',
      'Name: ' + val('Name'),
      'Phone: ' + val('Phone'),
      'Email: ' + val('Email'),
      'Best way to reach: ' + val('Preferred contact'),
      '',
      'Project type: ' + val('Project type'),
      'Project address: ' + val('Project address'),
      'Approximate size: ' + val('Approximate size'),
      '',
      'What needs doing:',
      val('Project details').slice(0, 1500)
    ];
    var type = (data.get('Project type') || '').toString();
    var subject = 'Quote request' + (type ? ': ' + type : '') + ' (' + val('Name') + ')';
    return 'mailto:' + EMAIL + '?subject=' + encodeURIComponent(subject) +
      '&body=' + encodeURIComponent(lines.join('\r\n'));
  }

  var callLink = '<a class="link" href="tel:+17806890758">' + PHONE + '</a>';

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    statusBox.hidden = true;

    if (form.querySelector('[name="_gotcha"]').value) return; // bot
    if (!validate()) {
      setStatus('error', 'Check the highlighted fields.', 'Name and phone are needed so BRN can get back to you.');
      return;
    }

    var data = new FormData(form);
    var endpoint = form.getAttribute('data-endpoint');

    // No form service configured yet: hand the request to the visitor's email app.
    if (!endpoint) {
      window.location.href = buildEmail(data);
      setStatus('ok', 'Almost done: send the email.',
        'Your email app should open with the request filled in. Press send to deliver it to BRN. ' +
        'Nothing opened? Call ' + callLink + ' or email <a class="link" href="mailto:' + EMAIL + '">' + EMAIL + '</a>.');
      return;
    }

    setBusy(true);
    fetch(endpoint, { method: 'POST', body: data, headers: { Accept: 'application/json' } })
      .then(function (res) {
        if (!res.ok) throw new Error('HTTP ' + res.status);
        form.reset();
        setStatus('ok', 'Quote request sent.', 'BRN has your details. For anything urgent, call ' + callLink + '.');
      })
      .catch(function () {
        setStatus('error', 'Your request didn’t go through.',
          'Check your connection and try again, or call ' + callLink + '.');
      })
      .finally(function () {
        setBusy(false);
        statusBox.focus({ preventScroll: true });
        statusBox.scrollIntoView({ block: 'nearest' });
      });
  });
})();
