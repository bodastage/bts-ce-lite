import React from 'react'
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';

export default class Help extends React.Component {
        
     static icon = "question-circle";
     static label = "Help"
        
    render(){
        return (
            <div>
                <h3><FontAwesomeIcon icon="question-circle"/> Help</h3>

                <div className="card">
                
                  <div className="card-body">
                    <h4 className="card-title">About</h4>
                    <p className="card-text"> 
                        <b>Boda Telecom Suite - CE Lite</b> (BTS-CE-Lite) is an open source telecommunication network management desktop application.
                    </p>

                    <h4 className="card-title">Resources </h4>

                    <ul>
                        <li>Support is provided through the <b><a href="http://www.telecomhall.net"  target="_blank" rel="noopener noreferrer">Telecomhall</a></b> forum.</li>
                        <li>Issues with the application should be logged at the project's <b><a href="https://github.com/bodastage/bts-ce-lite/issues" target="_blank" rel="noopener noreferrer"> github issue tracker</a></b></li>
                    </ul>    

                  </div>
                </div>
            </div>    
        );
    }
}