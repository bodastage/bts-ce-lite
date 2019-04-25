import { combineReducers } from 'redux';
import session from './modules/session/session-reducers';
import help from './modules/help/help-reducers';
import uiLayout from './modules/layout/uilayout-reducers';


const appReducer = combineReducers({
  session,
  help,
  uiLayout
});

export default appReducer;