# krishi-ghar

## Permanent cPanel-safe deploy build

Use this every time:

```bash
npm run build
```

Now `npm run build` does all of this automatically:
- builds `dist/`
- strips macOS metadata files (`.DS_Store`, `._*`, `__MACOSX`)
- creates clean ZIP files:
  - `Archive.zip` (project root)
  - `dist/Archive.zip` (copy)

Upload either ZIP to cPanel.

## Optional commands

```bash
npm run build:dist   # only build dist (no zip)
npm run zip:cpanel   # create clean zips from existing dist
```
# krishi-ghar
