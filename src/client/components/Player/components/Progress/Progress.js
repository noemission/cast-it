import React from "react";
import './Progress.css'
import { Segment, Label } from "semantic-ui-react";

const formatSeconds = (seconds = 0) => {
    const date = new Date(null);
    date.setSeconds(parseFloat(seconds));
    return date.toISOString().substr(11, 8);
}
export default class Progress extends React.Component{
    state = {
        progressBarLabel: {
            text: '',
            left: 0,
            visible: false
        }
    }
    constructor() {
        super();
        this.progressBarWrapper = React.createRef()
        this.progressBarLabel = React.createRef()
    }

    calcWidth = () => {
        const { currentTime, duration } = this.props;
        const progress = (parseInt(currentTime) || 0) / parseInt(duration);
        let rect;

        if (this.progressBarWrapper.current && (rect = this.progressBarWrapper.current.getBoundingClientRect())) {
            let width = progress * rect.width;
            return isNaN(width) ? 0 : width;
        }
        return 0;

    }
    onProgressBarWrapperMouseEnter = () => {
        let barRect = this.progressBarWrapper.current.getBoundingClientRect()
        let newProgress = (event.clientX - barRect.x) / barRect.width;
        if(newProgress < 0) newProgress = 0;
        let seek = parseInt(this.props.duration * newProgress);

        this.setState({
            progressBarLabel: {
                text: formatSeconds(seek),
                left: (event.clientX - barRect.x) - 35 + 'px',
                visible: true
            }
        })
    }
    onProgressBarWrapperMouseLeave = () => {
        this.setState({
            progressBarLabel: {
                ...this.state.progressBarLabel,
                visible: false
            }
        })
    }
    onProgressBarWrapperClick = (event) => {
        let rect = this.progressBarWrapper.current.getBoundingClientRect()
        if(!rect) return;
        let newProgress = (event.clientX - rect.x) / rect.width;
        if(newProgress < 0) newProgress = 0;
        let seek = parseInt(this.props.duration * newProgress);
        console.log(newProgress, seek, formatSeconds(seek));
        this.props.onSeek(seek);
    }

    render() {
        const { currentTime, duration } = this.props;
        const { progressBarLabel } = this.state;

        return <Segment className="progress-wrapper">
            <label for="volume">{formatSeconds(currentTime)}</label>
            

            <div className="ui tiny progress " id="progress-bar-wrapper" ref={this.progressBarWrapper} onClick={this.onProgressBarWrapperClick}
                // onMouseMove={}
                onMouseMove={this.onProgressBarWrapperMouseEnter} onMouseLeave={this.onProgressBarWrapperMouseLeave}>
                
                <div ref={this.progressBarLabel} className="ui pointing below label" 
                    style={{width: 70, top: -39, left: progressBarLabel.left, opacity: +progressBarLabel.visible}}>
                    {progressBarLabel.text}
                </div>
                
                <div className='bar' style={{ width: this.calcWidth(), minWidth: 0 }}></div>
            </div>

            <label htmlFor="volume">{formatSeconds(duration)}</label>
        </Segment>

    }
}