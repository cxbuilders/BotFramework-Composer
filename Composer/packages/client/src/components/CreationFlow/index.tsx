// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Path from 'path';

import React, { useState, useEffect, useContext, useRef } from 'react';
import { RouteComponentProps } from '@reach/router';

import { CreationFlowStatus, DialogCreationCopy, Steps } from '../../constants';
import { StoreContext } from '../../store';

import { CreateOptions } from './CreateOptions/index';
import { DefineConversation } from './DefineConversation/index';
import { OpenProject } from './OpenProject';
import { StepWizard } from './StepWizard/StepWizard';

interface CreationFlowProps extends RouteComponentProps<{}> {
  creationFlowStatus?: CreationFlowStatus;
  setCreationFlowStatus?: (status) => void;
  creationParams?: any;
}

const CreationFlow: React.FC<CreationFlowProps> = props => {
  console.log('Im inside creation flow');
  const { state, actions } = useContext(StoreContext);
  const { creationFlowStatus, setCreationFlowStatus, creationParams } = props;
  const [step, setStep] = useState(Steps.NONE);
  const {
    fetchTemplates,
    openBotProject,
    createProject,
    saveProjectAs,
    saveTemplateId,
    fetchStorages,
    fetchFolderItemsByPath,
  } = actions;
  const { templateId, templateProjects, storages } = state;
  const currentStorageIndex = useRef(0);
  const storage = storages[currentStorageIndex.current];
  const currentStorageId = storage ? storage.id : 'default';
  useEffect(() => {
    if (storages && storages.length) {
      const storageId = storage.id;
      const path = storage.path;
      const formattedPath = Path.normalize(path);
      fetchFolderItemsByPath(storageId, formattedPath);
    }
  }, [storages]);

  const init = () => {
    if (creationFlowStatus !== CreationFlowStatus.CLOSE) {
      fetchTemplates();
    }

    // load storage system list
    fetchStorages();

    switch (creationFlowStatus) {
      case CreationFlowStatus.NEW:
        setStep(Steps.CREATE);
        break;
      case CreationFlowStatus.OPEN:
        setStep(Steps.LOCATION);
        break;
      case CreationFlowStatus.NEW_FROM_SCRATCH:
      case CreationFlowStatus.NEW_FROM_TEMPLATE:
      case CreationFlowStatus.SAVEAS:
        setStep(Steps.DEFINE);
        break;
      default:
        setStep(Steps.NONE);
        break;
    }
  };

  useEffect(() => {
    init();
  }, [creationFlowStatus]);

  const updateCurrentPath = async (newPath, storageId) => {
    if (!storageId) {
      storageId = currentStorageId;
    }
    if (newPath) {
      const formattedPath = Path.normalize(newPath);
      await actions.updateCurrentPath(formattedPath, storageId);
    }
  };

  const handleDismiss = () => {
    // setCreationFlowStatus(CreationFlowStatus.CLOSE);
  };

  const openBot = async botFolder => {
    await openBotProject(botFolder);
    handleDismiss();
  };

  const handleCreateNew = async formData => {
    await createProject(templateId || '', formData.name, formData.description, formData.location, formData.schemaUrl);
  };

  const handleSaveAs = async formData => {
    await saveProjectAs(state.projectId, formData.name, formData.description, formData.location);
  };

  const handleSubmit = formData => {
    switch (creationFlowStatus) {
      case CreationFlowStatus.NEW_FROM_SCRATCH:
      case CreationFlowStatus.NEW_FROM_TEMPLATE:
      case CreationFlowStatus.NEW:
        handleCreateNew(formData);
        break;
      case CreationFlowStatus.SAVEAS:
        handleSaveAs(formData);
        break;
      default:
        setStep(Steps.NONE);
        break;
    }
    handleDismiss();
  };

  const handleCreateNext = data => {
    saveTemplateId(data);
    setStep(Steps.DEFINE);
  };

  const steps = {
    [Steps.CREATE]: {
      ...DialogCreationCopy.CREATE_NEW_BOT,
      children: (
        <CreateOptions
          templates={templateProjects}
          onDismiss={handleDismiss}
          onNext={handleCreateNext}
          saveTemplateId={saveTemplateId}
        />
      ),
    },
    [Steps.LOCATION]: {
      ...DialogCreationCopy.SELECT_LOCATION,
      children: <OpenProject onOpen={openBot} onDismiss={handleDismiss} onCurrentPathUpdate={updateCurrentPath} />,
    },
    [Steps.DEFINE]: {
      ...DialogCreationCopy.DEFINE_CONVERSATION_OBJECTIVE,
      children: (
        <DefineConversation
          onSubmit={handleSubmit}
          onDismiss={handleDismiss}
          onCurrentPathUpdate={updateCurrentPath}
          creationParams={creationParams}
        />
      ),
    },
  };

  return <StepWizard steps={steps} step={step} onDismiss={handleDismiss} />;
};

export default CreationFlow;
