# Svestro

CLI tool to generate an Astro content configuration file from a Sveltia CMS configuration file.

## Installation

```bash
npm install -g svestro
```

Or run directly with npx:

```bash
npx svestro
```

## Usage

### Interactive Mode

Run without any flags to use the interactive mode:

```bash
svestro
```

This will prompt you for:

- Path to your Sveltia config file
- Output path for the Astro content config
- Content directory path (relative to the config)

### Command Line Mode

Use flags to run without prompts:

```bash
svestro --input ./static/admin/config.yml --output ./src/content/config.ts
```

#### Options

- `-i, --input <path>`: Path to Sveltia config file (required for non-interactive mode)
- `-o, --output <path>`: Output path for Astro content config (required for non-interactive mode)
- `-c, --content-dir <path>`: Path to content directory (relative to config, defaults to "../..")
- `-V, --version`: Output the version number
- `-h, --help`: Display help information

### Examples

Generate Astro config from default Sveltia config:

```bash
svestro -i ./static/admin/config.yml -o ./src/content/config.ts
```

With custom content directory:

```bash
svestro -i ./admin/config.yml -o ./content/config.ts -c ./content
```

## Development

```bash
# Install dependencies
bun install

# Build the CLI
bun run build

# Run in development mode
bun run dev

# Test the built CLI
node out/index.js --help
```

## License

MIT

CLI tool to generate an Astro content configuration file from a Sveltia configuration file.
