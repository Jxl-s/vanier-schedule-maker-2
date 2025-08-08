# Vanier Schedule Builder

A very quick fix of [vanier-courses-api](https://github.com/Jxl-s/vanier-courses-api), uses javascript as a backend instead (due to cheaper costs and easier deployment), and does not get courses in real-time due to new format

## Side-note

In `/src/courses`, I provided an example on how to reverse-engineer the API which Vanier uses for courses, which
could be used to make a real-time schedule maker.

If anyone would like to use that code, feel free, as long as you
give proper credits to this repository. I am not planning on implementing it onto this project due to limitations by Vercel.

## ✨ Features

- 🔍 **Course Search**: Search and add courses from the complete Vanier course catalog
- ⚠️ **Conflict Detection**: Automatically prevents scheduling overlaps
- 📅 **Multiple Schedules**: Generate all possible valid schedule combinations
- 📊 **Visual Timeline**: Interactive weekly schedule grid view
- 💾 **Save/Load**: Save your favorite schedules locally
- 📱 **Responsive**: Works on desktop, tablet, and mobile devices

## 🚀 Getting Started

1. Visit [Vanier Schedule Builder](https://vanier-schedule-maker-2.vercel.app)
2. Search for courses using course codes (e.g., "420-110-VA")
3. Add courses to your schedule
4. Select preferred sections
5. Generate and browse all possible schedule combinations

## 🛠️ Technology Stack

- **Frontend**: Next.js 13, React 18, TypeScript
- **Styling**: Tailwind CSS

## 📝 Development

```bash
# Install dependencies
npm install

# Run development server
npm run dev

# Build for production
npm run build

# Start production server
npm start
```

## 🤝 Contributing

Contributions are welcome! Feel free to:
- Report bugs
- Suggest new features  
- Submit pull requests
- Improve documentation

## 📄 License

This project is open source and available under the [MIT License](LICENSE).

## 🎯 SEO Keywords

Vanier College, schedule builder, course planner, class schedule, academic planning, college timetable, Vanier courses, schedule maker, course registration help