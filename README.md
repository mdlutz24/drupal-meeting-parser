# drupal-meeting-parser
This is a bare bones Google Chrome extension to copy Drupal meeting threads to the system clipboard.

<img src="https://github.com/mdlutz24/drupal-meeting-parser/blob/master/icon.png" alt="Drupal Meeting Parser icon" align="right" />

Many Drupal teams use threaded meetings to discuss current topics. This
extension helps to archive the meeting log from these meetings for posterity.
Crediting meeting participants is facilitated as well.

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

3. At the end of the paste, you will find a 'Participants' section. This
   includes all the chat usernames of participants. It is a best practice to
   credit active meeting participants on the meeting notes issue. You can do
   that by pasting the list of participants at the end of your drupal.org
   meeting issue in the 'Credit others' textfield (in the 'Crediting &
   committing' fieldset). This field is only visible for maintainers of a
   project. If you are not a maintainer, ask a maintainer to credit people.

   Do keep in mind two things. First of all, it is a best practice to only
   credit active meeting participants. That is people who actually contributed
   to the meeting. Second, drupal.org usernames will not always be the same as
   chat usernames. When you save credits after you pasted the list, check which
   users got credits and find and add the actual drupal.org usernames for the
   missing participants to credit. Then save them with another comment.

   Finally, don't forget to close the issue as fixed so the credits will be
   granted.

## Contributing

All aspects of the extension can be improved, contributions welcome.
