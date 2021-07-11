// /* eslint-disable no-shadow */
// import api from "@/utils/backend-api";

// const initialState = {
//     orgsPrefixes: {
//         "Atelier Live": "Atelier",
//         Chukorara: "Chuko",
//         "Eilene Family": "Eilene",
//         "Hanayori Joshiryo": "Hana",
//         Hololive: "Holo",
//         Independents: "Indie",
//         "Kizuna Ai Inc.": "Kizuna",
//         Marbl_s: "Marbl",
//         Nijisanji: "Niji",
//         Masquerade: "Masq",
//         "Riot Music": "Riot",
//         "Nori Pro": "Nori",
//         "Aogiri Highschool": "Aogiri",
//         KAMITSUBAKI: "KT",
//         "VOICE-ORE": "V.O.",
//         "Hoshimeguri Gakuen": "Stellar",
//         "V Dimension.Creators": "VDC",
//         Tsunderia: "Tsun",
//         "Unreal Night Girls": "UNG",
//         "X enc'ount": "X'",
//         "Yuni Create": "Yuni",
//         "All Vtubers": "Vtuber",
//     },
//     isLoading: true,
// };

// export const state = { ...initialState };

// const getters = {
//     getLogoPrefix(state) {
//         return (name) =>
//             (state.orgsPrefixes[name] || name);

//     }
// };

// const actions = {
//     fetchOrgs({ state, commit }) {

//         commit("fetchStart");
//         return api
//             .orgs()
//             .then(({ data }) => {
//                 commit("setOrgs", data);
//                 commit("fetchEnd");
//             })
//             .catch((e) => {
//                 console.error(e);
//             });
//     },
// };

// const mutations = {
//     fetchStart(state) {
//         state.isLoading = true;
//     },
//     fetchEnd(state) {
//         state.isLoading = false;
//     },
//     fetchError(state) {
//         state.hasError = true;
//         state.isLoading = false;
//     },
//     setId(state, id) {
//         state.id = id;
//     },
//     setOrgs(state, channel) {
//         state.channel = channel;
//     },
//     resetState(state) {
//         Object.assign(state, initialState);
//     },
// };

// export default {
//     namespaced: true,
//     state,
//     getters,
//     actions,
//     mutations,
// };
