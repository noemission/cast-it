import React, { Component } from "react";
import { connect } from 'react-redux';
import FileChooser from "../FileChooser/FileChooser";
import FileDisplay from "../FileDisplay/FileDisplay";
import { Button, Transition, Grid, Modal, Header, List, Image, Loader, Icon } from "semantic-ui-react";
import './MainContent.css';
import DlnaClientsList from "../DlnaClientsList/DlnaClientsList";
import Player from "../Player/Player";

class CoolButton extends Component {
    state = { animate: false }
    constructor() {
        super();
    }
    componentDidMount() {
        this.animationInterval = setInterval(() => {
            this.setState({ animate: true })
        }, 10000)
    }
    componentWillUnmount(){
        clearInterval(this.animationInterval)
    }

    render() {
        return <Grid centered>
            <Grid.Row >
                <Transition mountOnShow={false} animation="jiggle" duration={350} onComplete={() => this.setState({ animate: false })} visible={this.state.animate}>
                    <Button onClick={this.props.onClick} basic color='blue'>Choose device to cast!</Button>
                </Transition>
            </Grid.Row>
        </Grid>
    }
}

class MainContent extends Component {
    state = {}
    constructor() {
        super();
        this.wrapper = React.createRef();
    }
    onDlnaClientSelect = (player) => {
        this.setState({player})
        this.props.goToStep3();
    }

    render() {
        const { activeStep: { id: activeStep }, selectedFile,externalSubtitles } = this.props;
        if(activeStep === 3){
            return <Player player={this.state.player} />
        }
        return <div id="main-content" ref={this.wrapper}>
            {!selectedFile && <FileChooser onSelect={this.onFileSelect} />}
            {selectedFile && <React.Fragment>
                <FileDisplay file={this.props.selectedFile} subtitles={externalSubtitles} />
                <CoolButton onClick={this.props.goToStep2} />
                {activeStep === 2 && <DlnaClientsList open={true} onClose={this.props.goToStep1} mountNode={this.wrapper.current} onSelect={this.onDlnaClientSelect}/>}
            </React.Fragment>}
        </div>

    }
}

export default connect(state => ({
    activeStep: state.steps.find(s => s.active),
    selectedFile: state.mediaFiles.video,
    externalSubtitles: state.mediaFiles.subtitles,
}), ({ steps, }) => ({
    goToStep1: () => {
        steps.setActive(1);
    },
    goToStep2: () => {
        steps.setCompleted(1);
        steps.setActive(2);
    },
    goToStep3: () => {
        steps.setCompleted(2);
        steps.setActive(3);
    },
}))(MainContent)