import React from 'react'
import { connect } from 'react-redux'
import { Step } from 'semantic-ui-react'
import './Navbar.css'

const Navbar = ({ steps, setActive }) => {
    return <Step.Group id="navbar" ordered unstackable widths={steps.length}>
        {steps.map( step => {
            return (<Step key={step.id} active={step.active} disabled={step.disabled} completed={step.completed} onClick={() => setActive(step.id)}>
                <Step.Content>
                    <Step.Title>{step.title}</Step.Title>
                    <Step.Description>{step.description}</Step.Description>
                </Step.Content>
            </Step>)
        })}
    </Step.Group>
}

export default connect(state => ({
    steps: state.steps
}), ({ steps: { setActive } }) => ({
    setActive
}))(Navbar)