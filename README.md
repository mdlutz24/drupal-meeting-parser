# drupal-meeting-parser
Bare bones Google Chrome extension to copy Drupal meeting threads to the system clipboard.

1. Enable developer mode for Google Chrome Extensions. 
   See https://developer.chrome.com/extensions/faq#faq-dev-01

2. Clone this repository to any location on your local computer.

3. Use the "Load unpacked" option under Chrome Extensions to load this
   unpacked Chrome Extension. Pick the directory you checked this out to.

4. A gray Drupal meeting parser icon will appear in your browser alongside
   the URL bar.

4. Open the chatroom in Google Chrome. The icon will become blue and three
   buttons will apear on the top of the page: Clear, Add Thread and Copy.

   The extension has internal storage for all your added threads. You can
   clear the internal storage with 'Clear', add a thread with 'Add Thread'
   and copy the contents of that storage (all the threads you added) to
   the operating system's clipboard with the 'Copy' button.

5. Open each thread in the chat sidebar you want to add to the meeting notes.
   Click 'Add Thread' once the thread loaded. Repeat this for all threads
   you want to add to the notes.
   
6. When done, click 'Copy'. Now your meeting notes are on the operating
   system clipboard and can be copied over to a Drupal meeting node for
   posterity.

While this is not automated (yet), you should manually collect the usernames
you intend to credit for participating in the meeting and give drupal.org
credits to them when saving the meeting notes.
