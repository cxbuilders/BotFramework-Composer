// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

/** @jsx jsx */
import { jsx } from '@emotion/core';
import { useState, Fragment } from 'react';
import formatMessage from 'format-message';
import { PrimaryButton, DefaultButton } from 'office-ui-fabric-react/lib/Button';
import { DialogFooter } from 'office-ui-fabric-react/lib/Dialog';
import { navigate } from '@reach/router';

import { CreateDialog } from '../ModalDialog';

const CreateOptions = props => {
  const onDismiss = () => {
    navigate('./create/define');
  };
  return (
    <Fragment>
      <CreateDialog title="Conversation Objective and shit" subText="Hell hole" onDismiss={onDismiss}>
        <h1>Fuck u</h1>
        <DialogFooter>
          <DefaultButton onClick={onDismiss} text={formatMessage('Cancel')} />
        </DialogFooter>
      </CreateDialog>
    </Fragment>
  );
};
export default CreateOptions;
