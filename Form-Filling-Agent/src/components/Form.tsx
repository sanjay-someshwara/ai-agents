import { useSelector } from 'react-redux';
import { RootState } from '../redux/store';
import "../styles/Form.css";
import { useEffect, useState } from 'react';
import { useDispatch } from 'react-redux';
import { resetUser } from '../redux/slices/userSlice'; // Import resetUser action

export default function Form() {
  const dispatch = useDispatch();
  const { name, email, phone, address } = useSelector((state: RootState) => state.user);
  const [formData, setFormData] = useState({
    name: name || "",
    email: email || "",
    phone: phone || "",
    address: address || "",
  });
  const [state, updateState] = useState(true);
  const [isSubmitted, setIsSubmitted] = useState(false);

  useEffect(() => {
    if (name) setFormData(prev => ({ ...prev, name }));
    if (email) setFormData(prev => ({ ...prev, email }));
    if (phone) setFormData(prev => ({ ...prev, phone }));
    if (address) setFormData(prev => ({ ...prev, address }));
  }, [name, phone, address, email]);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsSubmitted(true);

    // Dispatch resetUser action to reset the Redux state
    dispatch(resetUser({ submit: state }));
    updateState(!state);
    
    // Reset form data after submission
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
    });
  };

  const handleClose = () => {
    setIsSubmitted(false);
  };

  return (
    <div className="form-container">
      {isSubmitted && (
        <div className="success-message-overlay">
          <div className="message-box">
            <button className="close-button" onClick={handleClose}>×</button>
            <h1 className="success-text">Form Submitted Successfully!</h1>
          </div>
        </div>
      )}
      <h2>User Form</h2>
      <form className="styled-form" onSubmit={handleSubmit}>
        <input
          type="text"
          name="name"
          placeholder="Full Name"
          value={formData.name}
          onChange={handleChange}
        />
        <input
          type="email"
          name="email"
          placeholder="Email Address"
          value={formData.email}
          onChange={handleChange}
        />
        <input
          type="tel"
          name="phone"
          placeholder="Phone Number"
          value={formData.phone}
          onChange={handleChange}
        />
        <input
          type="text"
          name="address"
          placeholder="Street Address"
          value={formData.address}
          onChange={handleChange}
        />
        <button type="submit">Submit</button>
      </form>
    </div>
  );
}
