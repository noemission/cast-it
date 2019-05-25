const http = require('http');
const fs = require('fs');
const mime = require('mime');
const path = require('path');
const internalIp = require('internal-ip');
const getPort = require('get-port');
const httpProxy = require('http-proxy');


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
const createServer = (videoUrl, subtitles, proxy) => {

    const option = {
        target: videoUrl,
        ignorePath: true,
        selfHandleResponse: true,
        changeOrigin: true,
    };
    proxy.on('proxyRes', (proxyRes, req, res) => {
        const url = req.url;
        console.log(proxyRes)
        if (url === '/') {
            const headers = {
                ...proxyRes.headers,
                'Accept-Ranges': 'bytes',
                'transferMode.dlna.org': 'Streaming',
                'contentFeatures.dlna.org': 'DLNA.ORG_OP=01;DLNA.ORG_CI=0;DLNA.ORG_FLAGS=01700000000000000000000000000000',
                // 'Content-Type': video.mime
            };

            if (subtitles) headers['CaptionInfo.sec'] = subtitles.url;

            res.writeHead(200, headers);

            if (req.method !== 'GET') return res.end()

            proxyRes.pipe(res);
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

    return http.createServer((req, res) => proxy.web(req, res, option));
};

export default (videoUrl, subsPath) => {
    return new Promise(async (resolve, reject) => {
        const [hostname, port] = [
            await internalIp.v4(),
            await getPort()
        ]

        let subtitles;
        if (subsPath) {
            subtitles = getInfo(subsPath)
            subtitles.url = `http://${hostname}:${port}/subtitles`
        }
        const proxy = httpProxy.createProxyServer({});
        const server = createServer(videoUrl, subtitles, proxy)

        server.listen(port, () => {
                resolve({
                    hostname,
                    port,
                    video: videoUrl,
                    subtitles,
                    destroy: () => {
                        console.log('destroying server + proxy')
                        server.close();
                        proxy.close();
                    }
                })
            })
    })

}