import SongItem from "@/components/media/SongItem";

export default {
    title: "Media/SongItem",
    component: SongItem,
    argTypes: {
        backgroundColor: {
            control: "color",
        },
        size: {
            control: {
                type: "select",
                options: ["small", "medium", "large"],
            },
        },
    },
};

const Template = (args, { argTypes }) => ({
    props: Object.keys(argTypes),
    components: {
        SongItem,
    },
    template: '<song-item v-bind="$props" />',
});

export const Primary = Template.bind({});
Primary.args = {
    song: {
        itunesid: 31242,
    },
    // label: "Button",
};
