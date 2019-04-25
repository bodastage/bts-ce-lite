import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default class Loading extends React.Component {
    render(){
        if (this.props.show === true) {
            return (
                <div className="login-logo">
                    <FontAwesomeIcon icon="spinner" spin size="lg"/>
                </div>
            );
        }
        
        return (<div></div>);
    }
}