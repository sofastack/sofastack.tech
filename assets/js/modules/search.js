import { $ } from './utils'

import qs from 'query-string'
import algoliasearch from 'algoliasearch'

export default function searchFunc() {

  // menu search input
  if ($("#js-menu-search")) {
    function jump2Search() {
      const query = $("#js-menu-search .input").value
      window.location.href = `/search/?query=${encodeURIComponent(query)}`
    }

    $("#js-menu-search .input").addEventListener('keydown', function(event) {
      if (event.key === 'Enter') {
        jump2Search()
      }
    })

    $("#js-menu-search .icon").addEventListener('click', function() {
      jump2Search()
    })
  }

  if (!$(".ss-search")) {
    return
  }

  const input = $('#js-search-input')
  const button = $('#js-search-button')
  // const type = $('#js-result-type')
  const list = $('#js-result-container')

  const client = algoliasearch('G2HVBB5ERN', '4b161290c268b4eeb154171c562aa1e4')
  const index = client.initIndex('sofastack')

  const searchFunc = (query) => {
    // update URL but no need to refresh
    history.pushState(null, `${query} · SOFAStack`, `/search/?query=${encodeURIComponent(query)}`)

    index.search({ 
      query,
      facets:"type"
    }, (err, { hits } = {}) => {
      if (err) {
        // console.log(err)
        // console.log(err.debugData)
        return
      }

      if (hits.length === 0) {
        // TODO: i18n 
        list.innerHTML = `
          <div class="not-found">未找到搜索结果</div>
        `
        return
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
    })
  }

  const query = qs.parseUrl(location.href).query.query
  if (query) {
    input.value = query
    searchFunc(query)
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