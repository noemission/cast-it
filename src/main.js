import 'semantic-ui-css-offline/semantic.min.css'
import React from "react";
import ReactDOM from "react-dom";
import { Provider } from 'react-redux'
import store from './client/store'
import Main from "./client/Main";

ReactDOM.render(
    <Provider store={store}>
        <Main />
    </Provider>,
    document.getElementById('app'));

