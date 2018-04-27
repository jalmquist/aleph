import React, { Component } from 'react';
import queryString from 'query-string';

import { Country, Schema, Collection, Entity, FileSize, Date } from 'src/components/common';


class EntityTableRow extends Component {
  constructor(props) {
    super(props);
    this.onRowClickHandler = this.onRowClickHandler.bind(this);
  }

  onRowClickHandler(event) {
    // If the target that was clicked was not a link then find the the first 
    // link and simulate clicking the link in it, which will load the preview.
    // (If the target *was* a link does not do anything.)
    if (event.target.classList.contains('CollectionLink') ||
        event.target.className.baseVal === 'pt-icon collection-icon') {
      return;
    }

    // Do not show previews when in document mode, i.e. when viewing a folder.
    if (this.props.documentMode) {
      return;
    }
    event.preventDefault();
    const { entity, history, location } = this.props;
    const parsedHash = queryString.parse(location.hash);

    if (parsedHash['preview:id'] === entity.id) {
      // If this entity is already being previewed, hide the preview of it
      parsedHash['preview:id'] = undefined;
      parsedHash['preview:type'] = undefined;
    } else {
      parsedHash['preview:id'] = entity.id;
      parsedHash['preview:type'] = (entity.schemata && entity.schemata.indexOf('Document') !== -1) ? 'document' : 'entity';
    }

    history.replace({
      pathname: location.pathname,
      search: location.search,
      hash: queryString.stringify(parsedHash),
    });
  }  
  
  shouldComponentUpdate(nextProps) {
    // Only update if the ID of the entity has changed *or* location has updated
    return this.props.entity.id !== nextProps.entity.id ||
        this.props.location.hash !== nextProps.location.hash ||
        this.props.showSkeleton !== nextProps.showSkeleton;
  }

  render() {
    const { entity, className, location: loc } = this.props;
    const { hideCollection, documentMode } = this.props;
    const parsedHash = queryString.parse(loc.hash);
    
    let rowClassName = (className) ? `${className} nowrap` : 'nowrap';

    // Select the current row if the ID of the entity matches the ID of the
    // current object being previewed. We do this so that if a link is shared
    // the currently displayed preview will also have the row it corresponds to
    // highlighted automatically.
    if (parsedHash['preview:id'] && parsedHash['preview:id'] === entity.id) {
      rowClassName += ' active'
    }
    
    return (
      <tr className={rowClassName} onClick={this.onRowClickHandler}>
        <td className="entity">
          <Entity.Link preview={!documentMode} entity={entity} icon />
        </td>
        {!hideCollection && 
          <td className="collection">
            <Collection.Link preview={true} collection={entity.collection} icon />
          </td>
        }
        <td className="schema">
          <Schema.Label schema={entity.schema} />
        </td>
        {!documentMode && (
          <td className="country">
            <Country.List codes={entity.countries} />
          </td>
        )}
        <td className="date">
          <Date.Earliest values={entity.dates} />
        </td>
        {documentMode && (
          <td className="file-size">
            <FileSize value={entity.file_size}/>
          </td>
        )}
      </tr>
    );
  }
}

export default EntityTableRow;
