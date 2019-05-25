import React, { Component } from "react";
import { Button } from "semantic-ui-react";

export default class FileButton extends Component {
    constructor() {
        super()
        this.fileInput = React.createRef();
    }
    inputHandler = () => {
        this.props.onFile(
            Array.from(this.fileInput.current.files)
            .filter(this.props.filter || (() => true))
            .map(f => f.path));
        this.fileInput.current.files.clear();
    }
    render() {
        const {text} = this.props 
        return <React.Fragment>
            <input name="file_input" id="file_input" type="file"
                ref={this.fileInput} type="file" onChange={this.inputHandler} />
            <Button primary as="label" htmlFor="file_input">{text}</Button>
        </React.Fragment>
    }
}