# drupal-meeting-parser
This is a bare bones Google Chrome extension to copy Drupal meeting threads to the system clipboard.

<img src="https://github.com/mdlutz24/drupal-meeting-parser/blob/master/icon.png" alt="Drupal Meeting Parser icon" align="right" />

Many Drupal teams use threaded meetings to discuss current topics. This extension
helps to archive the meeting log from these meetings for posterity.

## How to install

1. Enable developer mode for Google Chrome Extensions. 
   See https://developer.chrome.com/extensions/faq#faq-dev-01

2. Clone this repository to any location on your local computer.

3. Use the "Load unpacked" option under Chrome Extensions to add this
   unpacked Chrome Extension to your browser. Pick the directory you checked
   this out to.

4. A grayed out Drupal meeting parser icon will appear in your browser alongside
   the URL bar.

4. Open the chatroom in Google Chrome. The icon will become blue and three
   flat gray buttons should apear on the top of the page: Clear, Add Thread and Copy.

## When to use

It is advised not to save the meeting log right after the meeting as the format
itself allows remote participants to join slightly later. You should save the
meeting logs a day or so later when the meeting text is still available but
everybody had a chance to chime in.

## How to use

The extension has internal storage for all your added threads. You can
clear the internal storage with 'Clear', add a thread to it with 'Add Thread'
and copy the contents of that storage (all the threads you added in the order
you added them) to the operating system's clipboard with the 'Copy' button.

1. Open each thread in the chat sidebar you want to add to the meeting notes.
   Click 'Add Thread' once the thread loaded. Repeat this for all threads
   you want to add to the notes.
   
2. When done, click 'Copy'. Now your meeting notes are on the operating
   system clipboard and can be pasted into the Drupal meeting node for
   posterity.

## Crediting participants

While this is not automated (yet), you should manually collect the usernames
you intend to credit for participating in the meeting and give drupal.org
credits to them when saving the meeting notes. Close the issue as fixed so
the credits will be granted.

## Contributing

All aspects of the extension can be improved, contributions welcome.
