import WatchInfo from "@/components/watch/WatchInfo";
import backendApi from "@/utils/backend-api";

export default {
    title: "Watch/WatchInfo",
    component: WatchInfo,
    argTypes: {
        // backgroundColor: {
        //     control: "color",
        // },
        // size: {
        //     control: {
        //         type: "select",
        //         options: ["small", "medium", "large"],
        //     },
        // },
        video: { control: "object" },
    },
};

const Template = (args, { loaded: { video } }) => {
    console.log(video);

    return {
        props: { video },
        components: {
            WatchInfo,
        },
        template: '<div>{{video}}<watch-info v-if="video" :video="video" /></div>',
    };
};

export const Primary = Template; // .bind({});
Primary.loaders = [
    async () => {
        return { video: (await backendApi.video("sRVpQ-zTcrc")).data };
        // label: "Button",
    },
];
