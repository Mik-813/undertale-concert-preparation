// Metro stops: a tap on a station opens its photos, one station at a time.
export function initMetro() {
  let open = null;
  const set = (li, on) => {
    li.classList.toggle('is-open', on);
    li.querySelector('.stop').setAttribute('aria-expanded', on);
  };
  document.addEventListener('click', (e) => {
    const btn = e.target.closest('.stop');
    if (!btn) return;
    const li = btn.parentElement;
    if (open && open !== li) set(open, false);
    set(li, !li.classList.contains('is-open'));
    open = li.classList.contains('is-open') ? li : null;
  });
}
