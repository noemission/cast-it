import React, { Component } from "react";
import { Image, Placeholder, Transition } from "semantic-ui-react";
import './ImageSlider.css'

export default class ImageSlider extends Component {

    state = {
        currentImageIndex: 0
    }
    constructor() {
        super();
    }

    onImageMouseEnter = () => {
        if (!this.props.images.length) return;
        const nextImage = () => {
            if (this.state.currentImageIndex < this.props.images.length - 1) {
                this.setState({
                    currentImageIndex: this.state.currentImageIndex + 1
                })
            } else {
                this.setState({
                    currentImageIndex: 0
                })
            }
        };
        this.imageSliderInitialTimeout = setTimeout(nextImage, 350);
        this.imageSliderInterval = setInterval(nextImage, 1800)
    }
    onImageMouseLeave = () => {
        clearTimeout(this.imageSliderInitialTimeout)
        clearInterval(this.imageSliderInterval);
        this.setState({ currentImageIndex: 0 })
    }

    render() {
        const { currentImageIndex } = this.state;
        const { images } = this.props;

        return <div className="image-wrapper"
            style={{ transform: `translate3d(${-100 * currentImageIndex}%,0,0)` }}
            onMouseEnter={this.onImageMouseEnter}
            onMouseLeave={this.onImageMouseLeave}>

            <Transition.Group duration={200} animation="fade">
                {images.map(image => <Image key={image} fluid src={image} className="img" />)}
                {!images.length && <Placeholder fluid style={{ width: '100%', height: '40vh' }}>
                    <Placeholder.Image rectangular />
                </Placeholder>}
            </Transition.Group>

        </div>
    }
}