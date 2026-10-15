import { Component } from "react";
import Button from "../ui/Button";
export default class ErrorBoundary extends Component {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  render() {
    if (!this.state.failed) return this.props.children;
    return <main className="recovery-page"><section className="card"><h1>Something went wrong</h1><p>This screen could not be displayed. Reload to try again.</p><p>Reloading will discard changes that have not been saved.</p><Button onClick={() => window.location.reload()}>Reload page</Button></section></main>;
  }
}
