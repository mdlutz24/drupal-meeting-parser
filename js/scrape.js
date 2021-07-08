let scraper = {
  data: '',
  ids: [],
  users: {},
  threadInProgress: false,
  // null is undefined, false is don't save it, true is save it.
  threadCredits: null,
  lastTopId: null,

  clear: function () {
    this.data = '';
    this.ids = [];
    this.users = {};
    this.threadInProgress = false;
    this.threadCredits = null;
    this.lastTopId = null;
    alert('Cleared thread memory. You can start fresh.');
  },

  startThread: function() {
    if (!this.isParsing()) {
      this.data += "<table>\n";
      this.threadInProgress = true;
    }
  },

  endThread: function() {
    if (this.isParsing()) {
      this.data += "</table>\n\n";
      if (this.threadCredits === true) {
        document.querySelector('#drupal-meeting-parser-add-with-credit-button').style.backgroundColor = 'yellow';
        document.querySelector('#drupal-meeting-parser-add-with-credit-button').innerHTML = 'Add with credit';
      }
      else {
        document.querySelector('#drupal-meeting-parser-add-without-credit-button').style.backgroundColor = 'yellow';
        document.querySelector('#drupal-meeting-parser-add-without-credit-button').innerHTML = 'Add without credit';
      }
      this.threadInProgress = false;
      this.threadCredits = null;
      this.lastTopId = null;
    }
  },

  isParsing: function() {
    return this.threadInProgress;
  },

  display: function () {
    const el = document.createElement('textarea');
    el.value = this.data;
    el.value += "\n\nParticipants:\n\n" + Object.keys(this.users).join(', ');
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
    alert('Thread memory copied to clipboard. Use the participant list to credit individuals.');
  },

  parseText: function(textNode) {
    textNode = textNode.cloneNode(true);
    let images = textNode.querySelectorAll("img");
    images.forEach(function(image) {
      if (image.getAttribute('data-stringify-type') === 'emoji') {
        image.outerHTML = image.getAttribute('data-stringify-emoji');
      }
    });
    let text = textNode.textContent;

    text = text.replace(/:zero:/g, '0️⃣');
    text = text.replace(/:one:/g, '1️⃣');
    text = text.replace(/:two:/g, '2️⃣');
    text = text.replace(/:three:/g, '3️⃣');
    text = text.replace(/:four:/g, '4️⃣');
    text = text.replace(/:five:/g, '5️⃣');
    text = text.replace(/:six:/g, '6️⃣');
    text = text.replace(/:seven:/g, '7️⃣');
    text = text.replace(/:eight:/g, '8️⃣');
    text = text.replace(/:nine:/g, '9️⃣');
    text = text.replace(/:keycap_ten:/g, '🔟');

    let issues = /https:\/\/www\.drupal\.org\/project\/.*\/([0-9]{7})/
    return text.replace(issues, '[#$1]');
  },

  parseThread: function() {
    this.startThread();
    let sidebar = document.querySelectorAll('.p-flexpane .c-scrollbar__hider')[0];
    let finished = (sidebar.scrollTop + sidebar.offsetHeight) >= sidebar.scrollHeight;
    sidebar.querySelectorAll('.c-virtual_list__item').forEach(function(message) {
      if (!this.ids.includes(message.getAttribute('id')) && !message.getAttribute('id').endsWith('_input')) {
        this.ids.push(message.getAttribute('id'));
        if (typeof(message.querySelector('a.c-message__sender_link')) !== 'undefined') {
          let parsedMessage = this.parseText(message.querySelector('.c-message_kit__gutter__right').childNodes[4]).trim();
          if (parsedMessage.startsWith(":bust_in_silhouette:")) {
            this.data += "<tr><td>(<em>anonymous</em>)</td><td>" + parsedMessage.replace(":bust_in_silhouette:", '').trim() + "</td></tr>\n";
          }
          else if (parsedMessage.startsWith(":no_entry_sign:")) {
            this.data += "<tr><td>(<em>anonymous</em>)</td><td><em>Comment Redacted</em></td></tr>\n";
          }
          else {
            let user = message.querySelector('a.c-message__sender_link').textContent;

            // Map some common usernames for easier drupal.org name crediting.
            let nameMap = new Map();
            nameMap.set('kimb0', 'kim.pepper');
            nameMap.set('mixologic', 'Mixologic');
            nameMap.set('Gábor Hojtsy (he/him)', 'Gábor Hojtsy');
            nameMap.set('Kristen Pol (she/her)', 'Kristen Pol');
            nameMap.set('surabhi.gokte', 'Surabhi Gokte');
            nameMap.set('wimleers (he/him)', 'Wim Leers');
            nameMap.set('berdir', 'Berdir');
            nameMap.set('hestenet (he/him)', 'hestenet');

            if (this.threadCredits === true) {
              if (nameMap.has(user)) {
                this.users[nameMap.get(user)] = nameMap.get(user);
              }
              else {
                this.users[user] = user;
              }
            }

            // Keep the Slack name here so references to the names in messages are understandable.
            this.data += "<tr><td>" + user + "</td><td>" + parsedMessage + "</td></tr>\n";
          }
        }
      }
    }, this)
    if (!finished) {
      sidebar.scrollTop += sidebar.offsetHeight;
      setTimeout(this.parseThread.bind(this), 600);
    }
    else {
      this.endThread();
    }
  },

  addThread: function () {
    if (this.isParsing()) {
      alert('A thread is already being parsed to be added. Wait until it finishes. If it looks finished, you found a bug. Report at https://github.com/mdlutz24/drupal-meeting-parser/issues');
      return;
    }
    if (this.threadCredits === null) {
      // Initialize credit logging to true if not set otherwise.
      this.threadCredits = true;
      document.querySelector('#drupal-meeting-parser-add-with-credit-button').style.backgroundColor = 'gray';
      document.querySelector('#drupal-meeting-parser-add-with-credit-button').innerHTML = '[Processing]';
    }
    else {
      document.querySelector('#drupal-meeting-parser-add-without-credit-button').style.backgroundColor = 'gray';
      document.querySelector('#drupal-meeting-parser-add-without-credit-button').innerHTML = '[Processing]';
    }
    let sidebar = document.querySelectorAll('.p-flexpane .c-scrollbar__hider')[0];
    this.lastTopId = sidebar.querySelector('.c-virtual_list__item').getAttribute('id');
    sidebar.scrollTop = 0;
    setTimeout(this.ensureScrollToTop.bind(this), 600);
  },

  ensureScrollToTop: function() {
    let sidebar = document.querySelectorAll('.p-flexpane .c-scrollbar__hider')[0];
    if (this.lastTopId != sidebar.querySelector('.c-virtual_list__item').getAttribute('id')) {
      this.lastTopId = sidebar.querySelector('.c-virtual_list__item').getAttribute('id');
      sidebar.scrollTop = 0;
      setTimeout(this.ensureScrollToTop.bind(this), 600);
    }
    else {
      this.addThreadHeader();
    }
  },

  addThreadNoCredit: function () {
    this.threadCredits = false;
    this.addThread();
  },

  addThreadHeader: function() {
    let sidebar = document.querySelectorAll('.p-flexpane .c-scrollbar__hider')[0];
    let toppost = sidebar.querySelector('.c-virtual_list__item');
    this.ids.push(toppost.getAttribute('id'));
    this.ids.push(sidebar.querySelectorAll('.c-virtual_list__item')[1].getAttribute('id'));
    this.data += "<h2>" + this.parseText(toppost.querySelector('.c-message_kit__gutter__right').childNodes[4]) + "</h2>\n";
    this.parseThread();
  }
};

setTimeout(function() {
  let wrapper = document.createElement('div');
  wrapper.setAttribute('id', 'drupal-meeting-parser-wrapper');
  wrapper.setAttribute('style', "position:absolute;width:600px;height:30px;left:10px;top:3px;z-index:1000;text-align:center;" );
  let style="width:140px;height:30px;margin-left:5px;margin-right:5px;background-color:yellow;cursor:pointer;display:inline-block;border-radius:4px;border: 1px solid black;box-shadow: 1px 1px #ddd;";
  let clearThread = document.createElement('button');
  clearThread.addEventListener('click', scraper.clear.bind(scraper));
  clearThread.setAttribute('style', style);
  clearThread.setAttribute('value', 'Clear memory');
  clearThread.setAttribute('id', 'drupal-meeting-parser-clear-button');
  clearThread.appendChild(document.createTextNode('Clear memory'));
  let addThread = document.createElement('button');
  addThread.addEventListener('click', scraper.addThread.bind(scraper));
  addThread.setAttribute('style', style);
  addThread.setAttribute('value', 'Add with credit');
  addThread.setAttribute('id', 'drupal-meeting-parser-add-with-credit-button');
  addThread.appendChild(document.createTextNode('Add with credit'));
  let addThreadNoCredit = document.createElement('button');
  addThreadNoCredit.addEventListener('click', scraper.addThreadNoCredit.bind(scraper));
  addThreadNoCredit.setAttribute('style', style);
  addThreadNoCredit.setAttribute('value', 'Add without credit');
  addThreadNoCredit.appendChild(document.createTextNode('Add without credit'));
  addThreadNoCredit.setAttribute('id', 'drupal-meeting-parser-add-without-credit-button');
  let displayThread = document.createElement('button');
  displayThread.addEventListener('click', scraper.display.bind(scraper));
  displayThread.setAttribute('style', style);
  displayThread.setAttribute('value', 'To clipboard');
  displayThread.appendChild(document.createTextNode('To clipboard'));
  wrapper.appendChild(clearThread);
  wrapper.appendChild(addThread);
  wrapper.appendChild(addThreadNoCredit);
  wrapper.appendChild(displayThread);

  let body = document.querySelector('body');
  body.insertBefore(wrapper, body.firstChild);
}, 2000);
