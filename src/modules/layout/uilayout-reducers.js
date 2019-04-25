import { ADD_TAB, CLOSE_TAB, SET_ACTIVE_TAB, SET_SIDE_PANEL } from './uilayout-actions';

let initialState = {
    tabs: {'dashboard': { component: 'Dashboard', options:{title: "Home"}}},
    activeTab: 'dashboard',
    activePanel: 'DashboardSidePanel'
};

export default function uiLayout(state = initialState, action) {

    switch (action.type) {
        case ADD_TAB:
            if ( typeof action.id === 'undefined' || action.id === null ) return state;
            
            if (typeof state.tabs[action.id] != 'undefined' ) { 
                return Object.assign({}, state, {
                    activeTab: action.id
                });
            }
            
            return Object.assign({}, state, {
                tabs: Object.assign({},state.tabs, {[action.id]:{component: action.component, options: action.options}}),
                activeTab: action.id
            });
        case CLOSE_TAB:
            if ( typeof action.id === 'undefined' || action.id === null ) return state;
            if ( typeof state.tabs[action.id] === 'undefined' ) { return state; }
            
            let tabs = {};
            for(var tabId in state.tabs){
                if( tabId != action.id ){
                    tabs[tabId] = state.tabs[tabId];
                }
            }
            
            return Object.assign({}, state, {
                tabs: tabs,
                activeTab: 'dashboard'
            });
        case SET_ACTIVE_TAB:
            if ( typeof action.id === 'undefined' || action.id === null ) return state;
            
            return Object.assign({}, state, {
                activeTab: action.id
            });
        case SET_SIDE_PANEL:
            if ( typeof action.sidePanel === 'undefined' || action.sidePanel === null ) return state;
            
            return Object.assign({}, state, {
                activePanel: action.sidePanel
            });
        default:
            return state;
    }

}