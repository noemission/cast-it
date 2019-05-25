import React, { Component } from "react";
import DragDropFile from "./DragDropFile";

export default class FileChooser extends Component {

    constructor(){
        super();
        this.fileInput = React.createRef();
    }
    inputHandler = () => {
        this.props.onSelect(this.fileInput.current.files[0])
    }

    render() {
        return <div>
            <input ref={this.fileInput} type="file" onChange={this.inputHandler}/>
            <br/>
            <DragDropFile/>
            </div>
    }
}