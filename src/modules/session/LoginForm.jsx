import React from 'react'
//import logo from '../../images/logo.svg';
import logo from '../../images/boda-lite-logo.png';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import * as sessionActions from './session-actions';
import  './LoginForm.css';
import Loading from './Loading';
import axios from 'axios';
import { attemptAuthentication, clearAuthError, clearOldSession, checkDBSetupStatus } from '../session/session-actions';
import { Button, Intent, FormGroup, InputGroup } from "@blueprintjs/core";
import VERSION from '../../version';

class LoginForm extends React.Component {
    constructor(props){
        super(props);

        this.state = {
            username: "",
            password: ""
        };
        
        this.handleSubmit = this.handleSubmit.bind(this);
        this.handleInputChange = this.handleInputChange.bind(this);
        this.dismissError = this.dismissError.bind(this);
        this.clearOldSession = this.clearOldSession.bind(this);

    }
    
    componentDidMount(){
        if(typeof this.props.userDetails !== 'undefined' && this.props.userDetails !== null ){
            this.setState({username: this.props.userDetails.username});
			return;
        }
        
        //Check if database is ready
        this.props.dispatch(checkDBSetupStatus());
        
    }
    
    clearOldSession(){
        this.props.dispatch(clearOldSession())
    }
    
    dismissError(){
        this.props.dispatch(clearAuthError());
    }

    handleSubmit(event){
        event.preventDefault();

          this.props.dispatch(attemptAuthentication({
              username: this.state['username'],
              password: this.state['password']
          }));
        
    }

    handleInputChange(event){
        const name = event.target.name;
        const value = event.target.value;
        this.setState({
            [name]: value
        });
    }
    
    render(){
            //The type of alert to use when the user fails to login. 
            //This can either be danger for a wrong passworg or info for database
            //setup pending
            let errorAlertType = this.props.waitingForDB === true? 'info' : 'danger';
            
            return (
            <div className="login-mask">
                <div className="login-logo">
                    <img src={logo} width="100px" alt="Boda Lite - CE" /> <span><h2  className="bp3-heading bp3-ui-text">Boda Lite</h2><h6 className="bp3-heading">v{VERSION}</h6></span>
                </div>
                
                <form className="form-signin" onSubmit={this.handleSubmit}>
                    <Loading show={this.props.authenticating}/>
                    
                    {this.props.loginError == null ? "" :
                        <div className={`alert alert-${errorAlertType} p-2`} role="alert">
                            {this.props.loginError}
                        <button type="button" className="close"  aria-label="Close" onClick={this.dismissError}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                        </div>
                    }
                    
                    {typeof this.props.userDetails === 'undefined' || this.props.userDetails === null? 
                        <React.Fragment>
                            <FormGroup
                                label=""
                                labelFor="session_email"
                            >
                                <InputGroup id="session_email" placeholder="Email" 
                                    required={true}
                                    leftIcon="user" 
                                    name="username"
                                    type="email"
                                    onChange={this.handleInputChange} />
                            </FormGroup>
                        </React.Fragment>
                    :''}
                    
                    {typeof this.props.userDetails === 'undefined' || this.props.userDetails === null? '' : 
                        <React.Fragment>
                            <label htmlFor="username" className="sr-only">Username</label>
                            <div className="input-group">
                            <span className="font-weight-light">Login as </span>  &nbsp;
                                <span className="font-weight-bold">{this.props.userDetails.first_name + ", " +  this.props.userDetails.last_name}</span>
                            </div>
                            
                        </React.Fragment>     
                    }
                    
                    
                        <FormGroup
                            label=""
                            labelFor="session_password"

                        >
                            <InputGroup id="session_password" placeholder="Password" 
                                leftIcon="lock" 
                                name="password"
                                type="password"
                                required={true}
                                onChange={this.handleInputChange} />
                        </FormGroup>


        <Button type="submit" text="Sign in" intent={Intent.PRIMARY} disabled={this.props.authenticating}/> &nbsp;
                    
                    {typeof this.props.userDetails !== 'undefined' && this.props.userDetails !== null? 
                        <a href="#" onClick={this.clearOldSession}> as different user</a>
                    :''}
                </form>

            </div>
            );
    }
}

function mapStateToProps(state) {
  return {
    authenticating: state.session.authenticating,
    loginError: state.session.loginError,
    userDetails: state.session.userDetails,
    waitingForDB: state.session.waitingForDB
  }
}

export default connect(mapStateToProps)(LoginForm);