import { downloadBinaries } from "ffbinaries";
global.splashScreenTimesShown = global.splashScreenTimesShown || 0
window.setImmediate = process.nextTick
global.setImmediate = process.nextTick

if (nw.Window.get()) {
    nw.Window.get().hide()
}
nw.Window.get().on('close', function () {
    if (process.env.NODE_ENV === 'development') {
        this.hide();
    } else {
        this.close(true);
    }
});

const showSplashWindow = () => new Promise((resolve) => {
    nw.Window.open('./splash.html', {
        "transparent": true,
        'frame': false,
        'position': 'center',
        'always_on_top': true,
        "width": 512,
        "height": 512,
        "resizable": false,
        "fullscreen": false
    }, resolve)
});

const downloadFFBinaries = () => new Promise((resolve, reject) => {
    downloadBinaries(['ffmpeg', 'ffprobe'], {
        destination: nw.App.getDataPath(),
        tickerFn: console.log
    }, (err, files) => {
        if (err) return reject(err);
        return resolve(files)
    })
});

(async function () {

    if (global.splashScreenTimesShown === 0) {
        const splashWin = await showSplashWindow()
        global.splashScreenTimesShown++
        await downloadFFBinaries()
        await import(/* webpackChunkName: "app" */"./main")

        splashWin.window.postMessage('supermini::start')
        window.addEventListener("message", (event) => {
            if (event && event.data === 'supermini::end') {
                nw.Window.get().show();
                splashWin.close();
            }
        }, false);
    }else{
        await downloadFFBinaries()
        await import(/* webpackChunkName: "app" */"./main")
        nw.Window.get().show();
    }


})();