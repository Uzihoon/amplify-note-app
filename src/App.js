import API from '@aws-amplify/api';
import { Button, Input, List } from 'antd';
import React, { useEffect, useReducer } from 'react';
import { listNotes } from './graphql/queries';
import 'antd/dist/antd.css';
import { v4 as uuid } from 'uuid';
import {
  createNote as CreateNote,
  deleteNote as DeleteNote,
  updateNote as UpdateNote
} from './graphql/mutations';

const initialState = {
  notes: [],
  loading: true,
  error: false,
  form: { name: '', description: '' }
};

const CLIENT_ID = uuid();

function reducer(state, action) {
  switch (action.type) {
    case 'SET_NOTES':
      return { ...state, notes: action.notes, loading: false };
    case 'ERROR':
      return { ...state, loading: false, error: true };
    case 'ADD_NOTE':
      return { ...state, notes: [action.note, ...state.notes] };
    case 'RESET_FORM':
      return { ...state, form: initialState.form };
    case 'SET_INPUT':
      return { ...state, form: { ...state.form, [action.name]: action.value } };
    default:
      return state;
  }
}

function App() {
  const [state, dispatch] = useReducer(reducer, initialState);

  const updateNote = async note => {
    const index = state.notes.findIndex(n => n.id === note.id);
    const notes = [...state.notes];
    notes[index].completed = !note.completed;

    dispatch({ type: 'SET_NOTES', notes });

    try {
      await API.graphql({
        query: UpdateNote,
        variables: { input: { id: note.id, completed: notes[index].completed } }
      });
      alert('note successfully updated!');
    } catch (err) {
      console.log('error: ', err);
    }
  };

  const deleteNote = async ({ id }) => {
    const index = state.notes.findIndex(n => n.id === id);
    const notes = [
      ...state.notes.slice(0, index),
      ...state.notes.slice(index + 1)
    ];

    dispatch({ type: 'SET_NOTES', notes });

    try {
      await API.graphql({
        query: DeleteNote,
        variables: { input: { id } }
      });
      alert('successfully deleted note!');
    } catch (err) {
      console.log('error: ', err);
    }
  };

  const createNote = async () => {
    const { form } = state;
    if (!form.name || !form.description) {
      return alert('Please enter a name and description');
    }

    const note = { ...form, clientId: CLIENT_ID, completed: false, id: uuid() };
    dispatch({ type: 'ADD_NOTE', note });
    dispatch({ type: 'RESET_FORM' });

    try {
      await API.graphql({
        query: CreateNote,
        variables: { input: note }
      });
      alert('successfully created note!');
    } catch (err) {
      console.log('error: ', err);
    }
  };

  const fetchNotes = async () => {
    try {
      const notesData = await API.graphql({
        query: listNotes
      });
      dispatch({ type: 'SET_NOTES', notes: notesData.data.listNotes.items });
    } catch (err) {
      console.log('error: ', err);
      dispatch({ type: 'ERROR' });
    }
  };

  const onChange = ({ target: { value, name } }) => {
    dispatch({ type: 'SET_INPUT', name, value });
  };

  const renderItem = item => {
    return (
      <List.Item
        style={styles.item}
        actions={[
          <p style={styles.p} onClick={() => deleteNote(item)}>
            Delete
          </p>,
          <p style={styles.p} onClick={() => updateNote(item)}>
            {item.completed ? 'completed' : 'mark completed'}
          </p>
        ]}
      >
        <List.Item.Meta title={item.name} description={item.description} />
      </List.Item>
    );
  };

  useEffect(() => {
    fetchNotes();
  }, []);

  return (
    <div style={styles.container}>
      <Input
        onChange={onChange}
        value={state.form.name}
        placeholder='Note name'
        name='name'
        style={styles.input}
      />
      <Input
        onChange={onChange}
        value={state.form.description}
        placeholder='Note description'
        name='description'
        style={styles.input}
      />
      <Button onClick={createNote} type='primary'>
        Create Note
      </Button>
      <List
        loading={state.loading}
        dataSource={state.notes}
        renderItem={renderItem}
      />
    </div>
  );
}

const styles = {
  container: { padding: 20 },
  input: { marginBottom: 10 },
  item: { textAlign: 'left' },
  p: { color: '#1809ff', cursor: 'pointer' }
};

export default App;
