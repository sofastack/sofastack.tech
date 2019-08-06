import { $ } from './utils'

import qs from 'query-string'
import algoliasearch from 'algoliasearch'

export default function searchFunc() {
  if (!$(".ss-search")) {
    return
  }

  const input = $('#js-search-input')
  const button = $('#js-search-button')
  const list = $('#js-result-container')

  const client = algoliasearch('G2HVBB5ERN', '4b161290c268b4eeb154171c562aa1e4')
  const index = client.initIndex('sofastack')

  const searchFunc = (query) => {
    index.search({ query }, (err, { hits } = {}) => {
      if (err) {
        console.log(err);
        console.log(err.debugData);
        return;
      }

      const highlight = (str) => {
        return str.replace(new RegExp(query, 'gi'), '<span class="highlight">$&</span>')
      }

      list.innerHTML = hits.map((hit) => `
				<div class="ss-summary">
					<div class="title">
						<a href=${hit.permalink}>${hit.title}</a>
					</div>
					<div class="summary">
						${highlight(hit.summary)}...
					</div>
					<div class="meta">
						来自 · ${hit.type}
					</div>
				</div>
			`).join('')
    });
  }

  const query = qs.parseUrl(location.href).query
  if (query.query) {
    searchFunc(query.query)
  }

  button.addEventListener('click', () => {
    searchFunc(input.value)
  })

  input.addEventListener('keydown', (event) => {
    if (event.key === 'Enter') {
      searchFunc(input.value)
    }
  })
}