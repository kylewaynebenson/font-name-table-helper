# Font Name Table Helper

A web tool for generating proper naming conventions for variable fonts in Glyphs app.

## Features

- Configure variable font axes (weight, width, optical size, italic, slant)
- Define custom name mappings for axis values
- Generate style names, PostScript names, and full names
- Split large families into subfamilies
- Contextual naming tips based on Glyphs documentation
- Automatic localStorage persistence

## Usage

1. Set your font family name
2. Configure axes in the desired order
3. Add axis values and name mappings
4. Review generated instances in the output table

## Development

```bash
npm install
npm start
```

## Deploy

```bash
npm run build
npm run deploy
```

The app will be available at GitHub Pages after deployment.
