import React, { Component } from "react";
import { connect } from 'react-redux'
import { Card, Grid, Button, Label, Icon } from "semantic-ui-react";
import { by639_1, by639_2T, by639_2B } from 'iso-language-codes'

import './FileDisplay.css'
import RemoveButton from "./components/RemoveButton/RemoveButton";
import ImageSlider from "./components/ImageSlider/ImageSlider";
import loadingImg from './loading.gif'
import FileButton from "../FileButton/FileButton";

const getLanguage = (langCode) => {
    if (by639_1[langCode]) {
        console.log(by639_1[langCode])
        return by639_1[langCode].name;
    } else if (by639_2T[langCode]) {
        console.log(by639_2T[langCode])
        return by639_2T[langCode].name;
    } else if (by639_2B[langCode]) {
        console.log(by639_2B[langCode])
        return by639_2B[langCode].name;
    } else {
        return null
    }
}

class FileDisplay extends Component {

    state = {
        metaData: {},
        screenshots: [],
    }
    constructor() {
        super();
    }
    componentDidMount() {
        this.props.getMetaData(this.props.file.path);
        this.props.getScreenShots(this.props.file.path)
        console.log(this.props.file)
    }

    render() {
        const { file, subtitles, removeFile, addSubtitles, removeSubtitles } = this.props;
        const { metaData = {}, screenshots = [] } = file;
        const { format: formatMetadata } = metaData;
        const videoMetaData = metaData && metaData.streams && metaData.streams.find(s => s.codec_type === 'video');
        const audioMetaData = metaData && metaData.streams && metaData.streams.find(s => s.codec_type === 'audio');
        const subtitleMetaData = metaData && metaData.streams && metaData.streams.filter(s => s.codec_type === 'subtitle');
        return <Grid columns={1}>
            <Grid.Column >
                <Card style={{ width: '100%' }}>
                    <ImageSlider images={screenshots.map(screenshot => `file://${screenshot}`)}
                        loadingImage={loadingImg} />

                    <Card.Content>
                        <Card.Header>
                            {file.name}
                            <RemoveButton onClick={removeFile} />
                        </Card.Header>
                        {formatMetadata && <Card.Description>
                            <p> <b>Duration:</b> {formatMetadata.duration}</p>
                            <p> <b>Size:</b> {formatMetadata.size / 1024 / 1024 | 0}MB</p>
                            <p> <b>Resolution:</b> {videoMetaData.width}x{videoMetaData.height}</p>
                            <p> <b>Language:</b> {getLanguage(audioMetaData && audioMetaData.tags && audioMetaData.tags.language) || 'Unknown'} </p>
                            <p><b>Subtitles:</b> {subtitleMetaData.map(subs => getLanguage(subs.tags.language)).join(', ') || 'None'}</p>
                        </Card.Description>}
                    </Card.Content>
                    <Card.Content extra>

                        <FileButton text="Add external subtitles" filter={(f) => f.type == 'application/x-subrip'} onFile={addSubtitles} />

                        <div>
                            {subtitles.map(subtitle => (
                                <Button key={subtitle.path} className="sutitle-item" as='div' labelPosition='right'>
                                    <Button onClick={()=>removeSubtitles(subtitle.path)} className="remove" size="tiny" icon='remove' color='red' />
                                    <Label className="title" basic size="small"  >
                                        <pre style={{margin: '0.25em 0'}}>
                                            <span>{getLanguage(subtitle.lang)}</span>
                                            {subtitle.name}
                                        </pre>
                                    </Label>
                                </Button>
                            ))}
                        </div>
                    </Card.Content>
                </Card>
            </Grid.Column>
        </Grid>
    }
}

export default connect(null, ({ mediaFiles: { addSubtitles, getMetaData, getScreenShots, reset, removeSubtitles } }) => ({
    addSubtitles, getScreenShots, getMetaData, removeFile: reset, removeSubtitles
}))(FileDisplay)