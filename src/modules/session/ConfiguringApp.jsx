import * as React from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { handleMigration } from './session-actions';

const ConfiguringApp = (props) => {
    const dispatch = useDispatch();
    const { userDetails, currentRole } = useSelector((state) => state.session);
    
    React.useEffect(() => {
        dispatch(handleMigration());
    });

    return (<div>
        <h1>Configuring App</h1>
    </div>);
}

export default ConfiguringApp;