import React, { Component } from "react";
import { getMetaData, generateScreenshots } from "../server/mediaData";

export default class FileDisplay extends Component {

    state = {
        metaData: {},
        screenshots: []
    }
    constructor() {
        super();
    }
    async getMetaData() {
        const { file } = this.props;

        try {
            this.setState({
                metaData: await getMetaData(file.path)
            })

        } catch (error) {
            console.error('oooops', error)
            this.setState({
                metaData: {}
            })
        }
    }
    async getScreenShots() {
        const { file } = this.props;

        try {
            this.setState({
                screenshots: await generateScreenshots(file.path),

            }, () => {
                this.setState({
                    currentScreenshot: this.state.screenshots[0],
                    currentScreenshotIndex: 0
                })
            })
            setInterval(() => {
                if (this.state.currentScreenshotIndex < this.state.screenshots.length - 1) {
                    this.setState({
                        currentScreenshot: this.state.screenshots[this.state.currentScreenshotIndex + 1],
                        currentScreenshotIndex: this.state.currentScreenshotIndex + 1
                    })
                } else {
                    this.setState({
                        currentScreenshot: this.state.screenshots[0],
                        currentScreenshotIndex: 0
                    })
                }
            }, 1000)

        } catch (error) {
            console.error('oooops', error)
            this.setState({
                screenshots: []
            })
        }
    }
    componentDidMount() {
        this.getMetaData();
        this.getScreenShots()
        console.log(this.props.file)

    }
    componentDidUpdate(prevProps) {
        // this.getMetaData();
    }

    render() {

        return <div>
            <div>
                {this.state.currentScreenshot && <img style={{ maxWidth: '100%' }} src={`file://${this.state.currentScreenshot}`}></img>}
                {/* {this.state.screenshots.map(filePath => {
                    return <img src={`file://${filePath}`}></img>
                })} */}
            </div>
            <pre>{JSON.stringify(this.state.metaData, null, 4)}</pre>
            {/* <pre>{JSON.stringify(this.state.screenshots, null, 4)}</pre> */}
        </div>
    }
}