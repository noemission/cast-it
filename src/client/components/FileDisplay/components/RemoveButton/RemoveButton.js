import React from "react";
import { Button, Icon } from "semantic-ui-react";
import './RemoveButton.css'

export default ({onClick}) => <Button onClick={onClick} id="remove-button" basic animated='vertical' color='red'>
    <Button.Content hidden>Remove</Button.Content>
    <Button.Content visible>
        <Icon name='remove' />
    </Button.Content>
</Button>

