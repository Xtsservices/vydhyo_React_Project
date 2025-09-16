// store.js
import { createStore } from "redux";

const initialData = {
  currentUserData: null,
  doctorData:null,
  myCartItems: 0,
  checkoutTotalBalance: 0,
};


 const PERSIST_KEY = "APP_STATE_V1";
 const preloaded = (() => {
   try {
     const raw = localStorage.getItem(PERSIST_KEY);
     if (!raw) return undefined; // fall back to initialData
     const parsed = JSON.parse(raw);
     return { ...initialData, ...parsed };
   } catch {
     return undefined;
   }
 })();

function Reducer(state = initialData, action) {
  switch (action.type) {
    case "currentUserData":
      return { ...state, currentUserData: action.payload };
      case "doctorData":
      return { ...state, doctorData: action.payload };
    default:
      return state;
  }
}

 const store = createStore(Reducer, preloaded);
 store.subscribe(() => {
   try {
     const s = store.getState();
     localStorage.setItem(
       PERSIST_KEY,
       JSON.stringify({
         currentUserData: s.currentUserData,
         doctorData: s.doctorData,
       })
     );
   } catch {}
 });
export default store;
export const dispatch = store.dispatch;



