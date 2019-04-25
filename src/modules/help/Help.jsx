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
                        <b>Boda Telecom Suite - CE</b> (BTS-CE) is an open source telecommunication network management platform. The project aims to leverage the best in open source software , big data and machine learning to provide a feature rich platform for network management..
                    </p>

                    <h4 className="card-title">Resources </h4>

                    <ul>
                        <li>Support is provided through the <b><a href="http://www.telecomhall.net"  target="_blank" rel="noopener noreferrer">Telecomhall</a></b> forum.</li>
                        <li>Project home page <b><a href="http://www.bodastage.org"  target="_blank" rel="noopener noreferrer">http://www.bodastage.org</a></b></li>
                        <li>Issues with the application should be logged at the project's <b><a href="https://github.com/bodastage/bts-ce/issues" target="_blank" rel="noopener noreferrer"> github issue tracker</a></b></li>
                    </ul>    


                    <p>
                        For commercial inquiries visit <a href="http://www.bodastage.com" target="_blank">http://www.bodastage.com</a> or send an email to info@bodastage.com.
                    </p>

                  </div>
                </div>
            </div>    
        );
    }
}