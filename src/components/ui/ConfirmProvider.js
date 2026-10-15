import { createContext, useCallback, useContext, useEffect, useRef, useState } from "react";
import Modal from "./Modal";
import Button from "./Button";

const Context = createContext(null);
export const useConfirm = () => {
  const confirm = useContext(Context);
  if (!confirm) throw new Error("Confirmation provider is missing.");
  return confirm;
};

export default function ConfirmProvider({ children }) {
  const [prompt, setPrompt] = useState(null);
  const pending = useRef(null);
  const confirm = useCallback((message, label = "Continue", cancelLabel = "Cancel") => {
    if (pending.current) return Promise.resolve(false);
    return new Promise(resolve => { pending.current = resolve; setPrompt({ message, label, cancelLabel }); });
  }, []);
  const finish = result => { pending.current?.(result); pending.current = null; setPrompt(null); };
  useEffect(() => () => { pending.current?.(false); }, []);
  return <Context.Provider value={confirm}>
    {children}
    {prompt ? <Modal onClose={() => finish(false)} aria-labelledby="confirmation-title" aria-describedby="confirmation-description">
      <h2 id="confirmation-title">Confirm action</h2>
      <p id="confirmation-description">{prompt.message}</p>
      <div className="modal-actions"><Button autoFocus tone="gray" onClick={() => finish(false)}>{prompt.cancelLabel}</Button><Button onClick={() => finish(true)}>{prompt.label}</Button></div>
    </Modal> : null}
  </Context.Provider>;
}
