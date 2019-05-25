import { getMetaData, generateScreenshots } from "../../server/mediaData";
import { detectFromFile as detectLanguageFromFile } from "../../server/languageDetection";
import { statSync, readSync, openSync } from "fs";
import { resolve, basename } from "path";
import fileType from "file-type";
import isUrl from "is-url";


const fileToObject = ({ lastModifiedDate, name, path, size, type, }) => ({ lastModifiedDate, name, path, size, type, })
const initialState = {
    video: undefined,
    subtitles: []
};
// const isUrl = (str) => {
//     try {
//         new URL(str);
//         return true;
//     } catch (err) {
//         return false
//     }
// }

const isFilePath = (str) => statSync(str).isFile()

const handleFilePath = (filePath) => {
    const stats = statSync(filePath);
    const chunk = Buffer.alloc(fileType.minimumBytes);
    readSync(openSync(resolve(filePath)), chunk, 0, fileType.minimumBytes)
    const mimeType = (fileType(chunk) || {}).mime

    return {
        lastModifiedDate: stats.atime,
        name: basename(filePath),
        path: resolve(filePath),
        size: stats.size,
        type: mimeType || '',
        isUrl: false,
        isFile: true
    }
}

const handleUrl = (url) => {
    return new Promise((resolve) => {
        const { protocol } = new URL(url);
        let get;

        if (protocol === 'http:') {
            get = require('http').get;
        } else if (protocol === 'https:') {
            get = require('https').get;
        } else {
            console.error('unsuported protocol')
            return resolve({})
        }

        get(url, response => {
            response.on('readable', () => {
                const chunk = response.read(fileType.minimumBytes);
                response.destroy();
                const mimeType = (fileType(chunk) || {}).mime
                return resolve({
                    lastModifiedDate: response.headers["last-modified"],
                    name: decodeURI(url),
                    path: url,
                    size: response.headers["content-length"],
                    type: mimeType || '',
                    isUrl: true,
                    isFile: false
                })
            });
        });
    })
}
let screenshotEmitter;

export const mediaFiles = {
    state: initialState, // initial state
    reducers: {
        // handle state changes with pure functions
        setVideo(state, payload) {
            return { ...state, video: payload }
        },
        setScreenshots(state, payload) {
            if (!state.video) return state;
            return {
                ...state,
                video: {
                    ...state.video,
                    screenshots: Array.from(new Set([
                        ...(state.video.screenshots || []),
                        payload
                    ]))
                }
            }
        },
        setMetadata(state, payload) {
            console.log('state', state)
            console.log('payload', payload)
            if (!state.video) return state;
            return {
                ...state,
                video: {
                    ...state.video,
                    metaData: payload
                }
            }
        },
        addSubtitle(state, payload) {
            return {
                ...state,
                subtitles: [
                    ...state.subtitles,
                    payload
                ]
            }
        },
        removeSubtitles(state, payload) {
            const subs = Array.isArray(payload) ? payload : [payload]
            return {
                ...state,
                subtitles: state.subtitles.filter(s => {
                    return !subs.includes(s.path)
                })
            }
        },
        reset() {
            screenshotEmitter.cancel()
            return initialState
        }
    },
    effects: {
        async setFiles(payload) {
            payload = Array.isArray(payload) ? payload : [payload]
            const data = payload.map(async item => {
                console.log(item)
                if (item instanceof File) {
                    console.log(handleFilePath(item.path))
                    return handleFilePath(item.path);
                } else if (typeof item === 'string') {
                    if (isUrl(item)) {
                        //handle URLs
                        return await handleUrl(item);
                    } else if (isFilePath(item)) {
                        // handle file paths
                        return handleFilePath(item);
                    }
                }
            })
            console.log(data)
            for (const item of await Promise.all(data)) {
                if(item.type.includes('video') || item.type.includes('image')){
                    this.setVideo(item)
                }else if(item.type === 'application/x-subrip'){
                    this.addSubtitle(item)
                }else{
                    console.warn(`${item.path} is unsupprted`)
                }
            }
            
            // return {
            //     video: data.find(file => file.type.includes('video')),
            //     subtitles: data.filter(file => file.type === 'application/x-subrip').map(fileToObject),
            // }
        },
        
        async addSubtitles(payload) {
            const subs  = Array.isArray(payload) ? payload : [payload]
            for (const subtitle of subs) {
                this.addSubtitle({
                    ...handleFilePath(subtitle),
                    lang: await detectLanguageFromFile(subtitle)
                })

            }
        },
        async getMetaData(filePath) {
            try {
                this.setMetadata(await getMetaData(filePath));
            } catch (error) {
                console.error('oooops', error)
            }
        },
        async getScreenShots(filePath) {
            try {
                screenshotEmitter = generateScreenshots(filePath)
                console.log('listening!')
                screenshotEmitter.on('screenshot', this.setScreenshots)

            } catch (error) {
                console.error('oooops', error)
            }
        }
    }
}
