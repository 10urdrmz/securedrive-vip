/** Opens the browser print dialog focused on the boarding pass voucher. */
export function printVoucher() {
  document.body.classList.add('is-printing-voucher');

  const cleanup = () => {
    document.body.classList.remove('is-printing-voucher');
    window.removeEventListener('afterprint', cleanup);
  };

  window.addEventListener('afterprint', cleanup);
  requestAnimationFrame(() => window.print());
}
