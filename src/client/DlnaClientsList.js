import React, { Component } from "react";
import getDlnaClientsService from "../server/dlnaClients";

export default class DlnaClientsList extends Component {

    state = {
        dlnaClients: [],
        searching: false,
        selectedClientIndex: false
    }

    onDlnaClientsServiceUpdate = () => {
        console.log('onUpdate', this.dlnaClientsService.players)
        this.setState({ dlnaClients: [...this.dlnaClientsService.players] })

        if(this.state.selectedClientIndex === false && this.dlnaClientsService.players.length){
            this.onSelect({target: { value: 0}})
        }
    }

    startSearching = () => {
        this.dlnaClientsService = getDlnaClientsService();
        this.dlnaClientsService.on('update', this.onDlnaClientsServiceUpdate)

        this.updateInterval = setInterval(() => {
            // console.log('interval', this.dlnaClientsService.players)
            this.dlnaClientsService.update()
        }, 2500)
        this.setState({ searching: true, selectedClientIndex: false })
    }

    stopSearching = () => {
        this.dlnaClientsService.removeListener('update', this.onDlnaClientsServiceUpdate)
        clearInterval(this.updateInterval);
        this.setState({
            searching: false
        })
    }

    componentDidMount() {
        this.startSearching()
    }
    componentWillUnmount() {
        dlnaClientsService.removeListener('update', this.onDlnaClientsServiceUpdate)
        clearInterval(this.updateInterval);
    }

    onSelect = (ev) => {
        if (this.state.dlnaClients[ev.target.value]) {
            this.setState({ selectedClientIndex: ev.target.value })
            console.log(this.state.dlnaClients[ev.target.value])
            this.props.onSelect(this.state.dlnaClients[ev.target.value])
        }
    }

    render() {
        const { dlnaClients, searching, selectedClientIndex } = this.state;
        return <div>
            {!searching && <button onClick={this.startSearching}>Start searching</button>}
            {searching && <button onClick={this.stopSearching}>Stop searching</button>}
            <select onChange={this.onSelect} value={selectedClientIndex}>
                <option value="">Choose cast</option>
                {dlnaClients.map((client, i) => <option key={client.host} value={i}>
                    {client.name}
                </option>)}
            </select>
        </div>
    }
}