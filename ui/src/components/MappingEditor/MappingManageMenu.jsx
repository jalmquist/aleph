import React, { Component } from 'react';
import { connect } from 'react-redux';
import { defineMessages, injectIntl, FormattedMessage } from 'react-intl';
import { Button, ButtonGroup, Intent } from '@blueprintjs/core';
import { showErrorToast, showInfoToast } from 'src/app/toast';
import { createEntityMapping, flushEntityMapping, deleteEntityMapping, updateEntityMapping } from 'src/actions';

import MappingCreateDialog from 'src/dialogs/MappingCreateDialog/MappingCreateDialog';
import MappingFlushDialog from 'src/dialogs/MappingFlushDialog/MappingFlushDialog';
import MappingSaveDialog from 'src/dialogs/MappingSaveDialog/MappingSaveDialog';
import MappingDeleteDialog from 'src/dialogs/MappingDeleteDialog/MappingDeleteDialog';
import { selectSession } from 'src/selectors';

const messages = defineMessages({
  create: {
    id: 'mapping.actions.create.toast',
    defaultMessage: 'Generating entities...',
  },
  save: {
    id: 'mapping.actions.save.toast',
    defaultMessage: 'Re-generating entities...',
  },
  delete: {
    id: 'mapping.actions.delete.toast',
    defaultMessage: 'Deleting mapping and generated entities...',
  },
  flush: {
    id: 'mapping.actions.flush.toast',
    defaultMessage: 'Removing generated entities...',
  },
  keyError: {
    id: 'mapping.error.keyMissing',
    defaultMessage: 'Key Error: {id} entity must have at least one key',
  },
  relationshipError: {
    id: 'mapping.error.relationshipMissing',
    defaultMessage: 'Relationship Error: {id} entity must have a {source} and {target} assigned',
  },
});


class MappingManageMenu extends Component {
  constructor(props) {
    super(props);
    this.state = {
      createIsOpen: false,
      flushIsOpen: false,
      saveIsOpen: false,
      deleteIsOpen: false,
    };

    this.toggleCreate = this.toggleCreate.bind(this);
    this.toggleSave = this.toggleSave.bind(this);
    this.toggleFlush = this.toggleFlush.bind(this);
    this.toggleDelete = this.toggleDelete.bind(this);
    this.onCreate = this.onCreate.bind(this);
    this.onDelete = this.onDelete.bind(this);
    this.onFlush = this.onFlush.bind(this);
    this.onSave = this.onSave.bind(this);
  }

  onSave() {
    const { entity, mappingDataId, intl } = this.props;
    if (this.validateMappings()) {
      try {
        this.props.updateEntityMapping(entity, mappingDataId, this.formatMappings());
        showInfoToast(intl.formatMessage(messages.save));
      } catch (e) {
        showErrorToast(e);
      }
    }
    this.toggleSave();
  }

  onCreate() {
    const { entity, intl } = this.props;
    if (this.validateMappings()) {
      try {
        this.props.createEntityMapping(entity, this.formatMappings());
        showInfoToast(intl.formatMessage(messages.create));
      } catch (e) {
        showErrorToast(e);
      }
    }
    this.toggleCreate();
  }

  onDelete() {
    const { entity, mappingDataId, intl } = this.props;

    try {
      this.props.deleteEntityMapping(entity, mappingDataId);
      showInfoToast(intl.formatMessage(messages.delete));
    } catch (e) {
      showErrorToast(e);
    }
    this.toggleDelete();
  }

  onFlush() {
    const { entity, mappingDataId, intl } = this.props;

    try {
      this.props.flushEntityMapping(entity, mappingDataId);
      showInfoToast(intl.formatMessage(messages.flush));
    } catch (e) {
      showErrorToast(e);
    }
    this.toggleFlush();
  }

  toggleCreate = () => this.setState(({ createIsOpen }) => (
    { createIsOpen: !createIsOpen }
  ));

  toggleSave = () => this.setState(({ saveIsOpen }) => (
    { saveIsOpen: !saveIsOpen }
  ));

  toggleFlush = () => this.setState(({ flushIsOpen }) => (
    { flushIsOpen: !flushIsOpen }
  ));

  toggleDelete = () => this.setState(({ deleteIsOpen }) => ({ deleteIsOpen: !deleteIsOpen }));

  formatMappings() {
    const { entity, mappings } = this.props;

    return {
      table_id: entity.id,
      mapping_query: mappings.toApiFormat(),
    };
  }

  validateMappings() {
    const { intl, mappings } = this.props;
    const errors = mappings.validate();

    if (errors.length) {
      showErrorToast({
        message: errors.map(({ error, values }) => (
          <li key={error}>{intl.formatMessage(messages[error], values)}</li>
        )),
      });
      return false;
    }

    return true;
  }

  render() {
    const { mappingDataId } = this.props;
    const { createIsOpen, deleteIsOpen, flushIsOpen, saveIsOpen } = this.state;

    return (
      <>
        <ButtonGroup>
          {mappingDataId && (
            <Button icon="floppy-disk" intent={Intent.PRIMARY} onClick={this.toggleSave}>
              <FormattedMessage id="mapping.actions.save" defaultMessage="Save changes" />
            </Button>
          )}
          {!mappingDataId && (
            <Button icon="add" intent={Intent.PRIMARY} onClick={this.toggleCreate}>
              <FormattedMessage id="mapping.actions.create" defaultMessage="Generate entities" />
            </Button>
          )}

          {mappingDataId && (
            <Button icon="delete" onClick={this.toggleFlush}>
              <FormattedMessage id="mapping.actions.flush" defaultMessage="Remove generated entities" />
            </Button>
          )}
          <Button icon="trash" onClick={this.toggleDelete}>
            <FormattedMessage id="mapping.actions.delete" defaultMessage="Delete" />
          </Button>
        </ButtonGroup>
        <MappingCreateDialog
          isOpen={createIsOpen}
          toggleDialog={this.toggleCreate}
          onCreate={this.onCreate}
        />
        <MappingSaveDialog
          isOpen={saveIsOpen}
          toggleDialog={this.toggleSave}
          onSave={this.onSave}
        />
        <MappingFlushDialog
          isOpen={flushIsOpen}
          toggleDialog={this.toggleFlush}
          onFlush={this.onFlush}
        />
        <MappingDeleteDialog
          isOpen={deleteIsOpen}
          toggleDialog={this.toggleDelete}
          onDelete={this.onDelete}
        />
      </>
    );
  }
}

const mapDispatchToProps = {
  createEntityMapping,
  flushEntityMapping,
  deleteEntityMapping,
  updateEntityMapping,
};

const mapStateToProps = state => ({ session: selectSession(state) });

MappingManageMenu = connect(mapStateToProps, mapDispatchToProps)(MappingManageMenu);
MappingManageMenu = injectIntl(MappingManageMenu);
export default MappingManageMenu;