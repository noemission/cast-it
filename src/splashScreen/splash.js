import "./splash.css";
let ninja = window.document.getElementById('ninja');
let scale = 0.9
const superMini = (cb) => {
    scale = scale - 0.01;
    if (scale < 0) return cb();
    ninja.style.transform = `scale(${scale})`
    requestAnimationFrame(() => superMini(cb))
}

window.addEventListener("message", function (event) {
    console.log(event)
    if (event && event.data === 'supermini::start') {
        requestAnimationFrame(() => superMini(() => {
            event.source.postMessage('supermini::end')
        }))
    }
}, false);
