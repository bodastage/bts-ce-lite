import React from 'react';
import { createRoot } from 'react-dom/client';
import ReactDOM from 'react-dom';
import App from './App';
import { Provider } from 'react-redux';
import { store, persistor } from './configure-store';
import { PersistGate } from 'redux-persist/integration/react'
import { persistStore } from 'redux-persist'
import Loading from './modules/session/Loading';
import * as serviceWorker from './serviceWorker';

import 'bootstrap/dist/css/bootstrap.min.css';
import './app.css';


//Blueprintjs
import 'normalize.css/normalize.css'
import '@blueprintjs/icons/lib/css/blueprint-icons.css'
import '@blueprintjs/core/lib/css/blueprint.css'
import 'reflect-metadata';


// Icons
import { library } from '@fortawesome/fontawesome-svg-core'
import { faLock, faAt, faSpinner, faHome, faPlug, faCog, faDownload,
	faQuestionCircle, faUser, faSitemap, faWrench, faPuzzlePiece,faSync,
	faStopCircle, faUniversity, faCogs, faPowerOff, faArrowRight, faList,
	faChartArea, faBrain, faGem, faUserMd, faGlobeAfrica, faPeopleCarry,
	faFolder, faFile, faStar, faChevronRight, faDotCircle, faFolderOpen,
	faLink, faClock, faRss, faChartLine, faSquare, faTable, faInfoCircle
	,faAsterisk, faFileAlt,faFrown,faDatabase, faFileExcel, faFileCsv,
	faBroadcastTower, faPencilRuler, faBook,faCloudUploadAlt,faTools,
	faCandyCane,faHatWizard, faGlobe, faEllipsisH, faCode
} from '@fortawesome/free-solid-svg-icons'

library.add(faLock, faAt, faSpinner, faHome, faPlug, faCog, faDownload,
faQuestionCircle, faUser, faSitemap, faWrench, faPuzzlePiece,faSync,
faStopCircle, faUniversity, faCogs, faPowerOff, faArrowRight, faList,
faChartArea, faBrain, faGem, faUserMd, faGlobeAfrica, faPeopleCarry,
faFolder, faFile, faStar, faChevronRight, faDotCircle, faFolderOpen, 
faLink, faClock, faRss, faChartLine, faSquare, faTable, faInfoCircle,
faAsterisk, faFileAlt,faFrown, faDatabase, faFileExcel, faFileCsv,
faBroadcastTower, faPencilRuler, faBook, faCloudUploadAlt, faTools, 
faCandyCane, faHatWizard, faGlobe, faEllipsisH, faCode);

const root = createRoot(document.getElementById('root'));
root.render(
	<Provider store={store} key="provider">
		<PersistGate loading={<Loading show={true}/>} persistor={persistor}>
			<App persistor={persistor}/>
		</PersistGate>
	</Provider>
);
	

// If you want your app to work offline and load faster, you can change
// unregister() to register() below. Note this comes with some pitfalls.
// Learn more about service workers: https://bit.ly/CRA-PWA
serviceWorker.unregister();
