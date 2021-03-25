export default {
    data() {
        return {
            doneCopy: false,
        };
    },
    methods: {
        async copyToClipboard(data) {
            await navigator.clipboard.writeText(data);
            this.doneCopy = true;
            setTimeout(() => {
                this.doneCopy = false;
            }, 2000);
        },
    },
};
