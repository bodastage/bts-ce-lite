import React, { useEffect } from 'react';
import LoginForm from './modules/session/LoginForm';
import ConfiguringApp from './modules/session/ConfiguringApp';
import UILayout from './modules/layout/UILayout';
import { useSelector, useDispatch } from 'react-redux';
import ErrorBoundary from './modules/layout/ErrorBoundary';
import VERSION from './version';
import { resetState } from './modules/session/session-actions'

const App = () => {
	const { authenticated, version, updating } = useSelector((state) => state.session);
	const [ error,setError ] = React.useState(null);
	const [ errorInfo,setErrorInfo ] = React.useState(null);
	const dispatch = useDispatch();

	useEffect(() => {
		VERSION !== version && dispatch(resetState());

	});

	//show updating skin
	if(updating) {
		return <ConfiguringApp />;
	}

	if (authenticated === false) {
		return (
			<ErrorBoundary>
				<LoginForm/>
			</ErrorBoundary>
		);
	}

	return (
		<ErrorBoundary>
			<UILayout/>
		</ErrorBoundary>
	);
}

export default App;