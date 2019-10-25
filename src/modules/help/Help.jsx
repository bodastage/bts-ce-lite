import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
const { shell } = window.require('electron').remote;

export default class Help extends React.Component {
        
     static icon = "question-circle";
     static label = "Help"
    
	componentDidMount(){
	}
	
	handleOnClick = (event) => {
		event.preventDefault();
		let lnk = event.target.href;
		shell.openExternal(lnk);
	}
	
    render(){
        return (
            <div>

                <fieldset className="col-md-12 fieldset">    	
                    <legend className="legend"><FontAwesomeIcon icon="question-circle"/> Help</legend>
                    
                
                  <div className="card-body">
                    <h4 className="card-title">About</h4>
                    <p className="card-text"> 
                        <b>Boda Lite</b> is an open source telecommunication network management desktop application.
                    </p>

                    <h4 className="card-title">Resources </h4>

                    <ul>
                        <li>Support is provided through the <b>
							<a href="http://www.telecomhall.net"  
							target="_blank" rel="noopener noreferrer" onClick={this.handleOnClick}>
							Telecomhall
							</a>
							</b> forum.
						</li>
                        
						<li>The project source code is available on <b>
						<a href="https://github.com/bodastage/bts-ce-lite" onClick={this.handleOnClick}
						target="_blank" rel="noopener noreferrer"> Github</a></b></li>
						
                        <li>Issues with the application should be logged at the project's <b>
						<a href="https://github.com/bodastage/bts-ce-lite/issues" onClick={this.handleOnClick}
						target="_blank" rel="noopener noreferrer"> Github issue tracker</a></b></li>

                        <li>View <b>
						<a href="https://www.bodastage.org/bts-ce-lite/docs/" onClick={this.handleOnClick}
						target="_blank" rel="noopener noreferrer"> documentation</a></b> website</li>


                    </ul>    

                  </div>
				  
				  </fieldset>
            </div>    
        );
    }
}