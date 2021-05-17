export default function ({ element, onpanstart, onpanmove, onpanend }) {
    let touchId, startX, startY, panstartCalled;

    function calcMovement(e) {
        const touch = Array.prototype.slice.call(e.changedTouches).filter((touch) => touch.identifier === touchId)[0];
        if (!touch) return false;

        e.deltaX = touch.screenX - startX;
        e.deltaY = touch.screenY - startY;
        return true;
    }

    function touchstart(e) {
        const touch = e.changedTouches[0];
        touchId = touch.identifier;
        startX = touch.screenX;
        startY = touch.screenY;
    }

    function touchmove(e) {
        if (calcMovement(e)) {
            if (onpanstart && !panstartCalled) {
                onpanstart(e);
                panstartCalled = true;
            }

            onpanmove(e);
        }
    }

    function touchend(e) {
        if (calcMovement(e)) onpanend(e);
    }

    element.addEventListener("touchstart", touchstart);
    if (onpanmove) element.addEventListener("touchmove", touchmove);
    if (onpanend) element.addEventListener("touchend", touchend);

    return function () {
        element.removeEventListener("touchstart", touchstart);
        if (onpanmove) element.removeEventListener("touchmove", touchmove);
        if (onpanend) element.removeEventListener("touchend", touchend);
    };
}
