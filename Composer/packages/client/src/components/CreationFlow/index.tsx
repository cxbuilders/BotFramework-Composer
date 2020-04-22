// Copyright (c) Microsoft Corporation.
// Licensed under the MIT License.

import Path from 'path';

import React, { useState, useEffect, useContext, useRef, Fragment, Suspense } from 'react';
import { RouteComponentProps, Router } from '@reach/router';

import { LoadingSpinner } from '../../components/LoadingSpinner';
import { CreationFlowStatus, DialogCreationCopy, Steps } from '../../constants';
import { StoreContext } from '../../store';
import Home from '../../pages/home';

import { CreateOptions } from './CreateOptions/index';
import { OpenProject } from './OpenProject';
import DefineConversation from './DefineConversation';

interface CreationFlowProps extends RouteComponentProps<{}> {
  creationFlowStatus?: CreationFlowStatus;
  setCreationFlowStatus: (status) => void;
  creationParams?: any;
}

const CreationFlow: React.FC<CreationFlowProps> = props => {
  console.log('HIT fuckong here');
  const [step, setStep] = useState(Steps.NONE);
  const { state, actions } = useContext(StoreContext);
  const { creationFlowStatus, setCreationFlowStatus, creationParams } = props;
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

  const init = async () => {
    await fetchTemplates();
    // load storage system list
    await fetchStorages();

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
    const fetchTemplatesAndStorage = async () => {
      await init();
      console.log('awaited', templateProjects);
    };
    fetchTemplatesAndStorage();
  }, []);

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
    setCreationFlowStatus(CreationFlowStatus.CLOSE);
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
    },
    [Steps.LOCATION]: {
      ...DialogCreationCopy.SELECT_LOCATION,
      children: <OpenProject onOpen={openBot} onDismiss={handleDismiss} onCurrentPathUpdate={updateCurrentPath} />,
    },
    [Steps.DEFINE]: {
      ...DialogCreationCopy.DEFINE_CONVERSATION_OBJECTIVE,
    },
  };

  return (
    <Fragment>
      <Home />
      <Suspense fallback={<LoadingSpinner />}>
        <Router>
          <DefineConversation
            onSubmit={handleSubmit}
            onDismiss={handleDismiss}
            onCurrentPathUpdate={updateCurrentPath}
            creationParams={creationParams}
            path="/define"
          />
          <CreateOptions
            templates={templateProjects}
            onDismiss={handleDismiss}
            onNext={handleCreateNext}
            saveTemplateId={saveTemplateId}
            path="/create"
          />
        </Router>
      </Suspense>
    </Fragment>
  );
};

export default CreationFlow;
