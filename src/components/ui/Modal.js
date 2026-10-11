import { useLayoutEffect, useRef } from "react";
import "./Modal.css";

export default function Modal({ children, onClose, busy = false, className = "", ...props }) {
  const ref = useRef(null);
  useLayoutEffect(() => {
    const opener = document.activeElement;
    const dialog = ref.current;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    dialog.showModal();
    return () => {
      dialog.close();
      document.body.style.overflow = previousOverflow;
      if (opener?.isConnected) opener.focus({ preventScroll: true });
    };
  }, []);
  return <dialog ref={ref} className={`app-modal ${className}`} {...props} onCancel={event => { event.preventDefault(); if (!busy) onClose(); }}>{children}</dialog>;
}
