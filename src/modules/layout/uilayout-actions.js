export const ADD_TAB = 'ADD_TAB';
export const CLOSE_TAB = 'CLOSE_TAB';
export const SET_ACTIVE_TAB = 'SET_ACTIVE_TAB';
export const SET_SIDE_PANEL = 'SET_SIDE_PANEL';

export function addTab(id,component,options){
    return {
        type: ADD_TAB,
        id: id,
        component: component,
        options: options
    };
}


export  function closeTab(tabId){
    return {
        type: CLOSE_TAB,
        id: tabId
    };
}

export function setActiveTab(tabId){
    return {
        type: SET_ACTIVE_TAB,
        id: tabId
    };
}

export function setSidePanel(sidePanel){
    return {
        type: SET_SIDE_PANEL,
        sidePanel: sidePanel
    };
}