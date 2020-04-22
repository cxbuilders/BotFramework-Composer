// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Path from 'path';

import get from 'lodash/get';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { Stack, StackItem } from 'office-ui-fabric-react/lib/Stack';
import React, { useState, Fragment, useEffect, useContext } from 'react';
import { TextField } from 'office-ui-fabric-react/lib/TextField';
import { RouteComponentProps } from '@reach/router';

import { CreateDialog } from '../ModalDialog';
import { LocationSelectContent } from '../LocationBrowser/LocationSelectContent';
import { styles as wizardStyles } from '../StepWizard/styles';
import { StoreContext } from '../../../store';

import { name, description } from './styles';
const MAXTRYTIMES = 10000;

interface FormData {
  name: string;
  description: string;
  location: string;
  schemaUrl: string;
}

interface FormDataError {
  name?: string;
  location?: string;
}

interface DefineConversationProps extends RouteComponentProps<{}> {
  onSubmit: (formData: FormData) => void;
  onDismiss: () => void;
  onCurrentPathUpdate: (newPath?: string, storageId?: string) => void;
  onGetErrorMessage?: (text: string) => void;
  creationParams: { [key: string]: string };
}

const initialFormDataError: FormDataError = {};

const DefineConversation: React.FC<DefineConversationProps> = props => {
  console.log('DAMN U');
  const { onSubmit, onDismiss, onCurrentPathUpdate } = props;
  const { state } = useContext(StoreContext);
  const { templateId, focusedStorageFolder } = state;
  const files = get(focusedStorageFolder, 'children', []);
  const getDefaultName = () => {
    let i = -1;
    const bot = templateId;
    let defaultName = '';
    do {
      i++;
      defaultName = `${bot}-${i}`;
    } while (
      files &&
      files.find(file => {
        return file.name.toLowerCase() === defaultName.toLowerCase();
      }) &&
      i < MAXTRYTIMES
    );
    return defaultName;
  };

  const initalFormData: FormData = { name: getDefaultName(), description: '', location: '', schemaUrl: '' };
  const [formData, setFormData] = useState(initalFormData);
  const [formDataErrors, setFormDataErrors] = useState(initialFormDataError);
  const [disable, setDisable] = useState(false);
  const updateForm = field => (e, newValue) => {
    setFormData({
      ...formData,
      [field]: newValue,
    });
  };

  const nameRegex = /^[a-zA-Z0-9-_.]+$/;
  const validateForm = (data: FormData) => {
    const errors: FormDataError = {};
    const { name } = data;
    if (!name || !nameRegex.test(name)) {
      errors.name = formatMessage(
        'Spaces and special characters are not allowed. Use letters, numbers, -, or _., numbers, -, and _'
      );
    }
    const newBotPath =
      focusedStorageFolder && Object.keys(focusedStorageFolder as Record<string, any>).length
        ? Path.join(focusedStorageFolder.parent, focusedStorageFolder.name, name)
        : '';
    if (
      name &&
      files &&
      files.find(bot => {
        return bot.path.toLowerCase() === newBotPath.toLowerCase();
      })
    ) {
      errors.name = formatMessage('Duplication of names');
    }
    return errors;
  };

  useEffect(() => {
    const currentPath = Path.join(focusedStorageFolder.parent || '', focusedStorageFolder.name || '');
    updateForm('location')(null, currentPath);
  }, [focusedStorageFolder]);

  useEffect(() => {
    const errors = validateForm(formData);
    if (Object.keys(errors).length || !focusedStorageFolder.writable) {
      setDisable(true);
    } else {
      setDisable(false);
    }
    setFormDataErrors(errors);
  }, [focusedStorageFolder, formData.name]);

  useEffect(() => {
    if (props.creationParams) {
      const updatedFormData: FormData = { ...formData };
      if (props.creationParams.name) {
        updatedFormData.name = props.creationParams.name;
      }
      if (props.creationParams.description) {
        updatedFormData.description = props.creationParams.description;
      }

      if (props.creationParams.schemaUrl) {
        updatedFormData.schemaUrl = props.creationParams.schemaUrl;
      }
      setFormData(updatedFormData);
    }
  }, [props.creationParams]);

  const handleSubmit = e => {
    e.preventDefault();
    const errors = validateForm(formData);
    if (Object.keys(errors).length) {
      setFormDataErrors(errors);
      return;
    }

    onSubmit({
      ...formData,
    });
  };

  return (
    <Fragment>
      <CreateDialog title="Conversation Objective and shit" subText="Hell hole" onDismiss={onDismiss}>
        <form onSubmit={handleSubmit}>
          <input type="submit" style={{ display: 'none' }} />
          <Stack horizontal={true} tokens={{ childrenGap: '2rem' }} styles={wizardStyles.stackinput}>
            <StackItem grow={0} styles={wizardStyles.halfstack}>
              <TextField
                label={formatMessage('Name')}
                value={formData.name}
                styles={name}
                onChange={updateForm('name')}
                errorMessage={formDataErrors.name}
                data-testid="NewDialogName"
                required
                autoFocus
              />
            </StackItem>
            <StackItem grow={0} styles={wizardStyles.halfstack}>
              <TextField
                styles={description}
                value={formData.description}
                label={formatMessage('Description')}
                multiline
                resizable={false}
                onChange={updateForm('description')}
              />
            </StackItem>
          </Stack>
          <LocationSelectContent
            operationMode={{ read: true, write: true }}
            onCurrentPathUpdate={onCurrentPathUpdate}
          />

          <DialogFooter>
            <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
            <PrimaryButton onClick={handleSubmit} text={formatMessage('Next')} disabled={disable} />
          </DialogFooter>
        </form>
      </CreateDialog>
    </Fragment>
  );
};

export default DefineConversation;
