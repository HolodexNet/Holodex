import type { LayoutItem } from "@/external/vue-grid-layout/src/helpers/utils";

export interface Content {
    id?: string;
    type: string;
    isTwitch?: Boolean;
    video?: any;
    currentTab?: number;
    currentTime?: number;
}

const b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789-_.";

export const sortLayout = (a, b) => a.y - b.y || a.x - b.x;

/**
 * Encodes a layout array and contents to a compact URI
 * @param {{layout, contents, includeVideo?}} layout and layout contents
 * @returns {string} encoded string
 */
export function encodeLayout({ layout, contents, includeVideo = false }) {
    const l = [];
    try {
        layout.forEach((item) => {
            let encodedBlock = "";
            let invalid = false;
            ["x", "y", "w", "h"].forEach((key) => {
                if (item[key] >= 64) {
                    invalid = true;
                } else {
                    encodedBlock += b64[item[key]];
                }
            });

            if (invalid) return;

            if (contents[item.i]) {
                const {
                    id, type, video, currentTab,
                } = contents[item.i];
                if (type === "chat") {
                    encodedBlock += `chat${currentTab || 0}`;
                } else if (type === "video" && includeVideo) {
                    if (video?.type === "twitch") {
                        encodedBlock += `twitch${id}`;
                    } else {
                        encodedBlock += id;
                    }
                }
            }
            l.push(encodedBlock);
        });
        return l.join(",");
    } catch (e) {
        console.error(e);
        return "error";
    }
}

/**
 * Decodes a string to layout array and contents
 * @param {string} encodedStr encoded string
 * @returns {{layout, content}} layout and layout contents as array and object
 */
export function decodeLayout(encodedStr) {
    const parsedLayout: LayoutItem[] = [];
    const parsedContent: Record<number, Content> = {};
    let videoCellCount = 0;
    const parts = encodedStr.split(",");
    parts.forEach((str, index) => {
        const xywh = str.substring(0, 4);
        const idOrChat = str.substring(4, 15);
        const isChat = idOrChat.substring(0, 4) === "chat";
        const isTwitch = idOrChat.substring(0, 6) === "twitch";
        const channelName = str.substring(15);

        const keys = ["x", "y", "w", "h"];
        const layoutItem: LayoutItem = {
            w: 0,
            h: 0,
            x: 0,
            y: 0,
            i: index,
            isDraggable: true,
            isResizable: true,
            moved: false,
        };

        xywh.split("").forEach((char, keyIndex) => {
            const num = b64.indexOf(char);
            layoutItem[keys[keyIndex]] = num;
        });
        videoCellCount += 1;
        layoutItem.i = index;
        if (isChat) {
            const currentTab = idOrChat.length === 5 ? Number(idOrChat[4]) : -1;
            parsedContent[index] = {
                type: "chat",
                ...(currentTab >= 0) && { currentTab },
            };
            videoCellCount -= 1;
        } else if (isTwitch) {
            const twitchChannel = str.substring(10);
            parsedContent[index] = {
                type: "video",
                id: twitchChannel,
                isTwitch: true,
                video: {
                    id: twitchChannel,
                    type: "twitch",
                    channel: {
                        name: twitchChannel,
                    },
                },
            };
        } else if (idOrChat.length === 11) {
            parsedContent[index] = {
                type: "video",
                id: idOrChat,
                video: {
                    id: idOrChat,
                    channel: {
                        name: channelName || idOrChat,
                    },
                },
            };
        }
        parsedLayout.push(layoutItem);
    });

    return {
        id: encodedStr,
        layout: parsedLayout,
        content: parsedContent,
        videoCellCount,
    };
}

/**
 * Count the number of empty cells
 * @param {{layout, content}} layout and layout contents
 * @returns {number} count of empty cells
 */
export function getEmptyCells({ layout, content }) {
    return layout.length - Object.values(content).filter((o: Content) => o.type === "chat").length;
}

export const desktopPresets = Object.freeze([
    { layout: "AAYY", name: "1🎞️" },
    { layout: "AAUY,UAEYchat0", name: "Side Chat 1", default: 1 },
    { layout: "AAMY,MAMY", name: "2🎞️", default: 2 },
    { layout: "AARM,RAHYchat0,AMRM", name: "Side Chat 2" },
    { layout: "AAOM,OAFYchat0,TAFYchat0,AMOM", name: "2🎞️, 2💬" },
    { layout: "AAMY,MAMM,MMMM", name: "1🎞️+2", default: 3 },
    { layout: "AAMM,MAMM,AMMM,MMGMchat0,SMGMchat0", name: "3🎞️, 2💬" },
    { layout: "AAMM,MAMM,AMMM,MMMM", name: "2x2🎞️" },
    { layout: "AAKM,KAKM,UAEMchat0,AMKM,KMKM,UMEMchat0", name: "2x2🎞️ 2💬", default: 4 },
    { layout: "AAJM,JADMchat0,MADMchat0,PAJM,AMJM,JMDMchat0,MMDMchat0,PMJM", name: "2x2🎞️ 4💬" },
    { layout: "AAJM,JAJM,SAGYchat0,AMJM,JMJM", name: "2x2🎞️ 1💬" },
    { layout: "AAMP,MAMP,APIJ,IPIJ,QPIJ", name: "5🎞️", default: 5 },
    { layout: "AAIM,IAIM,QAIM,AMIM,IMEMchat0,MMEMchat0,QMIM", name: "5🎞️ 2💬", default: 5 },
    { layout: "AAIM,IAIM,QAIM,AMIM,IMIM,QMIM", name: "2x3🎞️", default: 6 },
    { layout: "AAQQ,QAII,QIII,AQII,IQII,QQII", name: "p1s5" },
    { layout: "AAJM,JAJM,SAGI,SIGI,AMJM,JMJM,SQGI", name: "7🎞️", default: 7 },
    { layout: "AAKM,KAHI,RAHI,KIHI,RIHI,AMKM,KQHI,RQHI", name: "8🎞️", default: 8 },
    { layout: "AAII,IAII,QAII,AIII,IIII,QIII,AQII,IQII,QQII", name: "3 x 3🎞️", default: 9 },
    { layout: "AAGI,GAGI,MAGI,SAGYchat0,AIGI,GIGI,MIGI,AQGI,GQGI,MQGI", name: "3x3🎞️ 1💬" },
    { layout: "AAHI,HAHI,OAHI,VADIchat0,AIHI,HIHI,OIHI,VIDIchat0,AQHI,HQHI,OQHI,VQDIchat0", name: "3x3🎞️ 3💬" },
    { layout: "AAML,MAML,ALGH,GLGH,MLGH,SLGH,ASGG,GSGG,MSGG,SSGG", name: "Among Us 1", default: 10 },
    { layout: "AAKL,KAKL,UAEYchat0,ALFH,FLFH,KLFH,PLFH,ASFG,FSFG,KSFG,PSFG", name: "Among Us 2" },
    { layout: "AASR,SAGYchat0,ARGH,GRGH,MRGH", name: "Sports Fes 1" },
    { layout: "AAMM,MAGG,SAGYchat0,MGGG,AMGG,GMGG,MMGG,ASGG,GSGG,MSGG", name: "Sports Fes 2" },
    { layout: "AAGG,GAMM,SAGG,AGGG,SGGG,AMGG,GMMM,SMGG,ASGG,SSGG", name: "Sports Fes 3" },
    { layout: "AAIK,IAIK,QAIK,AKGH,GKGH,MKGH,SKGH,ARGH,GRGH,MRGH,SRGH", name: "Amoung Us 3", default: 11 },
    { layout: "AAGI,GAGI,MAGI,SAGI,AIGI,GIGI,MIGI,SIGI,AQGI,GQGI,MQGI,SQGI", name: "4x3", default: 12 },
    { layout: "AAMM,MAGG,SAGG,MGGG,SGGG,AMGG,GMGG,MMGG,SMGG,ASGG,GSGG,MSGG,SSGG", name: "13🎞️", default: 13 },
    { layout: "AAJM,JAFG,OAFG,TAFG,JGFG,OGFG,TGFG,AMJM,JMFG,OMFG,TMFG,JSFG,OSFG,TSFG", name: "14🎞️", default: 14 },
    { layout: "AAGG,GAGG,MAGG,SAGG,AGGG,GGGG,MGGG,SGGG,AMGG,GMGG,MMGG,SMGG,ASGG,GSGG,MSGG,SSGG", name: "4x4", default: 16 },
]);

export const mobilePresets = Object.freeze([
    {
        layout: "AAYI,AIYQchat0",
        name: "Mobile 1",
        emptyCells: 1,
        portrait: true,
    },
    {
        layout: "AOYKchat,AAYH,AHYH",
        name: "Mobile 2",
        emptyCells: 2,
        portrait: true,
    },
    {
        layout: "AAYI,AIYI,AQYI",
        name: "Mobile 3",
        emptyCells: 3,
        portrait: true,
    },
    { layout: "MAMY,AAMM,AMMM", name: "Mobile 3L" },
    { layout: "AAMM,AMMM,MAMM,MMMM", name: "Mobile 4", emptyCells: 4 },
]);

export function getDesktopDefaults() {
    const autoLayoutDefaults = [];
    desktopPresets.forEach((preset) => {
        if (preset.default) autoLayoutDefaults[preset.default] = preset.layout;
    });
    return autoLayoutDefaults;
}
