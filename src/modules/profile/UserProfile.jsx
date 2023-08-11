import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { updateUserProfile, clearProfileUpdateError, notifyProfileUpdateFailure } from './profile-actions';
import { Button, Intent, ProgressBar } from "@blueprintjs/core";

class UserProfile extends React.Component{
    static icon = "user";
    static label = "User Profile";
    
    constructor(props){
        super(props);
        
        this.updateUserProfile = this.updateUserProfile.bind(this)
        this.handleInputChange = this.handleInputChange.bind(this);
        this.dismissError = this.dismissError.bind(this);
        
        this.state = {
            email: this.props.userDetails.email,
            first_name: this.props.userDetails.first_name,
            last_name: this.props.userDetails.last_name,
            other_names: this.props.userDetails.other_names,
			password: null,
			password2 : null
        };
    }
    
    handleInputChange(event){
        const name = event.target.name;
        const value = event.target.value;
        this.setState({
            [name]: value
        });
    }
    
	/**
	* Update user profile
	*/
    updateUserProfile(event){
        event.preventDefault();
		if(this.state.password === this.state.password2){
			 this.props.dispatch(updateUserProfile({...this.state}));
		}else{
			this.props.dispatch(notifyProfileUpdateFailure("Passwords don't match!"));
		}

    }
    
    dismissError(){
        this.props.dispatch(clearProfileUpdateError());
    }
    
    render(){
        return (
        <div className="user-profile-form">

		<fieldset className="col-md-12 fieldset">    	
			<legend className="legend"><FontAwesomeIcon icon={UserProfile.icon}/> Profile</legend>
			
			
            {this.props.updating === false ? "" : 
                <div className="pb-1">
                    <ProgressBar intent={Intent.PRIMARY}/>
                </div>
            }
            
            {this.props.updateError == null ? "" : 
                    <div className="alert alert-danger p-2" role="alert">
                        {this.props.updateError}
                        <button type="button" className="close"  aria-label="Close" onClick={this.dismissError}>
                            <span aria-hidden="true">&times;</span>
                        </button>
                    </div>
            }
            
                
            <form onSubmit={this.updateUserProfile}>
            
                <div className="form-group row">
                    <label htmlFor="profileInputEmail1" className="col-sm-2 col-form-label">Email address</label>
                    <div className="col-sm-6">
                      <input type="email" className="form-control form-control-sm" id="staticEmail" onChange={this.handleInputChange} value={this.state.email} name="email"/>
                    </div>
                </div>
              
              <div className="form-group row">
                <label htmlFor="profileInputFirstName" className="col-sm-2 col-form-label">First name</label>
                <div className="col-sm-6">
                    <input type="text" value={this.state.first_name || "" } name="first_name" onChange={this.handleInputChange} className="form-control form-control-sm"  id="profileInputFirstName" placeholder="First name"/>
                </div>
              </div>
              
              <div className="form-group row">
                <label htmlFor="profileInputLastName" className="col-sm-2 col-form-label">Last name</label>
                <div className="col-sm-6">
                    <input type="text" name="last_name" onChange={this.handleInputChange} className="form-control form-control-sm" value={this.state.last_name} id="profileInputLastName" placeholder="Last name"/>
                </div>
              </div>
              
              <div className="form-group row">
                <label htmlFor="profileInputOtherNames" className="col-sm-2 col-form-label">Other names</label>
                <div className="col-sm-6">
                    <input type="text" name="other_names" onChange={this.handleInputChange} className="form-control form-control-sm" value={this.state.other_names||""} id="profileInputOtherNames" placeholder="Other names"/>
                </div>
              </div>
              
              
              <div className="form-group row">
                <label htmlFor="profileInputPassword" className="col-sm-2 col-form-label">Password</label>
                <div className="col-sm-6">
                    <input type="password" name="password" onChange={this.handleInputChange} className="form-control form-control-sm"  id="profileInputPassword" placeholder="Password"/>
                </div>
              </div>

              
              <div className="form-group row">
                <label htmlFor="profileInputPassword2" className="col-sm-2 col-form-label"></label>
                <div className="col-sm-6">
                    <input type="password" name="password2" onChange={this.handleInputChange} className="form-control form-control-sm"  id="profileInputPassword2" placeholder="Confirm password"/>
                </div>
              </div>
			  
			  
              <Button type="submit" text="Update" intent={Intent.PRIMARY} disabled={this.props.updating}/> &nbsp;
            </form>  
            

			
			</fieldset>
        </div>
        );
    }
}

function mapStateToProps(state) {
  return {
    userDetails: state.session.userDetails,
    updating: state.profile.updating,
    updateError: state.profile.updateError
  }
}

export default connect(mapStateToProps)(UserProfile);