"use client"

import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  ChevronLeft,
  ChevronRight,
  Brain,
  Smartphone,
  Laptop,
  Tablet,
  Globe,
  Zap,
  Users,
  TrendingUp,
  Target,
  BookOpen,
  Palette,
  Mic,
  Search,
  Tag,
  Camera,
  Rocket,
  CheckCircle,
  Share2,
  QrCode,
  Lock,
  Instagram,
} from "lucide-react"

const slides = [
  {
    id: 1,
    type: "cover",
    title: "Bangle",
    subtitle: "Revolutionizing Note-Taking with AI",
    description: "The cross-platform, AI-powered note-taking solution that works seamlessly across all your devices",
  },
  {
    id: 2,
    type: "problem",
    title: "The Cross-Platform Problem",
    subtitle: "Note-taking is broken across devices",
    points: [
      "iOS Notes doesn't work on Android or Windows",
      "Samsung Notes is limited to Samsung devices",
      "Google Keep lacks advanced features",
      "Switching devices means losing your workflow",
      "No unified experience across platforms",
    ],
  },
  {
    id: 3,
    type: "solution",
    title: "Our Solution: One Web App, All Devices",
    subtitle: "Bangle works everywhere, powered by AI",
    features: [
      { icon: Globe, title: "Universal Access", desc: "Works on any device with a browser" },
      { icon: Brain, title: "AI-Powered", desc: "Smart organization and insights" },
      { icon: Zap, title: "Lightning Fast", desc: "Optimized for speed and performance" },
      { icon: Users, title: "Collaborative", desc: "Share and collaborate seamlessly" },
    ],
  },
  {
    id: 4,
    type: "features",
    title: "AI Features That Set Us Apart",
    subtitle: "More than just note-taking",
    features: [
      {
        icon: Brain,
        title: "Smart Collections",
        desc: "AI automatically groups related notes into meaningful collections",
      },
      { icon: Search, title: "Semantic Search", desc: "Find notes by meaning, not just keywords" },
      { icon: Tag, title: "Auto-Tagging", desc: "AI generates relevant tags from your content" },
      { icon: Camera, title: "Smart Screenshots", desc: "Automatic webpage screenshots and metadata extraction" },
      { icon: Target, title: "Pattern Recognition", desc: "Discovers connections and insights across your notes" },
      { icon: Mic, title: "Voice Messages", desc: "Record and share voice notes with collections" },
    ],
  },
  {
    id: 5,
    type: "market",
    title: "Market Opportunity",
    subtitle: "The note-taking market is massive and growing",
    stats: [
      { value: "$2.3B", label: "Global Note-Taking Apps Market", growth: "+12.5% CAGR" },
      { value: "500M+", label: "Active Note-Taking App Users", growth: "Growing rapidly" },
      { value: "73%", label: "Users frustrated with cross-platform sync", growth: "Our opportunity" },
    ],
  },
  {
    id: 6,
    type: "demo",
    title: "See Bangle in Action",
    subtitle: "Experience the future of note-taking",
    demoFeatures: [
      {
        id: "smart-collections",
        title: "AI-powered smart collections",
        icon: Brain,
        details: {
          title: "Bangle AI Insights",
          description:
            "Our AI automatically organizes your notes into meaningful collections based on content, context, and patterns.",
          features: [
            { icon: Target, text: "3 project collections detected" },
            { icon: BookOpen, text: "Learning journey: React Development" },
            { icon: Palette, text: "Creative inspiration collection" },
          ],
        },
      },
      {
        id: "sync",
        title: "Cross-device synchronization",
        icon: Globe,
        details: {
          title: "Universal Sync",
          description:
            "Your notes are instantly available across all devices with real-time synchronization and conflict resolution.",
          features: [
            { icon: Smartphone, text: "Mobile access anywhere" },
            { icon: Laptop, text: "Desktop productivity" },
            { icon: Tablet, text: "Touch-friendly interface" },
          ],
        },
      },
      {
        id: "collaboration",
        title: "Collaborative sharing with voice messages",
        icon: Share2,
        details: {
          title: "Team Collaboration",
          description: "Share collections, leave voice messages, and collaborate seamlessly with your team members.",
          features: [
            { icon: Mic, text: "Voice message annotations" },
            { icon: Users, text: "Real-time collaboration" },
            { icon: Share2, text: "Secure sharing controls" },
          ],
        },
      },
      {
        id: "search",
        title: "Semantic search and auto-tagging",
        icon: Search,
        details: {
          title: "Intelligent Search",
          description:
            "Find notes by meaning, not just keywords. Our AI understands context and generates relevant tags automatically.",
          features: [
            { icon: Search, text: "Semantic search by meaning" },
            { icon: Tag, text: "Auto-generated smart tags" },
            { icon: Camera, text: "Visual content recognition" },
          ],
        },
      },
      {
        id: "interface",
        title: "Beautiful, intuitive interface",
        icon: Palette,
        details: {
          title: "Designed for Productivity",
          description: "Clean, modern interface that adapts to your workflow and preferences across all devices.",
          features: [
            { icon: Palette, text: "Customizable themes" },
            { icon: Zap, text: "Lightning-fast performance" },
            { icon: Target, text: "Distraction-free writing" },
          ],
        },
      },
      {
        id: "login",
        title: "Smart & Fast login",
        icon: Zap,
        details: {
          title: "Seamless Authentication",
          description:
            "No more password hassles. Quick QR code scanning and simple passcode authentication across all your devices.",
          features: [
            { icon: QrCode, text: "QR code cross-device sign-in" },
            { icon: Lock, text: "Simple passcode authentication" },
            { icon: Smartphone, text: "Seamless device switching" },
          ],
        },
      },
    ],
  },
  {
    id: 7,
    type: "business",
    title: "Business Model",
    subtitle: "Sustainable revenue streams",
    model: [
      { tier: "Free", price: "$0", features: ["Basic note-taking", "5 AI insights/month", "1GB storage"] },
      { tier: "Pro", price: "$6.99/mo", features: ["Unlimited AI features", "50GB storage", "Advanced collaboration"] },
      { tier: "Team", price: "$12.99/mo", features: ["Team workspaces", "Admin controls", "Priority support"] },
    ],
  },
  {
    id: 8,
    type: "roadmap",
    title: "Product Roadmap",
    subtitle: "Continuous innovation ahead",
    phases: [
      { phase: "Q1 2024", title: "Launch MVP", status: "completed" },
      { phase: "Q2 2024", title: "AI Enhancements", status: "in-progress" },
      { phase: "Q3 2024", title: "Mobile Apps", status: "planned" },
      { phase: "Q4 2024", title: "Enterprise Features", status: "planned" },
    ],
  },
  {
    id: 9,
    type: "cta",
    title: "Join the Note-Taking Revolution",
    subtitle: "Ready to transform how the world takes notes?",
    action: "Let's build the future together",
  },
]

export default function PitchDeck() {
  const [currentSlide, setCurrentSlide] = useState(0)
  const [selectedDemo, setSelectedDemo] = useState("smart-collections")

  const nextSlide = () => {
    setCurrentSlide((prev) => (prev + 1) % slides.length)
  }

  const prevSlide = () => {
    setCurrentSlide((prev) => (prev - 1 + slides.length) % slides.length)
  }

  const goToSlide = (index: number) => {
    setCurrentSlide(index)
  }

  const slide = slides[currentSlide]

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-card to-muted">
      {/* Navigation */}
      <div className="fixed top-4 left-4 right-4 z-50 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
            <span className="text-primary-foreground font-bold text-sm">B</span>
          </div>
          <span className="font-semibold text-foreground">Bangle Pitch</span>
        </div>

        <div className="flex items-center gap-2 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2">
          {slides.map((_, index) => (
            <button
              key={index}
              onClick={() => goToSlide(index)}
              className={`w-2 h-2 rounded-full transition-colors ${
                index === currentSlide ? "bg-primary" : "bg-muted-foreground/30"
              }`}
            />
          ))}
        </div>

        <div className="flex items-center gap-2">
          <div className="flex items-center gap-1">
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className={`text-sm font-medium transition-all duration-200 ${
                currentSlide > 0
                  ? "text-blue-500 hover:text-blue-600 hover:scale-105 cursor-pointer"
                  : "text-muted-foreground cursor-not-allowed"
              }`}
            >
              Previous
            </button>
            <button
              onClick={prevSlide}
              disabled={currentSlide === 0}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                currentSlide > 0
                  ? "bg-white/80 backdrop-blur-sm hover:bg-white"
                  : "bg-white/40 backdrop-blur-sm cursor-not-allowed"
              }`}
            >
              <ChevronLeft className={`w-4 h-4 ${currentSlide > 0 ? "text-blue-500" : "text-muted-foreground"}`} />
            </button>
          </div>

          <div className="flex items-center gap-1">
            <button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                currentSlide < slides.length - 1
                  ? "bg-white/80 backdrop-blur-sm hover:bg-white"
                  : "bg-white/40 backdrop-blur-sm cursor-not-allowed"
              }`}
            >
              <ChevronRight
                className={`w-4 h-4 ${currentSlide < slides.length - 1 ? "text-blue-500" : "text-muted-foreground"}`}
              />
            </button>
            <button
              onClick={nextSlide}
              disabled={currentSlide === slides.length - 1}
              className={`text-sm font-medium transition-all duration-200 ${
                currentSlide < slides.length - 1
                  ? "text-blue-500 hover:text-blue-600 hover:scale-105 cursor-pointer"
                  : "text-muted-foreground cursor-not-allowed"
              }`}
            >
              Next
            </button>
          </div>
        </div>
      </div>

      {/* Slide Content */}
      <div className="pt-16 pb-8 px-8">
        <AnimatePresence mode="wait">
          <motion.div
            key={currentSlide}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -20 }}
            transition={{ duration: 0.5 }}
            className="max-w-6xl mx-auto"
          >
            {slide.type === "cover" && (
              <div className="text-center py-16">
                <motion.div
                  initial={{ scale: 0.8 }}
                  animate={{ scale: 1 }}
                  transition={{ delay: 0.2 }}
                  className="mb-8"
                >
                  <div className="w-24 h-24 bg-gradient-to-br from-primary to-secondary rounded-2xl mx-auto mb-6 flex items-center justify-center">
                    <Brain className="w-12 h-12 text-white" />
                  </div>
                  <h1 className="text-6xl font-bold text-foreground mb-4">{slide.title}</h1>
                  <h2 className="text-2xl text-muted-foreground mb-6">{slide.subtitle}</h2>
                  <p className="text-lg text-muted-foreground max-w-2xl mx-auto">{slide.description}</p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  transition={{ delay: 0.6 }}
                  className="flex items-center justify-center gap-8 mt-12"
                >
                  <Smartphone className="w-8 h-8 text-muted-foreground" />
                  <Tablet className="w-8 h-8 text-muted-foreground" />
                  <Laptop className="w-8 h-8 text-muted-foreground" />
                  <Globe className="w-8 h-8 text-primary" />
                </motion.div>
              </div>
            )}

            {slide.type === "problem" && (
              <div className="py-4">
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold text-foreground mb-4">{slide.title}</h1>
                  <p className="text-xl text-muted-foreground">{slide.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
                  <div className="space-y-6">
                    {slide.points?.map((point, index) => (
                      <motion.div
                        key={index}
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="flex items-start gap-3 p-4 bg-card rounded-lg border border-border"
                      >
                        <div className="w-2 h-2 bg-destructive rounded-full mt-3 flex-shrink-0" />
                        <p className="text-foreground">{point}</p>
                      </motion.div>
                    ))}
                  </div>

                  <div className="relative">
                    <div className="grid grid-cols-2 gap-4">
                      <div className="p-6 bg-card rounded-lg border border-border opacity-50">
                        <Smartphone className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">iOS Notes</p>
                      </div>
                      <div className="p-6 bg-card rounded-lg border border-border opacity-50">
                        <Tablet className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Samsung Notes</p>
                      </div>
                      <div className="p-6 bg-card rounded-lg border border-border opacity-50">
                        <Laptop className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Windows Notes</p>
                      </div>
                      <div className="p-6 bg-card rounded-lg border border-border opacity-50">
                        <Globe className="w-8 h-8 text-muted-foreground mb-2" />
                        <p className="text-sm text-muted-foreground">Google Keep</p>
                      </div>
                    </div>
                    <div className="absolute inset-0 flex items-center justify-center">
                      <div className="bg-destructive/10 border-2 border-destructive border-dashed rounded-lg p-4">
                        <p className="text-destructive font-medium">No Universal Solution</p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {slide.type === "solution" && (
              <div className="py-4">
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold text-foreground mb-4">{slide.title}</h1>
                  <p className="text-xl text-muted-foreground">{slide.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                  {slide.features?.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 bg-card rounded-xl border border-border hover:shadow-lg transition-shadow"
                    >
                      <div className="w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center mb-4">
                        <feature.icon className="w-6 h-6 text-primary" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-12 text-center">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-primary text-primary-foreground rounded-full">
                    <Globe className="w-5 h-5" />
                    <span className="font-medium">Works on Every Device, Every Browser</span>
                  </div>
                </div>
              </div>
            )}

            {slide.type === "features" && (
              <div className="py-4">
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold text-foreground mb-4">{slide.title}</h1>
                  <p className="text-xl text-muted-foreground">{slide.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {slide.features?.map((feature, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, scale: 0.9 }}
                      animate={{ opacity: 1, scale: 1 }}
                      transition={{ delay: index * 0.1 }}
                      className="p-6 bg-gradient-to-br from-card to-muted rounded-xl border border-border hover:shadow-lg transition-all relative group"
                    >
                      <div className="w-12 h-12 bg-gradient-to-br from-primary to-secondary rounded-lg flex items-center justify-center mb-4">
                        <feature.icon className="w-6 h-6 text-white" />
                      </div>
                      <h3 className="font-semibold text-foreground mb-2">{feature.title}</h3>
                      <p className="text-sm text-muted-foreground">{feature.desc}</p>

                      <div className="absolute top-3 right-3 w-4 h-4 bg-muted-foreground/20 rounded-full flex items-center justify-center text-xs text-muted-foreground cursor-default">
                        i
                      </div>

                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                        <div className="bg-gray-900 text-white text-xs rounded-lg p-3 whitespace-nowrap shadow-lg max-w-xs">
                          {index === 0 && (
                            <div>
                              <div className="font-medium mb-1">Smart Collections:</div>
                              <div>• Uses NLP to analyze content themes</div>
                              <div>• Machine learning pattern recognition</div>
                              <div>• Automatic categorization algorithms</div>
                            </div>
                          )}
                          {index === 1 && (
                            <div>
                              <div className="font-medium mb-1">Semantic Search:</div>
                              <div>• Vector embeddings for context</div>
                              <div>• Natural language understanding</div>
                              <div>• Finds related concepts, not just words</div>
                            </div>
                          )}
                          {index === 2 && (
                            <div>
                              <div className="font-medium mb-1">Auto-Tagging:</div>
                              <div>• Content analysis algorithms</div>
                              <div>• Contextual keyword extraction</div>
                              <div>• Smart tag suggestions based on usage</div>
                            </div>
                          )}
                          {index === 3 && (
                            <div>
                              <div className="font-medium mb-1">Smart Screenshots:</div>
                              <div>• Automatic webpage capture</div>
                              <div>• OCR text extraction from images</div>
                              <div>• Metadata parsing and storage</div>
                            </div>
                          )}
                          {index === 4 && (
                            <div>
                              <div className="font-medium mb-1">Pattern Recognition:</div>
                              <div>• Cross-note relationship mapping</div>
                              <div>• Behavioral pattern analysis</div>
                              <div>• Predictive content suggestions</div>
                            </div>
                          )}
                          {index === 5 && (
                            <div>
                              <div className="font-medium mb-1">Voice Messages:</div>
                              <div>• Audio recording with transcription</div>
                              <div>• Voice-to-text conversion</div>
                              <div>• Integrated with collection sharing</div>
                            </div>
                          )}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {slide.type === "market" && (
              <div className="py-4">
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold text-foreground mb-4">{slide.title}</h1>
                  <p className="text-xl text-muted-foreground">{slide.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {slide.stats?.map((stat, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.2 }}
                      className="text-center p-8 bg-card rounded-xl border border-border relative group"
                    >
                      <div className="text-4xl font-bold text-primary mb-2">{stat.value}</div>
                      <div className="text-lg font-medium text-foreground mb-2">{stat.label}</div>
                      <div className="text-sm text-secondary font-medium">{stat.growth}</div>

                      <div className="absolute top-3 right-3 w-4 h-4 bg-muted-foreground/20 rounded-full flex items-center justify-center text-xs text-muted-foreground cursor-default">
                        i
                      </div>

                      <div className="absolute bottom-full left-1/2 transform -translate-x-1/2 mb-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none z-10">
                        <div className="bg-gray-900 text-white text-xs rounded-lg p-3 whitespace-nowrap shadow-lg max-w-xs">
                          {index === 0 && (
                            <div>
                              <div className="font-medium mb-1">Sources:</div>
                              <div>• Grand View Research 2024</div>
                              <div>• Statista Market Analysis</div>
                              <div>• Fortune Business Insights</div>
                            </div>
                          )}
                          {index === 1 && (
                            <div>
                              <div className="font-medium mb-1">Sources:</div>
                              <div>• App Annie Intelligence</div>
                              <div>• Sensor Tower Data</div>
                              <div>• Mobile App Usage Reports</div>
                            </div>
                          )}
                          {index === 2 && (
                            <div>
                              <div className="font-medium mb-1">Sources:</div>
                              <div>• UserVoice Survey 2024</div>
                              <div>• TechCrunch User Research</div>
                              <div>• Cross-platform Study</div>
                            </div>
                          )}
                          <div className="absolute top-full left-1/2 transform -translate-x-1/2 border-4 border-transparent border-t-gray-900"></div>
                        </div>
                      </div>
                    </motion.div>
                  ))}
                </div>

                <div className="mt-12 text-center">
                  <div className="inline-flex items-center gap-2 px-6 py-3 bg-secondary/10 text-secondary rounded-full">
                    <TrendingUp className="w-5 h-5" />
                    <span className="font-medium">Perfect timing for disruption</span>
                  </div>
                </div>
              </div>
            )}

            {slide.type === "demo" && (
              <div className="py-6">
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold text-foreground mb-4">{slide.title}</h1>
                  <p className="text-xl text-muted-foreground">{slide.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
                  {/* Left Column - Clickable Feature List */}
                  <div className="bg-white rounded-xl p-6 shadow-lg border border-border">
                    <div className="space-y-4 max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
                      <h3 className="text-lg font-semibold text-foreground mb-6 sticky top-0 bg-white/95 backdrop-blur-sm py-2 -mt-2">
                        Key Features
                      </h3>
                      {slide.demoFeatures?.map((feature, index) => (
                        <motion.button
                          key={feature.id}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 }}
                          onClick={() => setSelectedDemo(feature.id)}
                          className={`w-full text-left p-4 rounded-lg border transition-all ${
                            selectedDemo === feature.id
                              ? "border-primary bg-primary/5 shadow-md"
                              : "border-border bg-card hover:border-primary/50 hover:bg-primary/2"
                          }`}
                        >
                          <div className="flex items-center gap-3">
                            <div
                              className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                selectedDemo === feature.id ? "bg-primary text-white" : "bg-muted text-muted-foreground"
                              }`}
                            >
                              <feature.icon className="w-5 h-5" />
                            </div>
                            <span
                              className={`font-medium ${
                                selectedDemo === feature.id ? "text-primary" : "text-foreground"
                              }`}
                            >
                              {feature.title}
                            </span>
                          </div>
                        </motion.button>
                      ))}
                    </div>
                  </div>

                  {/* Right Column - Feature Details */}
                  <div className="relative">
                    <AnimatePresence mode="wait">
                      {slide.demoFeatures?.map(
                        (feature) =>
                          selectedDemo === feature.id && (
                            <motion.div
                              key={feature.id}
                              initial={{ opacity: 0, y: 20 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -20 }}
                              transition={{ duration: 0.3 }}
                              className="bg-gradient-to-br from-primary/10 to-secondary/10 rounded-2xl p-8 border border-border"
                            >
                              <div className="bg-white rounded-lg p-6 shadow-lg">
                                <div className="flex items-center gap-3 mb-4">
                                  <div className="w-8 h-8 bg-primary rounded-lg flex items-center justify-center">
                                    <feature.icon className="w-4 h-4 text-white" />
                                  </div>
                                  <span className="font-semibold text-foreground">{feature.details.title}</span>
                                </div>

                                <p className="text-muted-foreground mb-6 leading-relaxed">
                                  {feature.details.description}
                                </p>

                                <div className="space-y-3">
                                  {feature.details.features.map((item, itemIndex) => (
                                    <div key={itemIndex} className="flex items-center gap-3 text-sm">
                                      <div className="w-6 h-6 rounded-full bg-primary/10 flex items-center justify-center">
                                        <item.icon className="w-3 h-3 text-primary" />
                                      </div>
                                      <span className="text-sm text-foreground">{item.text}</span>
                                    </div>
                                  ))}
                                </div>
                              </div>
                            </motion.div>
                          ),
                      )}
                    </AnimatePresence>
                  </div>
                </div>
              </div>
            )}

            {slide.type === "business" && (
              <div className="py-4">
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold text-foreground mb-4">{slide.title}</h1>
                  <p className="text-xl text-muted-foreground">{slide.subtitle}</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                  {slide.model?.map((tier, index) => (
                    <motion.div
                      key={index}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ delay: index * 0.1 }}
                      className={`p-8 rounded-xl border-2 ${
                        index === 1 ? "border-primary bg-primary/5 scale-105" : "border-border bg-card"
                      }`}
                    >
                      <div className="text-center mb-6">
                        <h3 className="text-xl font-bold text-foreground mb-2">{tier.tier}</h3>
                        <div className="text-3xl font-bold text-primary">{tier.price}</div>
                        {tier.price !== "$0" && <div className="text-sm text-muted-foreground">per user</div>}
                      </div>

                      <ul className="space-y-3">
                        {tier.features.map((feature, featureIndex) => (
                          <li key={featureIndex} className="flex items-center gap-2">
                            <CheckCircle className="w-4 h-4 text-primary flex-shrink-0" />
                            <span className="text-sm text-foreground">{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </motion.div>
                  ))}
                </div>
              </div>
            )}

            {slide.type === "roadmap" && (
              <div className="py-4">
                <div className="text-center mb-12">
                  <h1 className="text-4xl font-bold text-foreground mb-4">{slide.title}</h1>
                  <p className="text-xl text-muted-foreground">{slide.subtitle}</p>
                </div>

                <div className="max-w-4xl mx-auto max-h-96 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent hover:scrollbar-thumb-primary/40">
                  <div className="relative">
                    <div className="absolute left-8 top-0 bottom-0 w-0.5 bg-border"></div>

                    <div className="space-y-8">
                      {slide.phases?.map((phase, index) => (
                        <motion.div
                          key={index}
                          initial={{ opacity: 0, x: -20 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.2 }}
                          className="relative flex items-center gap-6"
                        >
                          <div
                            className={`w-4 h-4 rounded-full border-4 ${
                              phase.status === "completed"
                                ? "bg-primary border-primary"
                                : phase.status === "in-progress"
                                  ? "bg-secondary border-secondary"
                                  : "bg-background border-muted-foreground"
                            }`}
                          ></div>

                          <div className="flex-1 p-6 bg-card rounded-lg border border-border">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="font-semibold text-foreground">{phase.title}</h3>
                                <p className="text-sm text-muted-foreground">{phase.phase}</p>
                              </div>
                              <div
                                className={`px-3 py-1 rounded-full text-sm font-medium ${
                                  phase.status === "completed"
                                    ? "bg-primary/10 text-primary"
                                    : phase.status === "in-progress"
                                      ? "bg-secondary/10 text-secondary"
                                      : "bg-muted text-muted-foreground"
                                }`}
                              >
                                {phase.status.replace("-", " ")}
                              </div>
                            </div>
                          </div>
                        </motion.div>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {slide.type === "cta" && (
              <div className="text-center py-16">
                <motion.div initial={{ scale: 0.8 }} animate={{ scale: 1 }} transition={{ delay: 0.2 }}>
                  <h1 className="text-5xl font-bold text-foreground mb-6">{slide.title}</h1>
                  <p className="text-xl text-muted-foreground mb-8">{slide.subtitle}</p>

                  <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
                    {/* <button className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-lg font-medium">
                      <Rocket className="w-5 h-5" />
                      Reach me out today
                    </button> */}

                   <button
                    type="button"
                    className="inline-flex items-center gap-2 px-8 py-4 bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors text-lg font-medium"
                    onClick={() => {
                      const to = "bangle@nikoladimitrov.com";
                      const subject = encodeURIComponent("I am interested in your app");
                      const body = encodeURIComponent("Happy to work with you!");
                      const url = `https://mail.google.com/mail/?view=cm&fs=1&to=${encodeURIComponent(to)}&su=${subject}&body=${body}`;
                      window.open(url, "_blank", "noopener,noreferrer");
                    }}
                  >
                  <Rocket className="w-5 h-5" />Reach me out today
                  </button>

                  </div>
                  <div className="mt-12 text-center">
                    {/* <p className="text-muted-foreground mb-4">Contact us:</p> */}
                    <div className="flex items-center justify-center gap-8 text-md">
                      <span>bangle@nikoladimitrov.com</span>
                    </div>
                  </div>
                   <div className="mt-12 text-center">
                    <div className="flex items-center justify-center gap-8 text-md">
                      <span><Instagram className="w-5 h-5" /></span><span>BangleApp</span>
                    </div>
                  </div>
                </motion.div>
              </div>
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Slide Counter */}
      <div className="fixed bottom-4 right-4 bg-white/80 backdrop-blur-sm rounded-full px-4 py-2 text-sm text-muted-foreground">
        {currentSlide + 1} / {slides.length}
      </div>
    </div>
  )
}
