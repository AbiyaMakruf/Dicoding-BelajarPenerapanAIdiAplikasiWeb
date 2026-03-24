import HeaderView from '../components/header/header-view.js';
import HeaderPresenter from '../components/header/header-presenter.js';
import HomePage from './home/home-page.js';

class App {
  #content = null;
  #headerPresenter = null;

  constructor({ content }) {
    this.#content = content;
  }

  async renderPage() {
    const headerView = new HeaderView();
    const headerHTML = await headerView.render();
    this.#headerPresenter = new HeaderPresenter({ view: headerView });

    const page = new HomePage({ headerPresenter: this.#headerPresenter });
    const pageHTML = await page.render();

    // Gabungkan header dan halaman utama, lalu render ke DOM
    this.#content.innerHTML = headerHTML + pageHTML;
    await page.afterRender();
  }
}

export default App;
