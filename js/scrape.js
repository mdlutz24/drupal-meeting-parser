let scraper = {
  data: '',
  ids: [],
  users: {},
  threadInProgress: false,
  // null is undefined, false is don't save it, true is save it.
  threadCredits: null,
  lastTopId: null,
  threadCount: 0,

  clear: function () {
    this.data = '';
    this.ids = [];
    this.users = {};
    this.threadInProgress = false;
    this.threadCredits = null;
    this.lastTopId = null;
    this.threadCount = 0;
    let button = document.querySelector('#drupal-meeting-parser-clipboard-button');
    button.innerHTML = 'Copy to clipboard';
    button.style.backgroundColor = 'gray';
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
        let button = document.querySelector('#drupal-meeting-parser-add-with-credit-button');
        button.innerHTML = 'Add with credit';
        button.style.backgroundColor = 'yellow';
        button.style.color = 'black';
      }
      else {
        let button = document.querySelector('#drupal-meeting-parser-add-without-credit-button');
        button.innerHTML = 'Add without credit';
        button.style.backgroundColor = 'yellow';
        button.style.color = 'black';
      }
      this.threadInProgress = false;
      this.threadCredits = null;
      this.lastTopId = null;

      // Increase and display thread count on clipboard button. Make it yellow
      // in case this was the first thread.
      this.threadCount++;
      let button = document.querySelector('#drupal-meeting-parser-clipboard-button');
      button.innerHTML = 'Copy ' + (this.threadCount > 1 ? this.threadCount + ' threads' : 'thread') + ' to clipboard';
      button.style.backgroundColor = 'yellow';
      button.style.color = 'black';

      // The main slack window has the list item of this thread, so add a checkmark there to help identify which one was saved.
      document.querySelector('div.c-virtual_list__item[tabindex="0"] .p-rich_text_section').prepend('✅ ');
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
    copyNode = document.createElement('div');
    copyNode.innerHTML = textNode.innerHTML;
    let images = copyNode.querySelectorAll("img");
    images.forEach(function(image) {
      if (image.getAttribute('data-stringify-type') === 'emoji') {
        image.outerHTML = image.getAttribute('data-stringify-emoji');
      }
    });
    let links = copyNode.querySelectorAll("a");
    links.forEach(function(link) {
      // Turn links into pseudo-HTML, but avoid member mentions.
      let href = link.getAttribute('href');
      if (href !== link.textContent && href.indexOf('drupal.slack.com') === -1) {
        link.outerHTML = '{{a href="' + href + '"}}' + link.textContent + '{{/a}}';
      }
    });
    let text = copyNode.textContent;

    // Meeting agenda emoji mapping.
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

    // Other emoji mapping.
    text = text.replace(/:no_entry_sign:/g, '🚫');
    text = text.replace(/:bust_in_silhouette:/g, '👤');
    text = text.replace(/:star:/g, '⭐');
    text = text.replace(/:heart:/g, '❤️');
    text = text.replace(/:blue_heart:/g, '💙');
    text = text.replace(/:mega:/g, '📣');
    text = text.replace(/:slightly_smiling_face:/g, '🙂');
    text = text.replace(/:raising_hand:/g, '🙋');
    text = text.replace(/:thumbsup:/g, '👍');

    // Avoid matching issue links in pseudo-HTML, so we don't get double links.
    let issues = /[^}"]https:\/\/www\.drupal\.org\/project\/.*\/([0-9]{7})/;
    text = text.replace(issues, '[#$1]');

    // Convert pseudo-links to actual HTML links.
    let linkRegex = /\{\{a href="(.*?)"}}(.*?)\{\{\/a}}/g
    text = text.replaceAll(linkRegex, '<a href="$1">$2<\/a>')

    return text;
  },

  parseThread: function() {
    this.startThread();
    let sidebar = document.querySelectorAll('.p-flexpane .c-scrollbar__hider')[0];
    let finished = Math.ceil(sidebar.scrollTop + sidebar.offsetHeight) >= sidebar.scrollHeight;
    let user = '';
    sidebar.querySelectorAll('.c-virtual_list__item').forEach(function(message) {
      if (!this.ids.includes(message.getAttribute('id')) && !message.getAttribute('id').endsWith('_input')) {
        this.ids.push(message.getAttribute('id'));
        if (typeof(message.querySelector('a.c-message__sender_link')) !== 'undefined') {
          let parsedMessage = this.parseText(message.querySelector('.c-message_kit__blocks')).trim();
          if (parsedMessage.startsWith("👤")) {
            this.data += "<tr><td>(<em>anonymous</em>)</td><td>" + parsedMessage.replace("👤", '').trim() + "</td></tr>\n";
          }
          else if (parsedMessage.startsWith("🚫")) {
            this.data += "<tr><td>(<em>anonymous</em>)</td><td><em>Comment Redacted</em></td></tr>\n";
          }
          else { 
            if (message.querySelector('button.c-message__sender_button')) {
              // Update user, if this item had a new one from the previous. Not all items list the user.
              user = message.querySelector('button.c-message__sender_button').textContent;
            }

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
            nameMap.set('timplunkett (he/him)', 'tim.plunkett');
            nameMap.set('AmyJune (volkswagenchick she/her)', 'volkswagenchick');
            nameMap.set('phenaproxima (he/him)', 'phenaproxima');
            nameMap.set('Piotr Koszuliński', 'Reinmar');
            nameMap.set('Björn Brala (bbrala)', 'bbrala');
            nameMap.set('lleber', 'Luke.Leber');
            nameMap.set('mikelutz (he/him)', 'mikelutz');
            nameMap.set('greg-boggs', 'Greg Boggs');
            nameMap.set('Dan Davis', 'ddavisboxleitner');
            nameMap.set('Stephanie', 'pixlkat');

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
    // Don't let another thread start before this thread finishes.
    if (this.isParsing()) {
      alert('A thread is already being parsed to be added. Wait until it finishes. If it looks finished, you found a bug. Report at https://github.com/mdlutz24/drupal-meeting-parser/issues');
      return;
    }

    // Check if the current top ID is already in the parsed IDs. It may not be
    // the absolute top ID yet, but is this thread was recorded, this ID should
    // also already be parsed.
    let sidebar = document.querySelectorAll('.p-flexpane .c-scrollbar__hider')[0];
    this.lastTopId = sidebar.querySelector('.c-virtual_list__item').getAttribute('id');
    if (this.ids.includes(this.lastTopId)) {
      alert('This thread was already added. Pick another thread to add.');
      return;
    }

    // Provide feedback on the button that parsing is happening.
    if (this.threadCredits === null) {
      // Initialize credit logging to true if not set otherwise.
      this.threadCredits = true;
      let button = document.querySelector('#drupal-meeting-parser-add-with-credit-button');
      button.style.backgroundColor = 'gray';
      button.style.color = 'white';
      button.innerHTML = '[Processing]';
    }
    else {
      let button = document.querySelector('#drupal-meeting-parser-add-without-credit-button');
      button.style.backgroundColor = 'gray';
      button.style.color = 'white';
      button.innerHTML = '[Processing]';
    }
    sidebar.scrollTop = 0;
    setTimeout(this.ensureScrollToTop.bind(this), 600);
  },

  ensureScrollToTop: function() {
    // Slack loads the bottom of threads by default. We should scroll to the top enough
    // times to dynamically load all items in the thread and reach the starting message
    // of the thread.
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
    // Initialize global flag to not record credits and fall back on default
    // thread behavior otherwise.
    this.threadCredits = false;
    this.addThread();
  },

  addThreadHeader: function() {
    let sidebar = document.querySelectorAll('.p-flexpane .c-scrollbar__hider')[0];
    let toppost = sidebar.querySelector('.c-virtual_list__item');
    this.ids.push(toppost.getAttribute('id'));
    this.ids.push(sidebar.querySelectorAll('.c-virtual_list__item')[1].getAttribute('id'));
    this.data += "<h2>" + this.parseText(toppost.querySelector('.c-message_kit__blocks')) + "</h2>\n";
    this.parseThread();
  }
};

setTimeout(function() {
  let wrapper = document.createElement('div');
  wrapper.setAttribute('id', 'drupal-meeting-parser-wrapper');
  wrapper.setAttribute('style', "position:absolute;width:800px;height:30px;left:10px;top:3px;z-index:1000;text-align:center;" );
  let style="width:180px;height:30px;margin-left:5px;margin-right:5px;background-color:yellow;color:black;cursor:pointer;display:inline-block;border-radius:4px;border: 1px solid black;box-shadow: 1px 1px #ddd;";
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
  displayThread.setAttribute('style', style + 'background-color:gray; color: white;');
  displayThread.setAttribute('value', 'Copy to clipboard');
  displayThread.setAttribute('id', 'drupal-meeting-parser-clipboard-button');
  displayThread.appendChild(document.createTextNode('Copy to clipboard'));
  wrapper.appendChild(clearThread);
  wrapper.appendChild(addThread);
  wrapper.appendChild(addThreadNoCredit);
  wrapper.appendChild(displayThread);

  let body = document.querySelector('body');
  body.insertBefore(wrapper, body.firstChild);
}, 2000);
