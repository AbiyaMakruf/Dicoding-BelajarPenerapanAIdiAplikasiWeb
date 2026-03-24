export default class HeaderView {
  async render() {
    return `
      <header class="app-header">
        <div class="brand">
          <div class="brand-icon">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              stroke-width="2"
              stroke-linecap="round"
              stroke-linejoin="round"
            >
              <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path>
            </svg>
          </div>
          <h1 class="brand-text">Nutri<span class="brand-highlight">Vision</span></h1>
        </div>

        <div class="header-status">
          <span class="status-badge">
            <span id="status-text">Memuat...</span>
          </span>
        </div>
      </header>
    `;
  }

  updateStatus(message) {
    const statusText = document.getElementById('status-text');
    if (statusText) statusText.textContent = message;
  }
}
