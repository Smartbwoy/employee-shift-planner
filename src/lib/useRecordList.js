import { useState } from "react";
import Button from "../components/ui/Button";

// Pages operate on records already loaded by the API; this is not server paging.
export default function useRecordList(records, label, searchText, sortValue) {
  const [search, setSearch] = useState("");
  const [descending, setDescending] = useState(false);
  const [requestedPage, setPage] = useState(0);
  const filtered = (records ?? []).filter(item => searchText(item).toLowerCase().includes(search.toLowerCase()))
    .slice().sort((a, b) => String(sortValue(a)).localeCompare(String(sortValue(b)), undefined, { numeric: true }) * (descending ? -1 : 1));
  const pages = Math.max(1, Math.ceil(filtered.length / 25));
  const page = Math.min(requestedPage, pages - 1);
  return {
    rows: filtered.slice(page * 25, (page + 1) * 25),
    controls: <div className="record-controls" role="group" aria-label={`${label} list controls`}>
      <label>Search {label}<input type="search" value={search} onChange={event => { setSearch(event.target.value); setPage(0); }} /></label>
      <label>Sort {label}<select value={descending ? "descending" : "ascending"} onChange={event => { setDescending(event.target.value === "descending"); setPage(0); }}><option value="ascending">Ascending</option><option value="descending">Descending</option></select></label>
      <span role="status">{filtered.length} results · Page {page + 1} of {pages}</span>
      <Button tone="gray" disabled={page === 0} onClick={() => setPage(page - 1)}>Previous</Button>
      <Button tone="gray" disabled={page + 1 === pages} onClick={() => setPage(page + 1)}>Next</Button>
    </div>,
  };
}
