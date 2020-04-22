// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import { Dialog, DialogType } from 'office-ui-fabric-react/lib/Dialog';
import React from 'react';

import { styles } from '../StepWizard/styles';

export function CreateDialog(props) {
  const { title, subText, onDismiss, isHidden } = props;
  return (
    <Dialog
      hidden={false}
      onDismiss={onDismiss}
      dialogContentProps={{
        type: DialogType.normal,
        title,
        subText,
        styles: styles.dialog,
      }}
      modalProps={{
        isBlocking: false,
        styles: styles.modal,
      }}
    >
      {props.children}
    </Dialog>
  );
}
