const b64 = "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/=";
/**
 * Encodes a layout array and contents to a compact URI
 * @param {{layout, contents}} layout and layout contents
 * @returns {string} encoded string
 */
export function encodeLayout({ layout, contents }) {
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

            if (!invalid) {
                if (contents[item.i]) {
                    const { type, content } = contents[item.i];
                    if (type === "chat") {
                        encodedBlock += "chat";
                    } else if (type === "video") {
                        encodedBlock += content.id + content.channel.name.split(" ")[0].replace(",", "");
                    }
                }
                l.push(encodedBlock);
            }
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
 * @returns {{layout, contents}} layout and layout contents as array and object
 */
export function decodeLayout(encodedStr) {
    const parsedLayout = [];
    const parsedContent = {};
    encodedStr.split(",").forEach((str, index) => {
        const xywh = str.substring(0, 4);
        const idOrChat = str.substring(4, 15);
        const channelName = str.substring(15);

        const keys = ["x", "y", "w", "h"];
        const layoutItem = {};
        xywh.split("").forEach((char, keyIndex) => {
            const num = b64.indexOf(char);
            layoutItem[keys[keyIndex]] = num;
        });
        layoutItem.i = index;

        parsedLayout.push(layoutItem);

        if (idOrChat === "chat") {
            parsedContent[index] = {
                type: "chat",
            };
        }

        if (idOrChat.length === 11) {
            parsedContent[index] = {
                type: "video",
                content: {
                    id: idOrChat,
                    channel: {
                        name: channelName,
                    },
                },
            };
        }
    });
    return {
        layout: parsedLayout,
        content: parsedContent,
    };
}
