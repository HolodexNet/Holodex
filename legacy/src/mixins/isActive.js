export default {
    data() {
        return {
            isActive: true,
        };
    },
    activated() {
        this.isActive = true;
    },
    deactivated() {
        this.isActive = false;
    },
};
