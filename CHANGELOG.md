<!-- ### Holodex Beta -->

### 2.21.1 Holodex [*Oct 12, 2021*]

### Bugfixes
- Placeholders will default to using the channel avatar if a thumbnail is not present.
- Align cards to top for Video Cards (ty for report Angel)
- Fix deleting Multiview Saved Preset Layouts.
- MV archived chat should be more stable now. Themes are still screwed up for archived chat. (It follows your system color theme)
- Misc. other fixes

### 2.21 Holodex [*Oct 10, 2021*]

#### New

- Added future scheduling capacity to Holodex. This allows non-Youtube events and streams to show up in Home and Favorites. They will not persist in archives (@sphinxrave, @RiceCakess)
  - Not archiving will reduce moderation complexity, as these are user contributed items
  - We are still reliant on a YouTube based video+channel structure. There are currently no plans & developer human resource to go beyond YouTube support.
- Calendar API: offers subscribable calendars for upcoming streams & events (@uetchy)
- [Holodex Plus](https://holodex.net/extension): Chrome/Firefox extension that improves watch experience on Holodex (@Relix, @RiceCakess)
  - Enables Archive Live chat on Watch and Multiview
  - Allows liking videos from Holodex watch page
  - Fixes memory leak in Youtube's live chat
  - Fixes experimental flags on Youtube player (Like disabling multiple streams, waiting room thumbnail not showing) and more!

#### Improvements

- Altered Music Trending to use a more time sensitive Hot ranking (@uetchy, @sphinxrave)
- Click a topic on the watch page to discover more stream/videos (@uetchy)
- Dropdown menu on videos now allows you to add/remove them for all your playlists (@sphinxrave)

##### Patches & Bugfixes

- Fixed resizing code for music artwork (@Shiaupau)
- Fixed the popping for MusicBar when it's pinned (@SnowNeko9)
- Fixed various issues with avatars not displaying on the site.

--------

### 2.20 Holodex [*September 27th, 2021*]

- Added Highlight Moments bar to watch page (@uetchy)
- TLdex has option to show chat in local time (i.e. 4:23:15 PM) (@SnowNeko9)
- Added bookmarklet in the About page (Add to bookmark bar to open Youtube videos in Holodex) (@uetchy)
- Added Thai language (@SnowNeko9)
- Music bar now autohides (@SnowNeko9)

##### Patches & Bugfixes

- Support for Retina display (@uetchy)
- Fix channel icon missing in multiview controls (@stu43005)
- Clicking on the Add cell button will cycle through auto layouts
- Fixed add to playlist ignoring blocked channels (@stu43005)
- Fixed advanced search orgs drop down (@stu43005)
- Adding multiview video always fills from the left now

### 2.19 Holodex [*September 13th, 2021*]

##### New Features

- Added Multiview preset quick switch (@RiceCakess)
- Added some extra hints for lesser known multiview features (@RiceCakess)
- Added many new preset layouts extending to 16 videos (@sphinxrave)
- Added language **`lol-UWU`** thanks to Doubleturtle ❤️❤️❤️. Due tuwu the expewimentaw natuwe of the **uwu** wanguage, we might have sowme bugs, so pwease wepowt thewm in the discowd. We'we wooking for twanslatows to wwork on the fowwowing wanguages:
  - **Spanish** (**es-ES** and **es-MX**)
  - **PEKO English** (please help translate Holodex peko!)

##### Patches & Bugfixes

- Improved multiview cells and cell control (@RiceCakess)
- Fixed logo ignoring default page setting (@RiceCakess)
- Added a bulk edit menu for Holodex editors (@uetchy)
  - We're always looking for more editors, since we have grown beyond 800 vtubers. If you're passionate about helping your oshi organize clips and music about them, or just about data quality on Holodex in general, feel free to contribute as you are (users can add music and tag mentioned channels), but if you're finding yourself doing it a LOT, and would like tools/bots to make it even easier, come ask us to become an editor! If you're an editor already, join the discord!
- Added ability to _filter by date_ on the home and favorites screens (@sphinxrave)
- Deleted clips no longer show up on VTuber's **Clips** Tab (@uetchy)

### 2.18.1 Holodex [*September 4th, 2021*]

##### New Features

- Refactor of the Multiview Cells. "**Mute all but one stream**" option added to Multiview Media Controls.
- MultiView precise volume control added to Media Controls

##### Patches & Bugfixes

- Fixing Search Engine viewing Holodex

### 2.18.0 Holodex [*August 27st, 2021*]

##### New Features

- Custom Twitch and Youtube urls are saved in the history

##### Patches & Bugfixes

- Fixed Twitter login
- Fixed search inputs too sensitive

### 2.17.3 Holodex [*August 21st, 2021*]

##### New Features

- Clicking on Archive Translation jumps to time

##### Patches & Bugfixes

- Hiding collabs setting works on both Home and Favorites now
- Fixed Tldex icon issue with Youtube Gaming icons
- Archive translation centers a little better
- Can full screen music player again
- Fixed videocard icon color in light mode
- Fixed multiview hover shrinking (thanks MegamanZen#9804)
- Fix misc errors (thanks Shiaupiau#0520)
- Fixed reset all settings

### 2.17.2 Holodex [*August 2nd, 2021*]

##### New Features

- Music player now has keyboard controls for `m`, `j`, `l`, `k` (Thanks @akiroz)
- Streams that has an active live (at least 3 messages in last 30 mins) chat translators are marked
- Archived videos now display the total amount of live chat translations recorded

##### Patches & Bugfixes

- Hot fix for reporting video

### 2.17.1 Holodex [*August 2nd, 2021*]

##### Bugfixes

- Hot fix for clip page not loading when "Hide collab stream setting is enabled"

### 2.17 Holodex [*August 1st, 2021*]

##### New Features

- New changelog (you're reading it)
- New About page (you're probably reading it)
- Fast forward / Sync button in multiview media controls to speed up all streams to 'live'.

##### Patches & Bugfixes

- Slightly changed Multiview logic, you shouldn't notice it.
- Fixed Music page blank if you've never used it before
- Support for this one person who's using Chrome 70.

### 2.16 Holodex [*July 30th, 2021*]

##### New Features

- You can now background music videos while browsing! Click the theater mode button on the music playback bar.
- Korean TLdex support

##### Patches

- Reporting videos error fixed.
- Music table is now easier to read on mobile

##### Bugfixes

- Channel blocklists now apply to Multiview top bar.
- Fixed music playlist autoscroll to current video

### 2.15 Holodex [*July 27th, 2021*]

##### New Features

- Topics can now be filtered from the settings (Thanks @ajhall)
- Settings page has been renewed with a fresh coat of paint
- Hovering over video time and channel will give the full time/name

##### Patches

- Twitch no longer autoplays when added
- License Updated.... to current year :Inayaya: (Thanks @Zeryther)
- Added translations to missing UI elements (Thank you translators!)

##### Bugfixes

- Fixed Twitch media controls
- Fixed Okayu and Pekora theme having hard to see text

#### Other

- We adopted an @stu43005's holodex-api client as the official js client. Check it out [here](https://github.com/HolodexNet/holodex-api)
- Welcomed two new members to the team, @stu43005 and @uetchy!

### 2.14 Holodex [*July 16th, 2021*]

##### New Features

- Added many more theme colors (Thanks I'm Rinsen.#0975)
- Added multiview media controls to pause/play/mute/delete each or all videos playing
- Autolayout is now fully configurable from the preset menu
- Updated the organization selector in multiview to match rest of site
- Added British and Canadian English for chaning time formatting YYYY-mm-dd or dd-mm-yy
- Channels page will show the top 3 topics that a vtuber plays/does

##### Patches

- Multiview chat windows scale down according to size
- Music autoplays in the background, and skips dead songs
- Multiview chat cells now flip to different streams when added

##### Bugfixes

- Fix twitch link sharing
- Fix auto update on multiview
- Fix watch page stuck on theather mode
- and many more bugfixes introduced from last update(s)

### 2.13.1 Holodex [*July 13th, 2021*]

##### Patches

- Stabilization of playlists feature. Rarely you might've had trouble saving playlists, should be all fixed now.
- Added some more Google Analytics events so we can get better idea of how users are using our site! (e.g. which features are popular?) Since we don't even have ads on this website, please whitelist us on your adblocker.
- Refactored MultiView Toolbar, components, more code sharing
- Better editor tooling
- Adding new orgs can now happen without a UI release.

##### Bugfixes

- Light mode white text problems
- Miscellaneous fixes

### 2.13 Holodex [*July 4th, 2021*]

(\*_Holodex is still recruiting! See our twitter, or scroll down!_)

💬 From the developers:

> Sorry for the long gap between updates, we weren't too sure about the direction behind our playlist design, so please tell us if you have any design experience and want to improve the site UX flow.
>
> Release will continue to be slow while we split attention into the large music feature (maybe playlists, sharables, recommendations, artist-radio and more), please keep tagging your favorite karaokes and songs!

##### New Features

- **Massive Playlist feature updated**! Share your playlists with everyone.
- Library function has become Playlists instead. Please login to save playlists for your account.
- **VOD TLdex Replay** has been added, tell us what you think!
- **Home page live data now auto update**.

##### Patches

- Searching for multiple orgs on the search bar now looks for collabs between orgs. Try {org: Hololive} + {org: Nijisanji}
- Unrelated clips and uploads are now hidden from All Vtubers' (Vtuberdex) clips page.

##### New Locales

- Added **Turkish** and **Hungarian** locales! Thank you so much translators.
- **French** is finally back up to 100%!

### Holodex is recruiting📣!

[Find out more here](https://twitter.com/holodex/status/1405637847831302144)

![img](https://raw.githubusercontent.com/RiceCakess/Holodex/dev/docs/holodex%20roles.png)

==============

### 2.12 Holodex [*June 18, 2021*]

##### New Features

- Collabs are now highlighted on holodex home and favorites screens.
- Can collapse sidebar for watch pages to avoid spoilers from clips, or remove a really long song list.
- You can now load the Chat TL history of a whole stream instead of only seeing the last 20 lines. **We're working on bringing it to offline/historical streams as well**, please wait for future updates!

##### Patches

- German language improvements, thanks Doubleturtle!
- Trying to decrease the times channel icons don't load on the website

### 2.11.8 Holodex [*June 9, 2021*]

##### Patches

- In honor of Coco-chan, we added a **Coco theme** to Holodex!
- [You can now drag and drop videos to MultiView cells from youtube and holodex](https://github.com/RiceCakess/Holodex/pull/281)
- [Scrollbar and Gutter adjustment for MultiView](https://github.com/RiceCakess/Holodex/pull/280)
- Fixed bug when you use custom presets and you delete a 2-video preset and it doesn't go to a 1-video preset.
- Fixed the system shunting you over to Favorites main page by default after a while. Oops.

##### Org changes

- (+) WACTOR org has been added

### 2.11.7 Holodex [*June 1, 2021*]

> Devs are on break! (Well one of them is just too busy playing factorio) 😁 However, we're still accepting pull requests from the community!

##### Patches

- [Fix tab swiping hash/page query, use hash/page query when Home/Favorite view is activated](https://github.com/RiceCakess/Holodex/pull/274)
- [Fix MultiView button in Watch for certain vtubers](https://github.com/RiceCakess/Holodex/pull/277)

##### QOL

- [Add recommended extensions of vscode](https://github.com/RiceCakess/Holodex/pull/275)

### 2.11.6 Holodex [*May 28, 2021*]

##### Patches

- Fix entering page numbers in the url
- Fix DexTL not connecting to more than one stream on multiview

### 2.11.5 Holodex [*May 26, 2021*]

##### Org changes

- Virtual Witch Phenomenon -> Kamitsubaki
- (+) Hoshimeguri Gakuen
- (+) ProPro
- (+) VOICE-ORE
- (+) Unreal Night Girls
- (-) Hanayori Joshiryoku
- Some changes may take a while to fully deploy across the website, please wait while our database self heals.

##### Patches

- We've been upgrading our backend all week! You should be noticing more immediate channel going live or ending.
- Again, we've released our API documentation in the About page.

### 2.11.2, 2.11.3, 2.11.4 Holodex [*May 21, 2021*]

##### Patches

- Added a dialog specifically for reporting a certain controversial channel.
- Released it three times coz the dev is coding while distracted.
- Significant figures rounding to 3-sig-figs on Channels list.

### 2.11.1 Holodex [*May 21, 2021*]

##### New Features

- Added a feature to add streams to Google calendar, thanks @creeperkafasipw for the implementation, and @Kuro#5384 for writing the original Userscript!
- Added a feature to customize orgs in the Org selector.

##### Patches

- Patched a regression to the Open on Youtube setting where clicking cards were always opening youtube instead of as described.
- Added role to usercard for editors
- Fixed double comments on ipad-sized screens.
- Fixed clips page sometimes not loading on very large screens with small grid.
- When reporting now you have the option to also block the channel across Holodex.

### 2.11 Holodex [*May 20, 2021*]

##### New Orgs

- PRISM project has been added
- Nijisanji has been fully organized.

##### Patches

- Added link to our public API documentation.
- Optimized Video Cards to improve draw latency, maybe the site will be a bit smoother?
- Patched multiview background not drawing correctly (Thanks for PR creeperkafasi!)
- Removing streams now use Custom Layout (Thank you Shiaupiau!)
- Improved localizations (Thank you to our translation team!)

### 2.10 Holodex [*May 15, 2021*]

##### New Features

- **New Home Page**. Leave us feedback in discord!
- It's now possible to set MultiView as the home page too in the settings.
- Added library tab to multiview
- Library is pagianted and can be sorted by Date added and upload date

##### Patches

- Music page for All Vtubers org now work, will display music ordered by date they were sang. Searches is limited to Track Name.
- Fixed watch page refreshing when being resized
- Premieres will no longer spoil video length
- Fixed TLs not working when changing languages

### 2.9 & 2.9.1 Holodex [*May 10, 2021*]

##### New Features:

- Added a report button
- Now detects if your browser cannot support third party cookies and notifies you.

##### Site Changes

- Removed **Idol-bu** as an org and folded it into **.LIVE**
- Added **Aogiri High School** org

##### Patches

- Polished the site here and there

### 2.8 Holodex [*May 6th, 2021*]

##### New Features:

- Improved backend TL listener, it should miss less messages now
- Added block user to tl box
- Added history for mod/verified messages
- Added Shion theme
- Changed multilive chat tabs to a dropdown
- Added emoji support for tl box

##### Patches

- Fix multiview Twitch chat dark mode
- Fix page title

### 2.7 Holodex [*May 2nd, 2021*]

##### New Features:

- You can now save layout for Multiview (#205)
- We added themes support (check it out in the settings), drop by the discord and suggest new themes for us :D

##### Patches

- Fixes to TL box not sticking to bottom
- Multiview videos being unmuted when changing layouts
- Multiview channel icons disappearing randomly

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
