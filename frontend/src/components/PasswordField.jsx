import { useState } from "react";
import Icon from "./Icon";

export default function PasswordField({ id, label, hint, ...inputProps }) {
  const [visible, setVisible] = useState(false);
  return (
    <div className="field">
      <label htmlFor={id}>{label}</label>
      <div className="input-affix">
        <input id={id} type={visible ? "text" : "password"} aria-describedby={hint ? `${id}-hint` : undefined} {...inputProps} />
        <button
          type="button"
          className="affix-btn"
          onClick={() => setVisible((v) => !v)}
          aria-label={visible ? "Hide password" : "Show password"}
        >
          <Icon name={visible ? "eyeOff" : "eye"} />
        </button>
      </div>
      {hint && (
        <p id={`${id}-hint`} className="field-hint">
          {hint}
        </p>
      )}
    </div>
  );
}
