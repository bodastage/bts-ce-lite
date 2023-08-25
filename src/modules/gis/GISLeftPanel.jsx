import React from 'react';
import { connect } from 'react-redux';
import { FontAwesomeIcon } from '@fortawesome/react-fontawesome';
import { Icon } from "@blueprintjs/core";

const GISLeftPanel = () => {

	return (
		<div>
			<span className="dropdown-item-text legend w-100 mb-2">
				<FontAwesomeIcon icon="globe-africa" /> GIS
				<a href="/#" title="Refresh" onClick={e => e.preventDefault()}><Icon icon="refresh" className="float-right ml-2" /></a>&nbsp;
			</span>
		</div>
	);
}

export default GISLeftPanel;