import { createContext, useCallback, useContext, useEffect, useId, useRef } from "react";
import { UNSAFE_DataRouterContext, useBlocker } from "react-router-dom";
import { useConfirm } from "../components/ui/ConfirmProvider";

const Context = createContext(null);
function RouteBlocker({ dirty }) {
  const confirm = useConfirm();
  const blocker = useBlocker(useCallback(() => dirty(), [dirty]));
  useEffect(() => {
    if (blocker.state !== "blocked") return;
    let active = true;
    confirm("You have unsaved changes. Leave this page and discard them?", "Discard changes", "Keep editing").then(leave => {
      if (active) { if (leave) blocker.proceed(); else blocker.reset(); }
    });
    return () => { active = false; };
  }, [blocker, confirm]);
  return null;
}
export function UnsavedChangesProvider({ children }) {
  const entries = useRef(new Map());
  const router = useContext(UNSAFE_DataRouterContext);
  const dirty = useCallback(() => [...entries.current.values()].some(ref => ref.current), []);
  useEffect(() => {
    const unload = event => { if (dirty()) { event.preventDefault(); event.returnValue = ""; } };
    window.addEventListener("beforeunload", unload);
    return () => window.removeEventListener("beforeunload", unload);
  }, [dirty]);
  return <Context.Provider value={entries.current}>{router ? <RouteBlocker dirty={dirty} /> : null}{children}</Context.Provider>;
}
export default function useUnsavedChanges(dirty) {
  const entries = useContext(Context);
  const id = useId();
  const ref = useRef(dirty);
  const saved = useRef(false);
  if (!dirty) saved.current = false;
  ref.current = dirty && !saved.current;
  useEffect(() => {
    entries?.set(id, ref);
    return () => { entries?.delete(id); };
  }, [entries, id]);
  return () => { saved.current = true; ref.current = false; };
}
