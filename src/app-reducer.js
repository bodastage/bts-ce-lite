import { combineReducers } from 'redux';
import session from './modules/session/session-reducers';
import help from './modules/help/help-reducers';
import uiLayout from './modules/layout/uilayout-reducers';
import cm  from './modules/cm/cm-reducers';


const appReducer = combineReducers({
  session,
  help,
  uiLayout,
  cm
});

export default appReducer;