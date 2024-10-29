import React, { lazy } from "react";
import { Route, Navigate } from "react-router-dom";
import { getDefaultStore } from "jotai";
import { orgAtom } from "@/store/org";
import { Frame } from "@/components/layout/Frame";
import { NavigateToMusicdex } from "@/components/channel/NavigateToMusicdex";

const Favorites = lazy(() =>
  import("./favorites/favoritesHome").then((module) => ({
    default: module.FavoritesHome,
  })),
);
const Home = lazy(() =>
  import("./home/home").then((module) => ({ default: module.Home })),
);
const ChannelsOrg = lazy(() =>
  import("./orgChannels").then((module) => ({ default: module.ChannelsOrg })),
);
const Channel = lazy(() =>
  import("./channel").then((module) => ({ default: module.Channel })),
);
const ChannelVideos = lazy(() => import("./channel/ChannelVideos"));
const ChannelAbout = lazy(() => import("./channel/ChannelAbout"));
const EditVideo = lazy(() =>
  import("./editVideo").then((module) => ({ default: module.EditVideo })),
);
const Settings = lazy(() =>
  import("./settings").then((module) => ({ default: module.Settings })),
);
const SettingsLang = lazy(() =>
  import("./settings").then((module) => ({ default: module.SettingsLang })),
);
const SettingsTheme = lazy(() =>
  import("./settings").then((module) => ({ default: module.SettingsTheme })),
);
const SettingsUser = lazy(() =>
  import("./settings").then((module) => ({ default: module.SettingsUser })),
);
const SettingsHomepage = lazy(() =>
  import("./settings").then((module) => ({
    default: module.SettingsContentPreferences,
  })),
);
// const SettingsBlocked = lazy(() =>
//   import("./settings").then((module) => ({ default: module.SettingsBlocked })),
// );
// const SettingsOrgs = lazy(() =>
//   import("./settings").then((module) => ({ default: module.SettingsOrgs })),
// );
const Playlists = lazy(() =>
  import("./playlists").then((module) => ({ default: module.Playlists })),
);
const About = lazy(() =>
  import("./about").then((module) => ({ default: module.About })),
);
const AboutGeneral = lazy(() =>
  import("./about").then((module) => ({ default: module.AboutGeneral })),
);
const AboutChangelog = lazy(() =>
  import("./about").then((module) => ({ default: module.AboutChangelog })),
);
const AboutFaq = lazy(() =>
  import("./about").then((module) => ({ default: module.AboutFaq })),
);
const AboutRequest = lazy(() =>
  import("./about/request").then((module) => ({
    default: module.AboutRequest,
  })),
);
const AboutPlaceholder = lazy(() =>
  import("./about/placeholder").then((module) => ({
    default: module.AboutPlaceholder,
  })),
);
const AboutExtensions = lazy(() =>
  import("./about").then((module) => ({ default: module.AboutExtensions })),
);
const AboutContact = lazy(() =>
  import("./about").then((module) => ({ default: module.AboutContact })),
);
const AboutPrivacy = lazy(() =>
  import("./about").then((module) => ({ default: module.AboutPrivacy })),
);
const Kitchensink = lazy(() =>
  import("@/Kitchensink").then((module) => ({ default: module.Kitchensink })),
);
const Login = lazy(() =>
  import("./login").then((module) => ({ default: module.Login })),
);
const TLEditorPage = lazy(() =>
  import("./tleditor").then((module) => ({ default: module.TLEditorPage })),
);
const Watch = lazy(() =>
  import("./watch").then((module) => ({ default: module.Watch })),
);
const ResetClientPage = lazy(() =>
  import("./debug").then((module) => ({ default: module.ResetClientPage })),
);
const Playlist = lazy(() => import("./playlist"));

const Search = lazy(() =>
  import("./search").then((module) => ({ default: module.Search })),
);

const store = getDefaultStore();

export const routes = (
  <Route path="/" Component={Frame}>
    <Route path="favorites" Component={Favorites} />
    <Route path="search" Component={Search} />
    <Route path="org/:org" Component={Home} />
    <Route
      path="channels"
      element={<Navigate to={`/org/${store.get(orgAtom)}/channels`} />}
    />
    <Route path="org404" element={<div>OrgNotFound</div>} />
    <Route
      path="add_placeholder"
      element={<Navigate to="/about/placeholder" />}
    />
    <Route
      path="add_placeholders"
      element={<Navigate to="/about/placeholder" />}
    />
    <Route path="org/:org/channels" Component={ChannelsOrg} />
    <Route path="channel/:id" Component={Channel}>
      <Route index element={<ChannelVideos type="videos" />} />
      <Route path="about" Component={ChannelAbout} />
      <Route path="clips" element={<ChannelVideos type="clips" />} />
      <Route path="collabs" element={<ChannelVideos type="collabs" />} />
      <Route path="music" element={<NavigateToMusicdex />} />
    </Route>
    <Route path="edit/video/:id" Component={EditVideo} />
    <Route path="profile" element={<div>Profile</div>} />
    <Route path="settings" Component={Settings}>
      <Route index Component={SettingsLang} />
      <Route path="lang" Component={SettingsLang} />
      <Route path="appearance" Component={SettingsTheme} />
      <Route path="user" Component={SettingsUser} />
      <Route path="content" Component={SettingsHomepage} />
      {/* <Route path="blocked" Component={SettingsBlocked} />
      <Route path="orgs" Component={SettingsOrgs} /> */}
    </Route>
    <Route path="playlists" Component={Playlists} />
    <Route path="playlist/:id" Component={Playlist} />
    <Route path="about" Component={About}>
      <Route index Component={AboutGeneral} />
      <Route path="general" Component={AboutGeneral} />
      <Route path="changelog" Component={AboutChangelog} />
      <Route path="faq" Component={AboutFaq} />
      <Route path="request" Component={AboutRequest} />
      <Route path="placeholder" Component={AboutPlaceholder} />
      <Route path="extensions" Component={AboutExtensions} />
      <Route path="contact" Component={AboutContact} />
      <Route path="privacy" Component={AboutPrivacy} />
    </Route>
    <Route path="kitchensink" Component={Kitchensink} />
    <Route path="login" Component={Login} />
    <Route path="tlclient" element={<div>Translation Client</div>} />
    <Route path="scripteditor" Component={TLEditorPage} />
    <Route path="watch/:id" Component={Watch} />
    <Route path="debug" Component={ResetClientPage} />
    <Route path="debug/run" element={<div>Debug Run</div>} />
    <Route path="*" element={<div>Not found</div>} />
  </Route>
);
