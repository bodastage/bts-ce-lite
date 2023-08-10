import React from 'react';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

const Loading  = (props) => {
    const { show } = props;

    if (show === true) {
        return (
            <div className="login-logo">
                <FontAwesomeIcon icon="spinner" spin size="lg"/>
            </div>
        );
    }
        
    return (<div></div>);
}

export default  Loading ;