import 'semantic-ui-css/semantic.min.css'
import React, { Component } from "react";
import DlnaClientsList from "./DlnaClientsList";
import FileChooser from "./FileChooser";
import FileDisplay from "./FileDisplay";
import mediaServer from "../server/mediaServer";
import Controls from "./Controls";

export default class App extends Component {
    state = {
        isPlaying: false
    }

    constructor() {
        super();
    }
    play = async () => {
        const player = this.state.dlnaClient
        const serverDetails = await mediaServer(this.state.file.path, '/home/alex/Videos/A Star Is Born (2018) [WEBRip] [1080p] [YTS.AM]/a-star-is-born-2018-720p-1080-webrip-x264-yts-am-full-subs-maythird-tonlteam.srt')
        console.log(`http://${serverDetails.hostname}:${serverDetails.port}`)
        player.play(
            `http://${serverDetails.hostname}:${serverDetails.port}`,
            {
                // autoplay: false,
                // contentType: 'video/mp4',
                metadata: {
                    title: 'Some Movie Title',
                    creator: 'John Doe',
                    // type: 'video', // can be 'video', 'audio' or 'image'
                    //   subtitlesUrl: 'http://url.to.some/subtitles.srt'
                }
            },
            (...args) => console.log(args)
        );
        const statusHandler = ((status) => {
            console.log('statusHandler')
            if (status.playerState === 'PLAYING') {
                this.setState({ isPlaying: true })
                player.removeListener('status', statusHandler);
            }
        })

        player.on('status', statusHandler)
        window.player = player;

    }
    render() {
        const { file, dlnaClient, isPlaying } = this.state
        return <div>
            <p>Hello 454</p>
            <DlnaClientsList onSelect={(dlnaClient) => this.setState({ dlnaClient })} />
            <FileChooser onSelect={(file) => this.setState({ file })} />
            {file && <FileDisplay file={file} />}

            {dlnaClient && file && <button onClick={this.play}>Play</button>}

            {isPlaying && <Controls player={this.state.dlnaClient} />}
        </div>
    }
}