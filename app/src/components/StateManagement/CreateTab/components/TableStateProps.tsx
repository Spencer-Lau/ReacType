import React, { useState, useEffect } from 'react';
import { DataGrid, GridEditRowsModel } from '@mui/x-data-grid';
import Button from '@mui/material/Button';
import ClearIcon from '@mui/icons-material/Clear';
import makeStyles from '@mui/styles/makeStyles';
import { StatePropsPanelProps } from '../../../../interfaces/Interfaces';
import { useDispatch, useSelector } from 'react-redux';
import { deleteState } from '../../../../redux/reducers/slice/appStateSlice';
import { RootState } from '../../../../redux/store';
import { ColumnTab } from '../../../../interfaces/Interfaces';
import { emitEvent } from '../../../../helperFunctions/socket';

// updates state mgmt boxes and data grid
const TableStateProps = (props) => {
  const state = useSelector((store: RootState) => store.appState);
  const contextParam = useSelector((store: RootState) => store.contextSlice);
  const roomCode = useSelector((store: RootState) => store.roomSlice.roomCode);

  const dispatch = useDispatch();
  const classes = useStyles();
  const [editRowsModel] = useState<GridEditRowsModel>({});
  const [gridColumns, setGridColumns] = useState([]);
  const currentId = state.canvasFocus.componentId;
  const currentComponent = state.components[currentId - 1];

  // formatting for data grid columns
  const columnTabs: ColumnTab[] = [
    {
      field: 'id',
      headerName: 'ID',
      width: 30,
      editable: false
    },
    {
      field: 'key',
      headerName: 'Key',
      width: 90,
      editable: true
    },
    {
      field: 'value',
      headerName: 'Initial Value',
      width: 100,
      editable: true,
      valueGetter: (param) => {
        //to display the actual object or array instead of [object Object], leave undefined if it is setter function
        if (param.row.type === 'func') return;
        return JSON.stringify(param.row.value);
      }
    },
    {
      field: 'type',
      headerName: 'Type',
      width: 90,
      editable: false
    },
    {
      field: 'delete',
      headerName: 'X',
      width: 30,
      editable: false,
      renderCell: function renderCell(params: any) {
        return (
          <Button
            style={{ width: `${3}px`, color: 'black' }}
            onClick={() => {
              handleDeleteState(params.id);
            }}
          >
            <ClearIcon style={{ width: `${15}px` }} />
          </Button>
        );
      }
    }
  ];

  const handleDeleteState = (selectedId) => {
    const currentId = state.canvasFocus.componentId;
    const currentComponent = state.components[currentId - 1];
    const filtered = currentComponent.stateProps.filter(
      (element) => element.id !== selectedId
    );
    dispatch(
      deleteState({
        stateProps: filtered,
        rowId: selectedId,
        contextParam: contextParam
      })
    );

    if (roomCode) {
      emitEvent('deleteStateAction', roomCode, {
        stateProps: filtered,
        rowId: selectedId,
        contextParam: contextParam
      });
    }
  };

  useEffect(() => {
    setGridColumns(columnTabs);
  }, [props.isThemeLight]);

  const { selectHandler }: StatePropsPanelProps = props;

  useEffect(() => {
    if (props.canDeleteState) {
      setGridColumns(columnTabs);
    } else {
      setGridColumns(columnTabs.slice(0, gridColumns.length - 1));
    }
  }, [state.canvasFocus.componentId]);

  // rows to show are either from current component or from a given provider
  let rows = [];
  currentComponent.stateProps?.forEach((prop) => {
    rows.push(prop);
  });

  return (
    <div className={'state-prop-grid'}>
      <DataGrid
        rows={rows}
        columns={gridColumns}
        pageSize={5}
        rowsPerPageOptions={[5]}
        editRowsModel={editRowsModel}
        onRowClick={selectHandler}
        className={props.isThemeLight ? classes.themeLight : classes.themeDark}
        disableColumnMenu={true}
      />
    </div>
  );
};

const useStyles = makeStyles({
  themeLight: {
    color: 'white',
    '& button:hover': {
      backgroundColor: 'LightGray'
    },
    '& button': {
      color: 'white'
    }
  },
  themeDark: {
    color: 'white',
    '& .MuiTablePagination-root': {
      color: 'white'
    },
    '& .MuiIconButton-root': {
      color: 'white'
    },
    '& .MuiSvgIcon-root': {
      color: 'white'
    },
    '& .MuiDataGrid-window': {
      backgroundColor: 'rgba(0,0,0,0.54)'
    }
  }
});

export default TableStateProps;
