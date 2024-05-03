import '@testing-library/jest-dom';

import {
  fireEvent,
  render,
  screen,
  waitFor,
  within
} from '@testing-library/react';

import BottomTabs from '../app/src/components/bottom/BottomTabs';
import { BrowserRouter } from 'react-router-dom';
import ComponentPanel from '../app/src/components/right/ComponentPanel';
import ContextManager from '../app/src/components/ContextAPIManager/ContextManager';
import CustomizationPanel from '../app/src/containers/CustomizationPanel';
import { DndProvider } from 'react-dnd';
import DragDropPanel from '../app/src/components/left/DragDropPanel';
import { HTML5Backend } from 'react-dnd-html5-backend';
import HTMLPanel from '../app/src/components/left/HTMLPanel';
import MainContainer from '../app/src/containers/MainContainer';
import { Provider } from 'react-redux';
import React from 'react';
import StateManager from '../app/src/components/StateManagement/StateManagement';
import store from '../app/src/redux/store';

describe('Bottom Panel Render Test', () => {
  test('should render all six tabs', () => {
    render(
      <Provider store={store}>
        <BottomTabs />
      </Provider>
    );
    expect(screen.getAllByRole('tab')).toHaveLength(6);
    // expect(screen.getByText('Code Preview')).toBeInTheDocument();
    expect(screen.getByText('Component Tree')).toBeInTheDocument();
    expect(screen.getByText('Creation Panel')).toBeInTheDocument();
    expect(screen.getByText('Customization')).toBeInTheDocument();
    expect(screen.getByText('CSS Editor')).toBeInTheDocument();
    expect(screen.getByText('Context Manager')).toBeInTheDocument();
    expect(screen.getByText('State Manager')).toBeInTheDocument();
  });
});

describe('Creation Panel', () => {
  test('should invalidate empty field in New Component name', async () => {
    render(
      <Provider store={store}>
        <ComponentPanel isThemeLight={null} />
      </Provider>
    );

    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(
        screen.getByText('Component name cannot be blank.')
      ).toBeInTheDocument();
    });
  });

  test('should invalidate New Component name containing symbols', async () => {
    render(
      <Provider store={store}>
        <ComponentPanel isThemeLight={null} />
      </Provider>
    );

    fireEvent.change(screen.getByLabelText('Name:'), {
      target: {
        value: '!@#'
      }
    });

    fireEvent.click(screen.getByText('Create'));

    await waitFor(() => {
      expect(
        screen.getByText('Component name must start with a letter.')
      ).toBeInTheDocument();
    });
  });

  test('should invalidate empty field in HTML Tag tag', async () => {
    render(
      <Provider store={store}>
        <HTMLPanel isThemeLight={null} />
      </Provider>
    );

    fireEvent.click(screen.getByText('Add Element'));

    await waitFor(() => {
      expect(screen.getAllByText('* Input cannot be blank. *')).toHaveLength(2);
    });
  });

  test('should invalidate HTML Element name containing symbols', async () => {
    render(
      <Provider store={store}>
        <HTMLPanel isThemeLight={null} />
      </Provider>
    );

    fireEvent.change(screen.getByLabelText('Element Name:'), {
      target: {
        value: '!@#'
      }
    });

    fireEvent.change(screen.getByLabelText('Tag:'), {
      target: {
        value: '!@#'
      }
    });

    fireEvent.click(screen.getByText('Add Element'));

    await waitFor(() => {
      expect(
        screen.getAllByText('* Input must start with a letter. *')
      ).toHaveLength(2);
    });
  });
});

describe('Context Manager', () => {
  test('should render Create/Edit, Assign, and Display tabs', () => {
    render(
      <Provider store={store}>
        <ContextManager />
      </Provider>
    );
    expect(screen.getAllByRole('tab')).toHaveLength(3);
  });
  test('Create/Edit Tab should contain all buttons, inputs field, and a data table', () => {
    render(
      <Provider store={store}>
        <ContextManager />
      </Provider>
    );
    expect(screen.getAllByRole('textbox')).toHaveLength(3);
    expect(screen.getAllByRole('button')).toHaveLength(4);
    expect(screen.getByText('Context Name')).toBeInTheDocument();
    expect(screen.getByRole('table')).toBeInTheDocument();
  });
  test('Assign Tab should contain all buttons and input fields', () => {
    render(
      <Provider store={store}>
        <ContextManager />
      </Provider>
    );

    fireEvent.click(screen.getByText('Assign'));
    expect(screen.getByText('Contexts Consumed')).toBeInTheDocument();
    const dropdown = screen.getByLabelText('Select Component');
    expect(dropdown).toBeInTheDocument();
    expect(screen.getAllByRole('button')).toHaveLength(1);
    expect(screen.getAllByRole('combobox')).toHaveLength(2);
    expect(screen.getAllByRole('table')).toHaveLength(2);
  });
});

describe('State Manager', () => {
  test('Should render all containers', () => {
    render(
      <Provider store={store}>
        <StateManager isThemeLight={null} />
      </Provider>
    );
    expect(screen.getAllByRole('heading')).toHaveLength(4);
    expect(screen.getAllByRole('textbox')).toHaveLength(2);
    expect(screen.getAllByRole('grid')).toHaveLength(3);
    expect(screen.getAllByRole('columnheader')).toHaveLength(9);
  });

  test('Display tab should render correct elements', () => {
    render(
      <Provider store={store}>
        <StateManager isThemeLight={null} />
      </Provider>
    );
    fireEvent.click(screen.getByText('Display'));
    expect(screen.getByRole('table')).toBeInTheDocument();
    expect(
      screen.getByText('State Initialized in Current Component:')
    ).toBeInTheDocument();
  });
});

describe('Customization Panel', () => {
  test('Should render customization container with no elements in Canvas', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <CustomizationPanel />
        </BrowserRouter>
      </Provider>
    );
    expect(screen.getByText('Parent Component:')).toBeInTheDocument();
    expect(screen.getByText('App')).toBeInTheDocument();
    expect(
      screen.getByText(
        'Drag and drop an html element (or focus one) to see what happens!'
      )
    ).toBeInTheDocument();
  });
  test('Should render all buttons and inputs when Canvas has element', () => {
    render(
      <Provider store={store}>
        <BrowserRouter>
          <DndProvider backend={HTML5Backend}>
            <DragDropPanel />
            <MainContainer />
            <CustomizationPanel />
          </DndProvider>
        </BrowserRouter>
      </Provider>
    );
    const drop = screen.getByTestId('drop');
    const div = screen.getAllByText('Div')[0];
    expect(drop).toBeInTheDocument();
    expect(div).toBeInTheDocument();
    fireEvent.dragStart(div);
    fireEvent.dragEnter(drop);
    fireEvent.dragOver(drop);
    fireEvent.drop(drop);
    //check if customization panel elements are rendering correctly
    const panel = screen.getByTestId('customization');
    expect(within(panel).getAllByRole('textbox')).toHaveLength(4);
    // check dropdowns
    expect(within(panel).getAllByRole('button')).toHaveLength(12);
  });
});
