# Svestro

A CLI tool to generate an Astro content configuration file from a Sveltia CMS configuration file.

## 🎯 Purpose

Svestro bridges the gap between [Sveltia CMS](https://github.com/sveltia/sveltia-cms) and [Astro](https://astro.build) by automatically converting your Sveltia configuration into Astro's content collections format. This eliminates the need to manually maintain two separate configuration files and ensures consistency between your CMS and static site generator.

## ✨ Features

- 🔄 **Automatic Conversion**: Converts Sveltia CMS config to Astro content config
- 🌐 **i18n Support**: Handles internationalization configurations
- 📁 **Collection Management**: Supports all Sveltia collection types
- 🎨 **Widget Support**: Maps Sveltia widgets to appropriate Zod schemas
- 🖥️ **Interactive CLI**: User-friendly command-line interface
- ⚡ **Built with Bun**: Fast and efficient TypeScript execution

## 🚀 Installation

### No installation

```bash
npx svestro
```

```bash
bunx svestro
```

### Local Installation

```bash
npm i -D svestro
```

```bash
bun i -D svestro
```

## 📖 Usage

### Interactive Mode

Run the CLI in interactive mode to be guided through the configuration process:

```bash
svestro
```

The interactive mode will prompt you for:

- Path to your Sveltia config file (default: `./static/admin/config.yml`)
- Output path for the Astro content config (default: `./src/content/config.ts`)
- Optional collection base path prefix

### Command Line Arguments

You can also use command line arguments for automated workflows:

```bash
svestro --help
```

## 🏗️ How It Works

1. **Reads** your existing Sveltia CMS configuration file
2. **Parses** the collections and field definitions
3. **Maps** Sveltia widgets to appropriate Zod schema types
4. **Generates** a complete Astro content configuration file
5. **Handles** internationalization if configured

### Supported Widgets

Svestro supports all major Sveltia widgets and maps them to appropriate Zod schemas:

- **String** → `z.string()`
- **Boolean** → `z.boolean()`
- **Number** → `z.number()`
- **DateTime** → `z.date()`
- **Select** → `z.enum()` or `z.string()`
- **List** → `z.array()`
- **Markdown** → `z.string()`
- **Image/File** → `z.string()`
- **Relation** → `reference()`
- **Code** → `z.string()`
- **Color** → `z.string()`
- **UUID** → `z.string()`

## 📁 Project Structure

```text
svestro/
├── src/
│   ├── application/
│   │   └── services/
│   │       └── astro/          # Astro config generation service
│   ├── domain/
│   │   ├── Collection/         # Collection domain models
│   │   ├── services/           # Domain services
│   │   └── widgets/            # Widget implementations
│   └── presentation/
│       └── cli/                # CLI interface
├── __mocks__/                  # Test configuration files
```

## 🧪 Development

### Prerequisites

- [Bun](https://bun.sh) (recommended) or Node.js 18+
- TypeScript 5+

### Setup

```bash
# Clone the repository
git clone https://github.com/nico-i/svestro.git
cd svestro

# Install dependencies
bun install

# Run in development mode
bun run dev

# Build for production
bun run build

# Run tests
bun test

# Lint and format
bun run lint
```

### Testing

The project includes comprehensive tests covering:

- Widget mapping functionality
- Collection parsing
- CLI interface
- Configuration generation

Run tests with:

```bash
bun test
```

## 🤝 Contributing

Contributions are welcome! Please feel free to submit a Pull Request. For major changes, please open an issue first to discuss what you would like to change.

### Development Workflow

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Add tests for new functionality
5. Ensure tests pass (`bun test`)
6. Lint your code (`bun run lint`)
7. Commit your changes (`git commit -m 'Add some amazing feature'`)
8. Push to the branch (`git push origin feature/amazing-feature`)
9. Open a Pull Request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 🙏 Acknowledgments

- [Sveltia CMS](https://github.com/sveltia/sveltia-cms) - For creating an excellent headless CMS
- [Astro](https://astro.build) - For the amazing static site generator
- [Zod](https://zod.dev) - For the powerful schema validation library

## 📞 Support

If you encounter any issues or have questions, please:

1. Check the [existing issues](https://github.com/nico-i/svestro/issues)
2. Create a new issue if your problem isn't already reported
3. Provide as much detail as possible, including your configuration files (sanitized)

---

Made with ❤️ by [Nico Ismaili](https://github.com/nico-i)
