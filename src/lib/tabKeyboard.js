export default function tabKeyboard(event, index, count, select) {
  let next;
  if (event.key === "ArrowRight") next = (index + 1) % count;
  else if (event.key === "ArrowLeft") next = (index + count - 1) % count;
  else if (event.key === "Home") next = 0;
  else if (event.key === "End") next = count - 1;
  else return;
  event.preventDefault();
  select(next);
  event.currentTarget.parentElement.querySelectorAll('[role="tab"]')[next]?.focus();
}
