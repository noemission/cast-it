import React, { Component } from "react";
import getDlnaClientsService from "../server/dlnaClients";

export default class Controls extends Component {

    state = { status: {} }
    constructor() {
        super();
    }
    componentDidMount() {
        const { player } = this.props;
        player.client.getDuration((err, duration) => {
            this.setState({
                duration
            })
        })
        // setInterval(() => {
        //     player.status((err, status) => {
        //         console.log('status', status)
        //         if (status.playerState === "PLAYING") {
        //             this.setState({
        //                 status: {
        //                     currentTime: status.currentTime,
        //                     playerState: status.playerState,
        //                     volume: status.volume.level
        //                 }
        //             })
        //         } else {
        //             this.setState({
        //                 status: {
        //                     ...this.state.status,
        //                     playerState: status.playerState
        //                 }
        //             })
        //         }
        //     })
        // }, 1000)
    }

    play = () => {
        const { player } = this.props;
        player.resume(console.log)
    }
    pause = () => {
        const { player } = this.props;
        player.pause(console.log)
    }
    stop = () => {
        const { player } = this.props;
        player.stop(console.log)
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

    render() {
        const { player } = this.props;
        return <div>
            <br /><br />
            <pre>{JSON.stringify(this.state.status, null, 4)}</pre>
            <br /><br />
            <button onClick={this.play}>Play</button>
            <button onClick={this.pause}>Pause</button>
            <button onClick={this.stop}>Stop</button>

            <br /><br />
            <div>
                <input type="range" id="start" name="volume"
                    value={this.state.status.volume * 100}
                    onChange={e => this.setVolume(e.target.value)}
                    min="0" max="15" />
                <label for="volume">Volume - {this.state.status.volume * 100 | 0}</label>
            </div>

            <br /><br />
            <div>
                <label for="volume">{this.state.status.currentTime}</label>
                <input type="range" id="start" name="volume"
                    value={this.state.status.currentTime}
                    onChange={e => console.log(e.target.value)}
                    min={0} max={this.state.duration} />
                <label for="volume">{this.state.duration}</label>
            </div>
        </div>
    }
}