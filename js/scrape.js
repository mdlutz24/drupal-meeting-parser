let scraper = {
  data: '',

  ids: [],

  threadInProgress: false,

  clear: function () {
    this.data = ''
    this.ids = []
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
      this.threadInProgress = false;
    }
  },

  isParsing: function() {
    return this.threadInProgress;
  },

  display: function () {
    const el = document.createElement('textarea');
    el.value = this.data;
    document.body.appendChild(el);
    el.select();
    document.execCommand('copy');
    document.body.removeChild(el);
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
    let issues = /https:\/\/www\.drupal\.org\/project\/.*\/([0-9]{7})/
    return text.replace(issues, '[#$1]');
  },

  parseThread: function() {
    this.startThread();
    let sidebar = document.querySelectorAll('.p-flexpane .c-scrollbar__hider')[0];
    let finished = (sidebar.scrollTop + sidebar.offsetHeight) >= sidebar.scrollHeight;
    sidebar.querySelectorAll('.c-virtual_list__item').forEach(function(message) {
      if (!this.ids.includes(message.getAttribute('id')) && !message.getAttribute('id').endsWith('list_input')) {
        this.ids.push(message.getAttribute('id'));
        if (typeof(message.querySelector('a.c-message__sender_link')) !== 'undefined') {
          this.data += "<tr><td>" + message.querySelector('a.c-message__sender_link').textContent + "</td><td>" + this.parseText(message.querySelector('.c-message_kit__gutter__right').childNodes[4]) + "</td></tr>\n";
        }
      }
    }, this)
    if (!finished) {
      sidebar.scrollTop += sidebar.offsetHeight;
      setTimeout(this.parseThread.bind(this), 200);
    }
    else {
      this.endThread();
    }
  },

  addThread: function () {
    let sidebar = document.querySelectorAll('.p-flexpane .c-scrollbar__hider')[0];
    sidebar.scrollTop = 0;
    let toppost = sidebar.querySelector('.c-virtual_list__item');
    this.ids.push(toppost.getAttribute('id'));
    this.ids.push(sidebar.querySelectorAll('.c-virtual_list__item')[1].getAttribute('id'));
    this.data += "<h2>" + this.parseText(toppost.querySelector('.c-message_kit__gutter__right').childNodes[4]) + "</h2>\n";
    this.parseThread();
  }
};

setTimeout(function() {
  let wrapper = document.createElement('div');
  wrapper.setAttribute('style', "position:absolute;width:300px;height:30px;left:400px;z-index:10;" );
  let style="width:90px;height:30px;margin-left:5px;margin-right:5px;background-color:#ccc;cursor:pointer;display:inline-block";
  let clearThread = document.createElement('button');
  clearThread.addEventListener('click', scraper.clear.bind(scraper));
  clearThread.setAttribute('style', style);
  clearThread.setAttribute('value', 'Clear');
  clearThread.appendChild(document.createTextNode('Clear'));
  let addThread = document.createElement('button');
  addThread.addEventListener('click', scraper.addThread.bind(scraper));
  addThread.setAttribute('style', style);
  addThread.setAttribute('value', 'Add Thread');
  addThread.appendChild(document.createTextNode('Add Thread'));
  let displayThread = document.createElement('button');
  displayThread.addEventListener('click', scraper.display.bind(scraper));
  displayThread.setAttribute('style', style);
  displayThread.setAttribute('value', 'copy');
  displayThread.appendChild(document.createTextNode('Copy'));
  wrapper.appendChild(clearThread);
  wrapper.appendChild(addThread);
  wrapper.appendChild(displayThread);

  let body = document.querySelector('body');
  body.insertBefore(wrapper, body.firstChild);
}, 2000);
