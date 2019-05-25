import React, { Component } from "react";
import { connect } from 'react-redux';
import { Modal, Header, List, Loader, Icon } from "semantic-ui-react";

class DlnaClientsList extends Component {
    constructor(){
        super()
    }
    componentDidMount(){
        this.props.startSearching();
    }
    componentWillUnmount(){
        this.props.stopSearching();
    }
    render(){
        const {onClose, dlnaClients, onSelect} = this.props;
        return <Modal open={true} size='small' onClose={()=> {console.log('oncloseee'); onClose()  }}>
        <Header icon='rss' content='Choose device to cast' />
        <Modal.Content>
            <List selection verticalAlign='middle'>
                {dlnaClients.map(client => <List.Item key={client.host} onClick={ () => onSelect(client)}>
                    <Icon name="tv" />
                    <List.Content>
                        <List.Header>{client.name}</List.Header>
                    </List.Content>
                </List.Item>)}

                <Loader id="loader" active inline='centered' />
            </List>
        </Modal.Content>
    </Modal>
    }
}


export default connect(state => ({
    dlnaClients: state.dlnaClients
}), ({ dlnaClients : {startSearching, stopSearching} }) => ({
    startSearching, stopSearching
}))(DlnaClientsList) 