import { configureStore } from '@reduxjs/toolkit'
import boardReducer from './boardReducer'
import roomReducer from './roomReducer'
import { socketMiddleware } from './socketMiddleware'

const store = configureStore({
  reducer: {
    boardState: boardReducer,
    roomState: roomReducer
  },
  middleware: (getDefaultMiddleware) => 
    getDefaultMiddleware().concat(socketMiddleware)
});

export default store;
