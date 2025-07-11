import ChatBox from "./components/ChatBox";
import Form from "./components/Form";
import "./App.css"; // Import global styles
import { Provider } from "react-redux";
import { store } from "./redux/store";

export default function App() {
  return (
    <Provider store={store}>
    <div className="container">
      <div className="chat-box">
        <ChatBox />
      </div>
      <div className="form-box">
        <Form />
      </div>
    </div>
    </Provider>
  );
}
