# Holodex Changelog

### 2.6.2 Holodex [*April 29, 2021*]
##### Hotfix:
- Fixed a horrible bug with Music editing, should be even better now. Thanks for the report lilybass ❤️

### 2.6.1 Holodex [*April 27, 2021*]
##### New Features:
- Added Korean language! Thank you AlexKoala#0253
- Some new multiview presets.
- Should be slightly easier to add music to long karaoke streams now.

##### Patches
- Some hotfixes during the week for live chat tabs. 
- More robust multiview code, less bugs.
- Changed our browser support list to make the site load slightly faster. Browsers with >1% usage share are completely supported.

### 2.6 Holodex [*April 22, 2021*]
##### New Features
- Added **Twitch support** in MultiView. You can add a **custom twitch URL** into MultiViewer. (#175)
- Added skeleton loaders to make you think the site is loading faster. (#177)
- Advanced Search tool. (#180)
- Search now is paginated, and **multi-channel searches are now calibrated to find collabs**: (Inugami Korone, Nekomata Okayu, comment: Rap), or clips from a specific clipper involving vtubers (Sushi, Oozora Subaru).
- Better changelog (#179) You're reading it right now.
- Turn off Video Autoplay across the platform (except for Music & MugenClips). Temporary experiment, it may stay if we think this way is more beneficial for clippers and vtubers. or we may default to Autoplay OFF. The experiment will run for at least two weeks.
- Added setting to hide collab streams from the favorites page. By default your favorites lives contains channels you favorited and channels collaborating with your favorites. Use this setting to hide those streams
- Added Grid/Thumbnail size setting, choice of large (default), medium, small thumbnail size
- Fixed left navigation drawer inconsistent behavior
- Mute/Unmute all streams in mutliview
- Added more presets, autolayout for mobile, and other small QoL changes to multiview

##### Patches
- Easier to resize cells with clear drag zones.
- Fix Pagination not working on last page of channel.
- New 3x3 video + 1 chat Multiview layout added.
- Added thumbnails to multiview (#188)



### 2.5 Holodex [*April 19, 2021*]
##### New Features
- [es-ES] locale added! Thanks D3fau4 & Darkc0m
- Persist watch settings
- Rewrote pagination on all video lists (hopefully removing all the - previous bugs, and hopefully not creating new ones)
##### Bugfixes
- Fixed Live TL bugs


### 2.4.2 Holodex [*April 16, 2021*]
##### Bugfixes
Fixed a problem with Scroll Mode on the Favorites page


### 2.4.1 Holodex [*April 12, 2021*]
##### Bugfixes
Favorites autoupdating, and Multiview overhaul wasn't talking to each other. That's fixed now.


### 2.4 Holodex [*April 11th, 2021*]
##### New Features
- **Multiview rewritten**.
   - Pause a video to enter edit mode.
   - Autolayout feature added.
- **Favorites auto updates** now, log in to use this feature.
- Customizable TL. Choose which language you'd like to receive TL in.
- Easier to manage blacklisted clipper channels
##### Bugfixes
- Bugfixes to music feature



### 2.3.1 Holodex [*April 3rd, 2021*]
##### Patches
- **Added channel blacklist feature**
- Minor UI bugfixes / Usability improvements (#131, 2784a2d, c9d1202)
- Improved start time input for music labelling (hopefully it makes it a better usable experience)
- Refactor into typescript
- Fixed channel page video not updating sometimes
- fixed scrollbar for firefox on the left hand side...
- fixed pull for refresh


### 2.3 Holodex [*March 30th, 2021*]
##### New Features
- #113 Moved Live-Chat TL button into the control bar, it looks SUPER NICE now. Thanks Relix
- German, Brazillian, Malay and Indonesian TL updates

##### Bugfixes
- fixed notch problems on installed Holodex apps on first launch (might need a reinstall)
- fixed multiview adding goes down. now it goes to the right
- brought back picture in picture continuity @Amelianaire~ Holodex’s Head Maid 
- fixed some TL issues.
- TL updates!!!! <3
- Regularly refreshes Home / Favorites when you navigate to them



### 2.2 Holodex [*March 29th, 2021*]
##### New Features
- **New German Locale**
- **You can now delete / update your own songs / music entries.**
- Export to csv now have date (as suggested by a user @Vordox)
- Localization updates from Mar 26 ~ 29 (THANK YOU TRANSLATORS <3)
- Open on Youtube setting no longer stops you from being able to watch videos on Holodex

##### Bugfixes:
- #92 fix past dates not being localized
- #96 fix music editor zeros
- #98 fix-channel-video not updating
- #101 iOS watch page safety area
- Fixed some click-through issues where clicking a music artist punchout is causing playback
- Frontend code is now typescript compliant #103 (+build fixes)

### 2.1 Holodex V2.1 Main Features [*March 26th, 2021*]
##### Comprehensive Site Upgrade
- Added MultiView functionality, with customizable layouts supporting everything a DD wants. Also works on mobile, if your phone is powerful enough (on some mobile devices and platforms, you can only hear one stream's audio, but can play multiple videos.).
- Isolated Stream-Translations chat built into Mobile and Desktop views, you can also get Live-TL-esque features on Mobile (and desktop).
- Massive improvements to mobile experience.
- Removed top status bar from the App version of the website, but may require a reinstall for some platforms.
- Added Music Player / Music Curation platform. You can browse, search, and listen to karaoke streams / covers as if it is Spotify. Best part is, the views go towards the singer (instead of clippers who split the Karaoke stream into pieces). Everyone can contribute and create music annotations, so feel free to help out your oshi by tagging their karaoke songs.
- Normal users are now able to add topics (and music) annotation to videos. If you want us to add new topics into Holodex, please join our discord and recommend it!
- Editors are now more powerful on Holodex, being able to change topics and delete/update song information. Users interested in becoming Holodex editors should talk to us on discord.
- Made light mode pretty
- Logged in users can now request for an API Key on the Account page, we will require API Key for CORS requests into Holodex backend in the short future. 

New Localizations:
- Added pt-BR locale.

Bugfixes:

- Twitter login works again!
- Cleaned up video export to Youtube with a guide
- We now check when a video use @CHANNEL NAME in description to mention vtubers.
- Improved usability across the website.



### 2.0.1 Holodex [*January 29th, 2021*]
- Added ability to change video thumbnail/grid sizes for Home/Favorites (use the icon on the top right)
- Added setting to enable/disable autoplay videos
- Added French localization
- Added ScrollMode setting to switch between infinite scroll loading and page by page navigation
- Frontend is now open source!
- Fixed lots of bugs and introduced new ones probably

                    
                    
                    
### 2.0 Holodex [*January 20th, 2021*]
##### Comprehensive Site Upgrade
 - Massive upgrade to support over 600+ Vtuber channels and 1000+ clipping channels
 - Added user accounts to sync favorites across devices
   - Added support for tracking clippers in a variety of languages, head over to the settings to set the langauges you want to see clips in
 - Added topics to each list and improved search
 - New and improved watch page with theather mode and top comments
   - Laid groundwork for more features in the future, including a new user contributed tagging system, song tracking and more!
                        

### 1.? Holodex [*November 2nd, 2020*]
                    
- Hotfix video duration
- Added more sorting options and card view to Channels page
- Added Hololive generation/group name to each Vtuber
- Added filtering by official/clips for favorites page
- Added loading screen and errors to all the pages
- Clicking on the same page on desktop now refreshes the page
- Inactive vtuber channels are now hidden, but you can still view them through the search bar
- Add hide live chat button
- General under the hood improvments
                    

### 1.? Holodex [*October 20th, 2020*]
- Added instructions on how to use Holodex like an app
- Added a <a href="https://github.com/RiceCakess/Holodex/issues"> Github Issue Tracker </a>

