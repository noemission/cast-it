import React, { Component } from "react";
import { connect } from 'react-redux'
import { Button, Dimmer, Divider, Grid, Icon, Header, Image, Segment, Transition } from 'semantic-ui-react'
import dndImg from './drag-and-drop.png'
import './fileChooser.css'
import FileButton from "../FileButton/FileButton";

class FileChooser extends Component {
    state = {
        dropping: false
    }
    counter = 0
    constructor() {
        super();
    }
    handlePaste = (e) => {
        // Prevent the default pasting event and stop bubbling
        e.preventDefault();
        e.stopPropagation();

        // Get the clipboard data
        let paste = (e.clipboardData || window.clipboardData).getData('text');
        this.props.setFiles(paste)
    }
    componentDidMount() {
        document.addEventListener('paste', this.handlePaste);
    }
    componentWillUnmount() {
        document.removeEventListener('paste', this.handlePaste)
    }
    dropHandler = (ev) => {
        console.log('File(s) dropped');
        this.counter = 0;
        this.setState({ dropping: false })
        // Prevent default behavior (Prevent file from being opened)
        ev.preventDefault();

        console.log(ev.dataTransfer.items)
        console.log(ev.dataTransfer.files)

        this.props.setFiles(Array.from(ev.dataTransfer.files).map(f => f.path))

        if (ev.dataTransfer.items) {
            // Use DataTransferItemList interface to access the file(s)

            for (var i = 0; i < ev.dataTransfer.items.length; i++) {
                // If dropped items aren't files, reject them
                console.log(ev.dataTransfer.items[i])

                if (ev.dataTransfer.items[i].kind === 'file') {
                    var file = ev.dataTransfer.items[i].getAsFile();
                    console.log('... file[' + i + '].name = ' + file.name);
                }
                if (ev.dataTransfer.items[i].kind === 'string') {
                    var str = ev.dataTransfer.items[i].getAsString(console.log);
                    // console.log('... str[' + i + '] = ' , str);
                }
            }
        }
    }
    dragOverHandler = (ev) => {
        ev.stopPropagation();
        ev.preventDefault();
    }

    dragEnterHandler = (ev) => {
        console.log('enter')
        this.setState({ dropping: true })
        this.counter++;
    }
    dragLeaveHandler = (ev) => {
        console.log('leave')
        this.counter--;
        if (this.counter === 0) {
            console.log('setting dropping to false')
            this.setState({ dropping: false })
        }
    }
    render() {
        const { dropping } = this.state
        return <div id="file_chooser_wrapper"  >
            <Dimmer.Dimmable as={Segment} dimmed={dropping}
                placeholder
                id="file_chooser"
                className={dropping ? 'dropping' : ''}
                onDrop={this.dropHandler}
                onDragOver={this.dragOverHandler}
                onDragEnter={this.dragEnterHandler}
                onDragLeave={this.dragLeaveHandler}>
                <Grid columns={1} stackable stretched textAlign='center'>
                    <Grid.Row verticalAlign='middle'>
                        <Grid.Column>
                            <Header>
                                <Image id="drag_drop_img" src={dndImg} size='large' />
                                <p>Drag & Drop</p>
                            </Header>
                        </Grid.Column>

                        <Grid.Column style={{ margin: '5% 0' }}>
                            <Divider id="divider" horizontal>Or</Divider>
                        </Grid.Column>

                        <Grid.Column>
                            <FileButton text="Select files" onFile={this.props.setFiles} />
                        </Grid.Column>
                    </Grid.Row>
                </Grid>

                <Dimmer active={dropping}>
                    <Header as='h2' icon inverted>
                        <Icon id="arrow_icon" className={dropping ? "animating" : ''} name='arrow down' />
                        Drop here!
            </Header>
                </Dimmer>
            </Dimmer.Dimmable>
        </div>
    }
}

export default connect(
    null,
    ({ mediaFiles: { setFiles } }) => ({ setFiles })
)(FileChooser)