const http = require('http');
const fs = require('fs');
const mime = require('mime');
const path = require('path');
const internalIp = require('internal-ip');
const getPort = require('get-port');


const getInfo = (file) => {
    if (!fs.existsSync(file)) return;

    const extension = path.extname(file);

    return {
        path: file,
        mime: mime.getType(file),
        extension,
        basename: path.basename(file, extension),
        size: fs.statSync(file).size
    };
};
const createServer = (video, subtitles) => {

    return http.createServer(function (req, res) {
        const url = req.url;
        // The client has moved the forward/back slider
        if (req.headers.range) {
            const range = req.headers.range;
            const parts = range.replace(/bytes=/, '').split('-');
            const partialstart = parts[0];
            const partialend = parts[1];

            const start = parseInt(partialstart, 10);
            const end = partialend ? parseInt(partialend, 10) : video.size - 1;
            const chunksize = (end - start) + 1;

            const file = fs.createReadStream(video.path, { start, end });

            res.writeHead(206, {
                'Connection': 'close',
                'realTimeInfo.dlna.org': 'DLNA.ORG_TLAG=*',
                'contentFeatures.dlna.org': 'DLNA.ORG_PN=AVC_MP4_HP_HD_AAC;DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000',
                'transferMode.dlna.org': 'Streaming',
                
                'Content-Range': `bytes ${start}-${end}/${video.size}`,
                'Accept-Ranges': 'bytes',
                'Content-Length': chunksize,
                'Content-Type': video.mime
            });

            return file.pipe(res);
        }

        // GET /
        if (url === '/') {
            const headers = {
                'Connection': 'close',
                'realTimeInfo.dlna.org': 'DLNA.ORG_TLAG=*',
                'contentFeatures.dlna.org': 'DLNA.ORG_PN=AVC_MP4_HP_HD_AAC;DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000',
                'transferMode.dlna.org': 'Streaming',
                
                'Accept-Ranges': 'bytes',
                'Content-Length': video.size,
                'Content-Type': video.mime
            };

            if (subtitles) headers['CaptionInfo.sec'] = subtitles.url;

            res.writeHead(200, headers);

            if (req.method !== 'GET') return res.end()

            fs.createReadStream(video.path).pipe(res);
            // GET /subtitles
        } else if (subtitles && url === '/subtitles') {
            res.writeHead(200, {
                'Content-Length': subtitles.size,
                'transferMode.dlna.org': 'Streaming',
                'contentFeatures.dlna.org': 'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000',
                'CaptionInfo.sec': subtitles.url,
                'Content-Type': subtitles.mime
            });

            fs.createReadStream(subtitles.path).pipe(res);
        }
    });
};

export default (videoPath, subsPath) => {
    return new Promise(async (resolve, reject) => {
        const [hostname, port] = [
            await internalIp.v4(),
            await getPort()
        ]

        const video = getInfo(videoPath)
        let subtitles;
        if (subsPath) {
            subtitles = getInfo(subsPath)
            subtitles.url = `http://${hostname}:${port}/subtitles`
        }
        video.mime = 'video/mp4'
        const server = createServer(video, subtitles)
        server.listen(port, () => {
            resolve({
                hostname,
                port,
                video,
                subtitles,
                destroy: () => server.close()
            })
        })

    })

}