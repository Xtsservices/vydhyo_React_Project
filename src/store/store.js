// store.js
import { createStore } from "redux";

const initialData = {
  currentUserData: null,
  myCartItems: 0,
  checkoutTotalBalance: 0,
};

function Reducer(state = initialData, action) {
  switch (action.type) {
    case "currentUserData":
      return { ...state, currentUserData: action.payload };
    default:
      return state;
  }
}

const store = createStore(Reducer);
export default store;
export const dispatch = store.dispatch;



