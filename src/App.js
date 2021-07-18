import API from '@aws-amplify/api';
import React, { useReducer } from 'react';
import { listNotes } from './graphql/queries';

const initialState = {
  notes: [],
  loading: true,
  error: false,
  from: { name: '', description: '' }
};

function reducer(state, action) {
  switch (action.type) {
    case 'SET_NOTES':
      return { ...state, notes: action.notes, loading: false };
    case 'ERROR':
      return { ...state, loading: false, error: true };
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);
  const fetchNotes = async () => {
    try {
      const notesData = await API.graphql({
        query: listNotes
      });
    } catch (err) {
      console.log('error: ', err);
      dispatch({ type: 'ERROR' });
    }
  };
}
