# React Photo Gallery

Single page, one-column photo gallery with infinite scroll over the paginated feed
`https://picsum.photos/v2/list?page=N`.

- Renders each photo (`download_url`) with its `author`
- Scrolling near the bottom fetches the next page and appends it; stops when a page returns no data
- Thumbs-up (Font Awesome) with a count per photo, starting at 0, +1 per click

## Run
```bash
npm install
npm run dev
```
