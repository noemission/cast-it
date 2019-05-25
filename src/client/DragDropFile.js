import React, { Component } from "react";
import './DragDropFile.css'

export default class DragDropFile extends Component {

    state = {
        dropping: false
    }
    constructor() {
        super();
        this.fileInput = React.createRef();
    }
    dropHandler = (ev) => {
        console.log('File(s) dropped');
        this.setState({dropping:false})
        // Prevent default behavior (Prevent file from being opened)
        ev.preventDefault();

        console.log(ev.dataTransfer.items)
        console.log(ev.dataTransfer.files)
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
        // console.log('File(s) in drop zone');

        // Prevent default behavior (Prevent file from being opened)
        ev.stopPropagation();
        ev.preventDefault();
    }


    render() {
        return <div id="drop_zone" 
            className={this.state.dropping ? 'dropping' : ''} 
            onDragEnter={()=>this.setState({dropping:true})}
            onDragLeave={()=>this.setState({dropping:false})}
            onDrop={this.dropHandler}
            onDragOver={this.dragOverHandler}>
            Drag one or more files to this Drop Zone ...
        </div>
    }
}