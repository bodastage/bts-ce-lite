import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { connect } from 'react-redux';
import logo from '../../images/logo-no-text.svg';
import { addTab } from '../layout/uilayout-actions';
import { setSidePanel } from '../layout/uilayout-actions';
import { setUpdate } from '../session/session-actions';

class Header extends React.Component {
    constructor(props){
        super(props);
        
        this.logout = this.logout.bind(this);
        this.setSidePanel = this.setSidePanel.bind(this);
    }
    
    logout(event){
        event.preventDefault();
        
        this.props.dispatch({
            type: "LOGOUT"
        });
    }

    updateApp = (e) => {
        e.preventDefault();
        this.dispatch(setUpdate(true));
    }
    
    setSidePanel(){
        this.props.dispatch(setSidePanel('DashboardSidePanel'));
    }
    
    addTab = (options) => (e) => { 
        e.preventDefault();

        let tabId = options.component;
        this.props.dispatch(addTab(tabId, options.component, {title: options.title}));
    }
    
    render(){   
        return (
            <div className="navbar-nav d-flex flex-column flex-md-row align-items-center px-md-2  bg-white">
              <h5 className="my-0 mr-md-auto font-weight-normal">
              <img src={logo} width="30px" alt="Boda Telecom Suite - CE" /> &nbsp;
                Boda Telecom Suite - CE
              </h5>
              
              <nav className="my-2 my-md-0 mr-md-3">
                <a className="text-dark" href="/#" onClick={this.addTab({
                    component: 'dashboard', title: 'Dashboard'})}><FontAwesomeIcon icon="home" className="mb-1"/> Dashboard</a>
                <a className="p-2 text-secondary" href="/#" onClick={this.setSidePanel} title="Modules"><FontAwesomeIcon icon="plug" className="mb-1"/> Modules</a>
                <a className="p-2 text-secondary" href="/#" onClick={this.addTab({
                    component: 'Settings', title: 'Settings'})}><FontAwesomeIcon icon="cog" className="mb-1"/> Settings</a>
                <a className="p-2 text-secondary" href="/#" onClick={this.addTab({
                    component: 'Help', title: 'Help'})}><FontAwesomeIcon icon="question-circle" className="mb-1"/> Help</a>
                <a className="p-2 text-secondary" href="/#" onClick={this.addTab({
                    component: 'UserProfile', title: 'Profile'})}><FontAwesomeIcon icon="user" className="mb-1"/> {this.props.userDetails.first_name}</a>
                <a className="p-2 text-secondary" href="/#" onClick={this.updateApp}><FontAwesomeIcon icon="wrench" className="mb-1"/> Update</a>
                <a className="p-2 text-secondary" href="/#"><FontAwesomeIcon icon="power-off" className="mb-1" onClick={this.logout}/></a>
                
              </nav>
            </div> 
        );
    
    }
    
}

function mapStateToProps(state) {
  return {
    userDetails: state.session.userDetails
  }
}

export default connect(mapStateToProps)(Header);