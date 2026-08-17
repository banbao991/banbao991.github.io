(function initDirectoryLibrary(global) {
  function setup(options) {
    const input = document.querySelector(options.input || '#search-input');
    const count = document.querySelector(options.count || '#visible-count');
    const empty = document.querySelector(options.empty || '#empty-state');
    const clearButton = document.querySelector(options.clear || '#clear-search');
    const groups = options.groups;

    const filter = () => {
      const keyword = input.value.trim().toLowerCase();
      let visible = 0;

      groups.forEach((group) => {
        let groupVisible = 0;
        group.items.forEach((item) => {
          const matched = options.isMatch(item, keyword);
          item.hidden = !matched;
          if (matched) groupVisible += 1;
        });
        group.element.hidden = groupVisible === 0;
        visible += groupVisible;
      });

      count.textContent = visible;
      empty.hidden = visible !== 0;
      if (options.content) options.content.hidden = visible === 0;
    };

    input.addEventListener('input', filter);
    clearButton.addEventListener('click', () => {
      input.value = '';
      filter();
      input.focus();
    });

    document.addEventListener('keydown', (event) => {
      if (event.key === '/' && document.activeElement !== input) {
        event.preventDefault();
        input.focus();
      }
      if (event.key === 'Escape' && document.activeElement === input) {
        input.value = '';
        filter();
        input.blur();
      }
    });

    const backToTop = document.querySelector('#back-to-top');
    if (backToTop) {
      backToTop.addEventListener('click', (event) => {
        event.preventDefault();
        window.scrollTo({ top: 0, behavior: 'smooth' });
      });
    }

    filter();
    return filter;
  }

  function showLoadError(options) {
    options.content.hidden = true;
    options.empty.hidden = false;
    options.empty.querySelector('p').textContent = options.message;
    options.clearButton.hidden = true;
  }

  global.BanbaoDirectory = { setup, showLoadError };
}(window));
