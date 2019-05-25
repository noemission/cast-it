import React, { Component } from "react";
import { connect } from 'react-redux';
import mediaServer from "../../../server/mediaServer";
import mediaServerProxy from "../../../server/mediaServerProxy";
import Progress from "./components/Progress/Progress";
import { Segment } from "semantic-ui-react";
import slugify from "@sindresorhus/slugify";

class Player extends Component {
    state = { status: {} }
    constructor() {
        super();
        this.progressWrapper = React.createRef();
    }
    play = async () => {
        const { player, selectedFile, externalSubtitles = [] } = this.props;
        let serverDetails;

        if (selectedFile.isUrl) {
            serverDetails = await mediaServerProxy(selectedFile.path, externalSubtitles.length > 0 ? externalSubtitles[0].path : null)
        } else {
            serverDetails = await mediaServer(selectedFile.path, externalSubtitles.length > 0 ? externalSubtitles[0].path : null)
        }
        this.setState({
            destroyServer: serverDetails.destroy
        })
        console.log(`http://${serverDetails.hostname}:${serverDetails.port}`)
        player.play(
            // 'http://192.168.1.4:1339/video',
            `http://${serverDetails.hostname}:${serverDetails.port}`,
            // {
            //     // autoplay: true,
            //     contentType: 'video/mp4',
            //     metadata: {
            //         title: "Avengers",
            //         creator: 'John Doe',
            //         type: 'video', // can be 'video', 'audio' or 'image'
            //         // subtitlesUrl: 'http://url.to.some/subtitles.srt'
            //     }
            // },
            {
                autoplay: true,
                type: 'video/mp4',
                subtitles: externalSubtitles.length > 0 ? [`http://${serverDetails.hostname}:${serverDetails.port}/subtitles`] : [],
                title: slugify(selectedFile.name),

            },
            (...args) => console.log(args)
        );
        const statusHandler = ((status) => {
            console.log('statusHandler', status)
            if (status.playerState === 'PLAYING') {
                this.setState({ isPlaying: true })
                player.removeListener('status', statusHandler);
                this.initHandlers();
            }
        })

        player.on('status', statusHandler)
        window.player = player;

    }
    initHandlers = () => {
        const { player, selectedFile: { metaData } } = this.props;

        player.client.getDuration((err, duration) => this.setState({ duration : duration || metaData.format.duration }))

        setInterval(() => {
            player.status((err, status) => {
                // console.log('status', status)
                if (status.playerState === "PLAYING") {
                    this.setState({
                        status: {
                            currentTime: status.currentTime,
                            playerState: status.playerState,
                            volume: status.volume.level
                        }
                    })
                } else {
                    this.setState({
                        status: {
                            ...this.state.status,
                            playerState: status.playerState
                        }
                    })
                }
            })
        }, 1000)
    }
    componentDidMount() {
        this.play();
    }
    componentWillUnmount() {
        this.stop();
        this.state.destroyServer();
    }

    resume = () => {
        const { player } = this.props;
        player.resume(console.log)
    }
    pause = () => {
        const { player } = this.props;
        player.pause(console.log)
    }
    stop = () => {
        const { player } = this.props;
        player && player.stop(console.log)
    }
    setVolume = (volume) => {
        const { player } = this.props;
        this.setState({
            status: {
                ...this.state.status,
                volume: volume / 100
            }
        })
        player.volume(volume / 100, console.log)
    }
    seek = (seconds) => {
        const { player } = this.props;
        player.seek(parseInt(seconds))
    }

    render() {
        const { player } = this.props;
        const { status, duration } = this.state;

        return <Segment loading={!this.state.isPlaying}>
            <br /><br />
            <pre>{JSON.stringify(this.state.status, null, 4)}</pre>
            <br /><br />
            <button onClick={this.resume}>Play</button>
            <button onClick={this.pause}>Pause</button>
            <button onClick={this.stop}>Stop</button>

            <br /><br />
            <div>
                <input type="range" id="start" name="volume"
                    value={status.volume * 100}
                    onChange={e => this.setVolume(e.target.value)}
                    min="0" max="15" />
                <label htmlFor="volume">Volume - {status.volume * 100 | 0}</label>
            </div>

            <br /><br />
            <Progress onSeek={this.seek} currentTime={status.currentTime} duration={duration} />
        </Segment>


    }
}

export default connect(state => ({
    selectedFile: state.mediaFiles.video,
    externalSubtitles: state.mediaFiles.subtitles,
}),
    // ({ steps, dlnaClients }) => ({
    //     goToStep1: () => {
    //         steps.setActive(1);
    //         dlnaClients.stopSearching()
    //     },
    //     goToStep2: () => {
    //         steps.setCompleted(1);
    //         steps.setActive(2);
    //         dlnaClients.startSearching()
    //     },
    //     goToStep3: () => {
    //         steps.setCompleted(2);
    //         steps.setActive(3);
    //         dlnaClients.stopSearching()
    //     },
    // })

)(Player)