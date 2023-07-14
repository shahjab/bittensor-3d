import {
    createSlice,
    PayloadAction,
  } from '@reduxjs/toolkit';
  
  const initialState = {
    neurons: [],
  };
  
  export const utilSlice = createSlice({
    name: 'util',
    initialState,
    reducers: {
      setNeurons: (state, action) => {
        state.neurons = action.payload['neurons'];
        localStorage.setItem('neurons', JSON.stringify(state.neurons));
      },
    },
  });
  // Here we are just exporting the actions from this slice, so that we can call them anywhere in our app.
  export const {
    setNeurons,
  } = utilSlice.actions;
  
  // exporting the reducer here, as we need to add this to the store
  export default utilSlice.reducer;