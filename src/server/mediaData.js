const ffmpeg = require('fluent-ffmpeg');
const os = require('os');
const fs = require('fs');
const path = require('path');
const EventEmitter = require('events');
const slugify = require('@sindresorhus/slugify');
const { getBinaryFilename, detectPlatform } = require('ffbinaries');

const ffmpegPath = path.resolve(nw.App.getDataPath(), getBinaryFilename('ffmpeg', detectPlatform()))
const ffprobePath = path.resolve(nw.App.getDataPath(), getBinaryFilename('ffprobe', detectPlatform()))
fs.chmodSync(ffmpegPath, '111')
fs.chmodSync(ffprobePath, '111')

ffmpeg.setFfmpegPath(ffmpegPath)
ffmpeg.setFfprobePath(ffprobePath)

class ScreenshotsCache {
    constructor() {
        this._cache = []
    }
    add(filePath, position, screenshot) {
        if (this.get(filePath, position)) this.remove(filePath, position);
        this._cache.push({ filePath, position, screenshot });
    }
    get(filePath, position) {
        return (this._cache.find(screenshot => screenshot.filePath === filePath && screenshot.position === position) || {}).screenshot;
    }
    remove(filePath, position) {
        let index = this._cache.findIndex(screenshot => screenshot.filePath === filePath && screenshot.position === position);
        if (index > -1) this._cache.splice(index, 1);
    }
}
const screenshotsCache = new ScreenshotsCache();
window.screenshotsCache = screenshotsCache;

export const getMetaData = (filePath) => {
    return new Promise((resolve, reject) => {
        ffmpeg.ffprobe(filePath, (err, data) => {
            if (err) return reject(err);
            console.log(data)
            return resolve(data);
        });
    })
}

export const generateScreenshots = (filePath) => {

    const myEmitter = new EventEmitter();
    let isCanceled = false;
    (async () => {
        for (let i = 5; i <= 95; i += 15) {
            if (!screenshotsCache.get(filePath, i)) {
                try {
                    screenshotsCache.add(filePath, i, await takeScreenshot(filePath, i + '%'))
                } catch (error) {
                    console.error(error)
                }
            }
            process.nextTick(() => myEmitter.emit('screenshot', screenshotsCache.get(filePath, i)))
            if (isCanceled) break;
        }
        process.nextTick(() => myEmitter.removeAllListeners())

    })();

    myEmitter.cancel = () => isCanceled = true;
    window.xxx = myEmitter;
    return myEmitter

}

const takeScreenshot = (filePath, timestamp) => {
    const screenshots = [];

    return new Promise((resolve, reject) => {
        ffmpeg(filePath)
            .on('filenames', function (filenames) {
                if (filenames && filenames.length) {
                    screenshots.push(path.resolve(os.tmpdir(), filenames[0]))
                }
            })
            .on('end', function () {
                console.log('Screenshots taken');
                resolve(...screenshots);
            })
            .on('error', reject)
            .screenshots({
                count: 1,
                timestamps: [timestamp],
                folder: os.tmpdir(),
                filename: `${slugify(path.basename(filePath))}-${timestamp.replace('%', '')}.jpg`,
            });
    })

}