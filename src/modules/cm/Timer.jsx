import * as React from 'react';
import ReactStopwatch from 'react-stopwatch';

export default class Timer extends  React.Component  {
	constructor(props){
		super(props);
	}
	
	render(){
		if(this.props.visible === false) return ""

		return (<ReactStopwatch
			seconds={0}
			minutes={0}
			hours={0}
			onChange={({ hours, minutes, seconds }) => { 
				if(typeof this.props.onChange === 'function') { this.props.onChange(hours, minutes, seconds) }
			}}
			onCallback={() => {
				if(typeof this.props.onCallback !== 'undefined') { this.state.onCallback() }
			}}
			render={({ formatted, hours, minutes, seconds }) => {
			  return ( <span className={this.props.className}>{ hours.toString().padStart(2, '0') }:{ minutes.toString().padStart(2, '0') }:{ seconds.toString().padStart(2, '0') }</span> );
			}}
		   />);
		
	}
	
}