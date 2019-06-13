import React, { Component } from "react";
import { connect } from 'react-redux';
import mediaServer from "../../../server/mediaServer";
import mediaServerProxy from "../../../server/mediaServerProxy";
import Progress from "./components/Progress/Progress";
import { Segment, Button, Grid, Transition } from "semantic-ui-react";
import slugify from "@sindresorhus/slugify";
import "./player.css";

class Player extends Component {
    state = { status: {}, showVolRange: false }
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
            `http://${serverDetails.hostname}:${serverDetails.port}`,
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

        player.client.getDuration((err, duration) => this.setState({ duration: duration || metaData.format.duration }))

        setInterval(() => {
            player.status((err, status) => {
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
    onVolBtnHover = (e) => {
        this.setState({
            showVolRange: true
        })
        console.log('in')
    }
    onVolBtnHoverOut = (e) => {
        this.setState({
            showVolRange: false
        })
        console.log('out')
    }
    render() {
        const { player } = this.props;
        const { status, duration, showVolRange } = this.state;

        return <Segment  id="player" loading={!this.state.isPlaying}>
            <Progress onSeek={this.seek} currentTime={status.currentTime} duration={duration} />
            <Grid centered>
                <Grid.Row >
                    <Button icon='play' onClick={this.resume} />
                    <Button icon='pause' onClick={this.pause} />
                    <Button icon='stop' onClick={this.stop} />
                    <div onMouseLeave={this.onVolBtnHoverOut} className="volume-wrapper">
                        <Button onMouseEnter={this.onVolBtnHover} icon='volume up' onClick={this.stop} />
                        <input type="range" id="volume-range" name="volume" className={`${showVolRange ? 'show' : ''}`}
                            value={status.volume * 100}
                            onChange={e => this.setVolume(e.target.value)}
                            min="0" max="15" />
                    </div>
                </Grid.Row>
            </Grid>

        </Segment>


    }
}

export default connect(state => ({
    selectedFile: state.mediaFiles.video,
    externalSubtitles: state.mediaFiles.subtitles,
}))(Player)