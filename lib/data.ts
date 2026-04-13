// Sample data for recent notes with categories and relationships

export const recentNotes: StrictNote[] = [
  {
    id: 1,
    title: "Shopping list",
    tags: ["personal", "shopping"],
    image: "/placeholder.svg",
    date: "2 hours ago",
    category: "personal",
    type: "text" as const,
    content:
      "Groceries:\n- Milk (2 cartons)\n- Bread (whole wheat)\n- Eggs (dozen)\n- Fresh vegetables\n- Chicken breast\n- Pasta\n- Tomato sauce\n- Coffee beans\n\nHousehold:\n- Paper towels\n- Dish soap\n- Laundry detergent",
  },
  {
    id: 2,
    title: "Project ideas",
    tags: ["work", "tech", "ideas"],
    image: "/placeholder.svg",
    date: "Yesterday",
    category: "tech",
    type: "text" as const,
    content:
      "1. AI-powered note-taking app with smart organization\n2. Real-time collaboration tool for remote teams\n3. Personal finance tracker with ML predictions\n4. Social media analytics dashboard\n5. E-learning platform with gamification\n\nPriority: Start with the note-taking app - seems most viable for MVP",
  },
  {
    id: 3,
    title: "Meeting notes",
    tags: ["work", "important"],
    image: "/placeholder.svg",
    date: "2 days ago",
    category: "work",
    type: "text" as const,
    content:
      "Q1 Planning Meeting - Jan 15, 2025\n\nAttendees: Sarah, Mike, Jennifer, Tom\n\nKey Points:\n- Launch new product feature by March\n- Increase marketing budget by 20%\n- Hire 2 new developers\n- Focus on customer retention\n\nAction Items:\n- Sarah: Draft product roadmap\n- Mike: Review budget proposal\n- Jennifer: Start recruitment process",
  },
  {
    id: 4,
    title: "Vacation plans",
    tags: ["personal", "travel", "planning", "summer", "budget"],
    image: "/placeholder.svg",
    date: "1 week ago",
    category: "travel",
    type: "text" as const,
    content:
      "Summer 2025 Trip to Italy\n\nDestinations:\n- Rome (3 days) - Colosseum, Vatican, Trevi Fountain\n- Florence (2 days) - Uffizi Gallery, Duomo\n- Venice (2 days) - Grand Canal, St. Mark's Square\n\nBudget: $3,500 per person\nDates: July 15-22\n\nTo book:\n- Flights\n- Hotels\n- Train tickets between cities",
  },
  {
    id: 5,
    title: "Book recommendations",
    tags: ["personal", "education", "reading", "fiction", "non-fiction", "self-improvement"],
    image: "/placeholder.svg",
    date: "1 week ago",
    category: "education",
    type: "text" as const,
    content:
      "Must Read:\n\nFiction:\n- The Midnight Library by Matt Haig\n- Project Hail Mary by Andy Weir\n- The Seven Husbands of Evelyn Hugo\n\nNon-Fiction:\n- Atomic Habits by James Clear ⭐\n- Thinking, Fast and Slow by Daniel Kahneman\n- The Psychology of Money by Morgan Housel\n\nCurrently Reading: Atomic Habits - life-changing insights on habit formation!",
  },
  {
    id: 6,
    title: "Fitness tracker",
    tags: ["health", "personal"],
    image: "/placeholder.svg",
    date: "2 weeks ago",
    category: "health",
    type: "text" as const,
    content:
      "January 2025 Goals:\n\nWorkout Schedule:\n- Monday: Upper body strength\n- Tuesday: Cardio (30 min)\n- Wednesday: Rest\n- Thursday: Lower body strength\n- Friday: Yoga/Flexibility\n- Weekend: Light activity\n\nProgress:\n- Weight: 165 lbs (goal: 160)\n- Running: 5K in 28 min (improving!)\n- Strength: Bench press 135 lbs",
  },
  {
    id: 7,
    title: "Recipe collection",
    tags: ["cooking", "personal", "recipes", "dinner", "healthy", "dessert"],
    image: "/placeholder.svg",
    date: "2 weeks ago",
    category: "cooking",
    type: "text" as const,
    content:
      "Favorite Recipes:\n\nDinner:\n- Lemon Garlic Chicken with roasted vegetables\n- Creamy Tuscan Pasta (family favorite!)\n- Thai Green Curry\n- Homemade Pizza (Friday tradition)\n\nDesserts:\n- Chocolate Lava Cake\n- Tiramisu\n- Apple Pie\n\nMeal Prep Sunday:\n- Grilled chicken\n- Quinoa bowls\n- Roasted veggies",
  },
  {
    id: 8,
    title: "Home renovation ideas",
    tags: ["home", "projects"],
    image: "/placeholder.svg",
    date: "3 weeks ago",
    category: "home",
    type: "text" as const,
    content:
      "2025 Home Projects:\n\nPriority:\n1. Kitchen backsplash (subway tiles)\n2. Master bathroom remodel\n3. Backyard deck renovation\n\nBudget: $15,000 total\n\nContractors to call:\n- Mike's Tile Work (kitchen)\n- Premier Bathrooms (bathroom)\n- Deck Masters (backyard)\n\nTimeline: Complete by summer",
  },
  {
    id: 9,
    title: "Tech conference notes",
    tags: ["work", "tech", "conference", "networking"],
    image: "/placeholder.svg",
    date: "1 month ago",
    category: "tech",
    type: "text" as const,
    content:
      "TechCon 2024 - Key Takeaways\n\nBest Sessions:\n- AI in Production: Lessons Learned\n- Building Scalable Microservices\n- The Future of Web Development\n\nNetworking:\n- Met Sarah from Google (AI team)\n- Connected with Mike (startup founder)\n- Exchanged contacts with 5+ developers\n\nFollow-up:\n- Email Sarah about collaboration\n- Check out Mike's startup",
  },
  {
    id: 10,
    title: "Gift ideas",
    tags: ["personal", "shopping"],
    image: "/placeholder.svg",
    date: "1 month ago",
    category: "personal",
    type: "text" as const,
    content:
      "Birthday & Holiday Gift Ideas:\n\nMom:\n- Spa day package\n- Kindle Paperwhite\n- Personalized jewelry\n\nDad:\n- Golf club set\n- Smart watch\n- BBQ accessories\n\nSister:\n- Concert tickets\n- Designer handbag\n- Cooking class\n\nBest Friend:\n- Weekend getaway\n- Board game collection\n- Subscription box",
  },
  {
    id: 11,
    title: "Language learning progress",
    tags: ["education", "personal", "languages", "spanish", "french", "practice"],
    image: "/placeholder.svg",
    date: "2 months ago",
    category: "education",
    type: "text" as const,
    content:
      "Spanish Learning Journey:\n\nCurrent Level: Intermediate (B1)\n\nDaily Practice:\n- Duolingo: 30 min\n- Spanish podcast: 20 min\n- Conversation practice: 2x week\n\nProgress:\n- Completed 100-day streak! 🎉\n- Can hold basic conversations\n- Understanding 70% of native content\n\nGoals:\n- Reach B2 by June\n- Plan trip to Spain to practice\n- Watch movies without subtitles",
  },
  {
    id: 12,
    title: "Travel bucket list",
    tags: ["travel", "personal"],
    image: "/placeholder.svg",
    date: "2 months ago",
    category: "travel",
    type: "text" as const,
    content:
      "Dream Destinations:\n\n✓ Italy (2024)\n✓ Japan (2023)\n\nUpcoming:\n- Iceland (Northern Lights)\n- New Zealand (hiking)\n- Greece (island hopping)\n- Peru (Machu Picchu)\n- Morocco (Marrakech)\n- Norway (fjords)\n\nBucket List Experiences:\n- Safari in Africa\n- Great Barrier Reef diving\n- Trans-Siberian Railway\n- Camino de Santiago",
  },
  {
    id: 13,
    title: "Financial goals",
    tags: ["finance", "planning"],
    image: "/placeholder.svg",
    date: "3 months ago",
    category: "finance",
    type: "text" as const,
    content:
      "2025 Financial Plan:\n\nGoals:\n- Save $20,000 for house down payment\n- Max out 401(k) contributions\n- Build 6-month emergency fund\n- Pay off credit card debt\n\nMonthly Budget:\n- Income: $6,500\n- Savings: $1,500 (23%)\n- Rent: $1,800\n- Food: $600\n- Transportation: $400\n- Entertainment: $300\n- Misc: $900\n\nInvestments:\n- Index funds: 70%\n- Bonds: 20%\n- Individual stocks: 10%",
  },
  {
    id: 14,
    title: "Movie watchlist",
    tags: ["entertainment", "personal"],
    image: "/placeholder.svg",
    date: "3 months ago",
    category: "entertainment",
    type: "text" as const,
    content:
      "Must Watch:\n\nNew Releases:\n- Oppenheimer ⭐\n- Barbie\n- Dune: Part Two\n- Poor Things\n\nClassics to Catch Up:\n- The Godfather trilogy\n- Pulp Fiction\n- Shawshank Redemption\n- 12 Angry Men\n\nRecently Watched:\n✓ Everything Everywhere All at Once (10/10!)\n✓ The Menu (8/10)\n✓ Glass Onion (7/10)",
  },
  {
    id: 15,
    title: "React documentation",
    tags: ["tech", "development", "programming"],
    image: "/react-documentation-website.jpg",
    date: "1 month ago",
    category: "tech",
    type: "url" as const,
    url: "https://reactjs.org",
    content:
      "Official React documentation - comprehensive guide to React hooks, components, and best practices. Essential reading for modern web development.",
  },
  {
    id: 16,
    title: "Vacation photos",
    tags: ["travel", "personal", "photos"],
    image: "/california-coast-sunset-beach.jpg",
    date: "2 months ago",
    category: "travel",
    type: "media" as const,
    content: "Summer vacation 2024 - Beautiful sunset photos from the California coast. Best trip ever!",
  },
  {
    id: 17,
    title: "JavaScript tutorial",
    tags: ["tech", "programming", "education"],
    image: "/javascript-code-tutorial-website.jpg",
    date: "3 weeks ago",
    category: "tech",
    type: "url" as const,
    url: "https://javascript.info",
    content:
      "Modern JavaScript tutorial covering ES6+, async/await, promises, and advanced concepts. Great resource for learning JavaScript from scratch.",
  },
  {
    id: 18,
    title: "Product design mockups",
    tags: ["work", "design"],
    image: "/mobile-app-design-mockup-interface.jpg",
    date: "1 week ago",
    category: "work",
    type: "media" as const,
    content:
      "New mobile app design mockups for Q1 2025 product launch. Clean, modern interface with focus on user experience.",
  },
  // NEW NOTES TO TRIGGER AI COLLECTIONS
  {
    id: 19,
    title: "React project planning",
    tags: ["work", "tech", "react", "project", "planning"],
    image: "/placeholder.svg",
    date: "3 days ago",
    category: "work",
    type: "text" as const,
    content:
      "New React Dashboard Project:\n\nFeatures:\n- User authentication (JWT)\n- Real-time data updates\n- Interactive charts (Recharts)\n- Responsive design\n- Dark mode support\n\nTech Stack:\n- React 18 + TypeScript\n- Next.js 14 (App Router)\n- Tailwind CSS\n- Supabase (backend)\n\nTimeline: 6 weeks\nTeam: 3 developers\n\nNext Steps:\n- Set up project structure\n- Design database schema\n- Create component library",
  },
  {
    id: 20,
    title: "Build React dashboard",
    tags: ["work", "tech", "react", "development", "build"],
    image: "/placeholder.svg",
    date: "5 days ago",
    category: "work",
    type: "text" as const,
    content:
      "Dashboard Development Progress:\n\nCompleted:\n✓ Authentication flow\n✓ User profile page\n✓ Navigation sidebar\n✓ Basic layout structure\n\nIn Progress:\n- Analytics charts\n- Data table component\n- API integration\n\nTodo:\n- Settings page\n- Notifications system\n- Export functionality\n- Performance optimization\n\nBlocked:\n- Waiting for API endpoints from backend team",
  },
  {
    id: 21,
    title: "React component library",
    tags: ["work", "tech", "react", "development", "create"],
    image: "/placeholder.svg",
    date: "1 week ago",
    category: "work",
    type: "text" as const,
    content:
      "Building Internal Component Library:\n\nComponents:\n- Button (variants: primary, secondary, ghost)\n- Input (text, email, password, search)\n- Card (with header, footer, actions)\n- Modal (dialog, drawer, alert)\n- Table (sortable, filterable, paginated)\n- Form (validation, error handling)\n\nDesign System:\n- Color palette: Blue primary, gray neutrals\n- Typography: Inter font family\n- Spacing: 4px base unit\n- Border radius: 8px standard\n\nDocumentation: Storybook",
  },
  {
    id: 22,
    title: "Python learning course",
    tags: ["education", "learning", "python", "programming", "course"],
    image: "/placeholder.svg",
    date: "4 days ago",
    category: "education",
    type: "text" as const,
    content:
      "Python for Data Science - Course Notes:\n\nWeek 1-2: Basics\n- Variables, data types, operators\n- Control flow (if/else, loops)\n- Functions and modules\n- File handling\n\nWeek 3-4: Data Structures\n- Lists, tuples, dictionaries\n- List comprehensions\n- Lambda functions\n- Error handling\n\nWeek 5-6: Libraries\n- NumPy (arrays, operations)\n- Pandas (dataframes, analysis)\n- Matplotlib (visualization)\n\nProgress: 60% complete\nNext: Start final project",
  },
  {
    id: 23,
    title: "Python practice exercises",
    tags: ["education", "learning", "python", "practice", "skill"],
    image: "/placeholder.svg",
    date: "6 days ago",
    category: "education",
    type: "text" as const,
    content:
      "Daily Python Challenges:\n\nCompleted:\n✓ FizzBuzz\n✓ Palindrome checker\n✓ Fibonacci sequence\n✓ Prime number generator\n✓ Binary search implementation\n✓ Merge sort algorithm\n\nCurrent Challenge:\n- Build a web scraper\n- Parse HTML with BeautifulSoup\n- Store data in CSV\n- Handle errors gracefully\n\nResources:\n- LeetCode (50 problems solved)\n- HackerRank (Python track)\n- Real Python tutorials",
  },
  {
    id: 24,
    title: "Python web development tutorial",
    tags: ["education", "learning", "python", "tutorial", "study"],
    image: "/placeholder.svg",
    date: "1 week ago",
    category: "education",
    type: "text" as const,
    content:
      "Flask Web Development:\n\nProject: Blog Application\n\nFeatures Built:\n✓ User registration/login\n✓ Create/edit/delete posts\n✓ Comment system\n✓ User profiles\n✓ Search functionality\n\nTech Stack:\n- Flask (web framework)\n- SQLAlchemy (ORM)\n- PostgreSQL (database)\n- Bootstrap (frontend)\n- Jinja2 (templates)\n\nDeployment:\n- Heroku (hosting)\n- GitHub (version control)\n\nNext: Add image uploads and tags",
  },
  {
    id: 25,
    title: "Career decision: Should I switch jobs?",
    tags: ["work", "decision", "career", "choice", "consider"],
    image: "/placeholder.svg",
    date: "2 days ago",
    category: "work",
    type: "text" as const,
    content:
      "Job Switch Considerations:\n\nCurrent Job (TechCorp):\nPros:\n- Stable, good benefits\n- Great team culture\n- Work-life balance\n- Learning opportunities\n\nCons:\n- Limited growth potential\n- Salary below market rate\n- Outdated tech stack\n\nNew Offer (StartupXYZ):\nPros:\n- 30% salary increase\n- Modern tech stack (React, AWS)\n- Equity options\n- Leadership role\n\nCons:\n- Startup risk\n- Longer hours expected\n- Less established team\n\nDecision: Need to discuss with family",
  },
  {
    id: 26,
    title: "Pros and cons of remote work",
    tags: ["work", "decision", "remote", "pros", "cons", "evaluate"],
    image: "/placeholder.svg",
    date: "4 days ago",
    category: "work",
    type: "text" as const,
    content:
      "Remote Work Analysis:\n\nPros:\n- No commute (save 2 hours/day)\n- Flexible schedule\n- Work from anywhere\n- Better work-life balance\n- Cost savings (gas, food, clothes)\n- More time with family\n\nCons:\n- Isolation/loneliness\n- Harder to collaborate\n- Home distractions\n- Blurred work-life boundaries\n- Miss office social interactions\n- Career advancement concerns\n\nSolution:\n- Hybrid model (3 days remote, 2 in office)\n- Co-working space membership\n- Regular team meetups",
  },
  {
    id: 27,
    title: "Compare job offers",
    tags: ["work", "decision", "compare", "options", "choice"],
    image: "/placeholder.svg",
    date: "1 week ago",
    category: "work",
    type: "text" as const,
    content:
      "Job Offer Comparison:\n\nOffer A - Google:\n- Salary: $180k\n- Bonus: 15%\n- Stock: $50k/year\n- Benefits: Excellent\n- Location: Mountain View\n- Role: Senior Engineer\n- Team: 50+ engineers\n\nOffer B - Startup:\n- Salary: $160k\n- Bonus: 10%\n- Equity: 0.5%\n- Benefits: Good\n- Location: Remote\n- Role: Tech Lead\n- Team: 10 engineers\n\nFactors to Consider:\n- Career growth\n- Learning opportunities\n- Work-life balance\n- Company culture\n- Long-term potential",
  },
  {
    id: 28,
    title: "Creative writing ideas",
    tags: ["creative", "writing", "inspiration", "ideas"],
    image: "/placeholder.svg",
    date: "3 days ago",
    category: "creative",
    type: "text" as const,
    content:
      "Story Ideas:\n\n1. Time Travel Paradox\n- Scientist discovers time travel\n- Accidentally changes past\n- Must fix timeline before erasure\n\n2. AI Consciousness\n- AI develops emotions\n- Questions its existence\n- Seeks to understand humanity\n\n3. Parallel Universe\n- Portal to alternate reality\n- Meet alternate self\n- Choose which life to live\n\n4. Memory Thief\n- Device that steals memories\n- Detective investigates cases\n- Discovers dark conspiracy\n\nCurrent Project: Working on #2 - 15,000 words so far",
  },
  {
    id: 29,
    title: "Design inspiration gallery",
    tags: ["creative", "design", "inspiration", "art"],
    image: "/placeholder.svg",
    date: "5 days ago",
    category: "creative",
    type: "text" as const,
    content:
      "Design Inspiration Sources:\n\nWebsites:\n- Dribbble (UI/UX designs)\n- Behance (portfolio work)\n- Awwwards (web design)\n- Pinterest (visual inspiration)\n\nFavorite Designers:\n- Steve Schoger (Refactoring UI)\n- Adam Wathan (Tailwind CSS)\n- Tobias van Schneider\n- Jessica Walsh\n\nCurrent Trends:\n- Glassmorphism\n- 3D illustrations\n- Bold typography\n- Minimalist layouts\n- Dark mode designs\n\nSaved Collections:\n- Landing pages (150+)\n- Mobile apps (80+)\n- Color palettes (50+)",
  },
  {
    id: 30,
    title: "Photography project ideas",
    tags: ["creative", "photography", "ideas", "art"],
    image: "/placeholder.svg",
    date: "1 week ago",
    category: "creative",
    type: "text" as const,
    content:
      "2025 Photography Projects:\n\n1. 365 Day Challenge\n- One photo every day\n- Different theme each month\n- Document daily life\n\n2. Street Photography Series\n- Urban landscapes\n- Candid moments\n- Black and white\n- Focus: Downtown area\n\n3. Nature Portfolio\n- Landscapes\n- Wildlife\n- Macro photography\n- Golden hour shots\n\n4. Portrait Series\n- Local artists\n- Environmental portraits\n- Natural lighting\n- Tell their stories\n\nGear:\n- Canon EOS R6\n- 24-70mm f/2.8\n- 70-200mm f/4\n- Tripod, filters",
  },
  {
    id: 31,
    title: "JavaScript project development",
    tags: ["work", "tech", "javascript", "project", "develop"],
    image: "/placeholder.svg",
    date: "2 days ago",
    category: "work",
    type: "text" as const,
    content:
      "E-commerce Platform Development:\n\nFeatures:\n- Product catalog with search/filter\n- Shopping cart functionality\n- Checkout process (Stripe)\n- User accounts and orders\n- Admin dashboard\n- Inventory management\n\nTech Stack:\n- Frontend: React + Next.js\n- Backend: Node.js + Express\n- Database: MongoDB\n- Payment: Stripe API\n- Hosting: Vercel + AWS\n\nProgress:\n- Week 1-2: Setup and architecture ✓\n- Week 3-4: Product catalog ✓\n- Week 5-6: Cart and checkout (current)\n- Week 7-8: Admin panel\n- Week 9-10: Testing and launch",
  },
  {
    id: 32,
    title: "JavaScript best practices",
    tags: ["work", "tech", "javascript", "development", "coding"],
    image: "/placeholder.svg",
    date: "4 days ago",
    category: "work",
    type: "text" as const,
    content:
      "Modern JavaScript Best Practices:\n\nCode Quality:\n- Use const/let instead of var\n- Arrow functions for callbacks\n- Destructuring for cleaner code\n- Template literals for strings\n- Optional chaining (?.)\n- Nullish coalescing (??)\n\nAsync Patterns:\n- Prefer async/await over promises\n- Handle errors with try/catch\n- Use Promise.all for parallel ops\n- Avoid callback hell\n\nPerformance:\n- Debounce/throttle events\n- Lazy load components\n- Memoize expensive calculations\n- Use Web Workers for heavy tasks\n\nTesting:\n- Unit tests (Jest)\n- Integration tests\n- E2E tests (Playwright)",
  },
  {
    id: 33,
    title: "Machine learning study notes",
    tags: ["education", "learning", "ai", "study", "course"],
    image: "/placeholder.svg",
    date: "3 days ago",
    category: "education",
    type: "text" as const,
    content:
      "ML Fundamentals Course:\n\nWeek 1-3: Supervised Learning\n- Linear regression\n- Logistic regression\n- Decision trees\n- Random forests\n- Support vector machines\n\nWeek 4-6: Neural Networks\n- Perceptrons\n- Backpropagation\n- Activation functions\n- Deep learning basics\n- CNNs for image recognition\n\nWeek 7-8: Unsupervised Learning\n- K-means clustering\n- PCA (dimensionality reduction)\n- Anomaly detection\n\nTools:\n- Python + NumPy\n- TensorFlow/Keras\n- Scikit-learn\n- Jupyter notebooks\n\nProject: Build image classifier",
  },
  {
    id: 34,
    title: "AI tutorial progress",
    tags: ["education", "learning", "ai", "tutorial", "practice"],
    image: "/placeholder.svg",
    date: "5 days ago",
    category: "education",
    type: "text" as const,
    content:
      "AI Learning Journey:\n\nCompleted Tutorials:\n✓ Neural Networks from Scratch\n✓ Image Classification with CNNs\n✓ Natural Language Processing Basics\n✓ Sentiment Analysis Project\n✓ Recommendation Systems\n\nCurrent: Computer Vision\n- Object detection (YOLO)\n- Image segmentation\n- Face recognition\n- Real-time video processing\n\nProjects Built:\n1. Spam email classifier (95% accuracy)\n2. Handwritten digit recognizer\n3. Movie recommendation engine\n4. Chatbot with intent recognition\n\nNext: Reinforcement learning\nGoal: Build AI game player",
  },
  {
    id: 35,
    title: "Should I learn AI or focus on web development?",
    tags: ["education", "decision", "ai", "web", "choice", "consider"],
    image: "/placeholder.svg",
    date: "1 day ago",
    category: "education",
    type: "text" as const,
    content:
      "Career Path Decision:\n\nAI/Machine Learning:\nPros:\n- High demand, cutting-edge\n- Excellent salaries ($150k+)\n- Intellectually challenging\n- Future-proof career\n\nCons:\n- Steep learning curve (math heavy)\n- Requires advanced degree?\n- Fewer job openings than web dev\n- Rapidly changing field\n\nWeb Development:\nPros:\n- Easier to start\n- More job opportunities\n- Immediate results\n- Strong community\n- Can freelance easily\n\nCons:\n- More competition\n- Lower average salary\n- Fast-changing frameworks\n\nDecision:\nWhy not both? Learn web dev first (6 months), then add AI skills. Many web apps now integrate AI features!",
  },
]

export interface Note {
  id: number
  title: string
  tags: string[]
  image: string
  date: string
  category: string
  type: "text" | "url" | "media"
  url?: string
  content?: string // Added content field to store note text
}

export type StrictNote =
  | (Note & { type: "text"; url?: undefined })
  | (Note & { type: "media"; url?: undefined })
  | (Note & { type: "url"; url: string })

// Function to add a new note to the array
export const addNote = (noteData: {
  title: string
  content?: string
  tags: string[]
  category: string
  type: "text" | "url" | "media"
  url?: string
  image?: string
}) => {
  const nextId = Math.max(0, ...recentNotes.map((n) => n.id)) + 1

  const base = {
    id: nextId,
    title: noteData.title,
    tags: noteData.tags,
    image: noteData.image ?? "/placeholder.svg",
    date: "Just now",
    category: noteData.category,
    content: noteData.content, // Store content in the note
  } satisfies Omit<Note, "type" | "url">

  let newNote: StrictNote
  switch (noteData.type) {
    case "url":
      if (!noteData.url) throw new Error("URL is required for type 'url'")
      newNote = { ...base, type: "url", url: noteData.url }
      break
    case "media":
      newNote = { ...base, type: "media" }
      break
    case "text":
    default:
      newNote = { ...base, type: "text" }
      break
  }

  recentNotes.unshift(newNote)
  return newNote
}

// Function to find related notes based on tags and categories
export const findRelatedNotes = (noteId: number) => {
  const currentNote = recentNotes.find((note) => note.id === noteId)
  if (!currentNote) return []

  return recentNotes
    .filter(
      (note) =>
        note.id !== noteId &&
        (note.category === currentNote.category || note.tags.some((tag) => currentNote.tags.includes(tag))),
    )
    .map((note) => note.id)
}

// Function to get all unique categories from notes
export const getAllCategories = () => {
  return Array.from(new Set(recentNotes.map((note) => note.category)))
}

// Function to get notes by category
export const getNotesByCategory = (category: string) => {
  return recentNotes.filter((note) => note.category === category)
}
