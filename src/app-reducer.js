import { combineReducers } from 'redux';
import session from './modules/session/session-reducers';
import help from './modules/help/help-reducers';
import uiLayout from './modules/layout/uilayout-reducers';
import cm  from './modules/cm/cm-reducers';
import profile from './modules/profile/profile-reducers';
import settings from './modules/settings/settings-reducer';
import reports from './modules/reports/reports-reducer';
import gis from './modules/gis/gis-reducer';
import kml from './modules/utilities/kml-reducer';

const appReducer = combineReducers({
  session,
  help,
  uiLayout,
  cm,
  profile,
  settings,
  reports,
  gis,
  kml
});

export default appReducer;