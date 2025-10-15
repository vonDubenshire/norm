import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button.jsx'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs.jsx'
import { Badge } from '@/components/ui/badge.jsx';
import { Quote, Play, BookOpen, Database, Video, Users, Star, Heart, Menu, X, Search, ExternalLink } from 'lucide-react';
import VideosSection from './components/VideosSection';
import JokesSection from './components/JokesSection';
import TranscriptsSection from './components/TranscriptsSection.jsx'
import './App.css'

// Import Norm Macdonald images
import normImage1 from './assets/oSLU7IZ6POJs.jpg'
import normImage2 from './assets/mGIe0lF72tnv.jpg'
import normImage3 from './assets/keRbGp7TmpDU.jpg'
import normImage4 from './assets/zb92C5PI7CXF.jpg'
import normImage5 from './assets/UerEdm0FlUzC.jpg'
import normImage6 from './assets/Fy6xGYZQ8BQ8.jpg'
import normImage7 from './assets/Xecv5ndyoR96.jpg'
import normImage8 from './assets/fqzIs1HTwT9L.jpg'

function App() {
  const [activeSection, setActiveSection] = useState('home')
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [randomJoke, setRandomJoke] = useState('')

  const featuredJokes = [
    "We all know that the Swiss are officially neutral. Unofficially, however, they're filthy sons of bitches.",
    "Remember the old days when 'tweeting' meant stabbing a hooker?",
    "I think there's nothing cooler than being a lone wolf. Except at wolf-picnics when you don't have a partner for the wolf-wheelbarrow races.",
    "Growing up, I never would have believed that one day I'd need a computer just to masturbate.",
    "Call me crazy, but I take orders from Martians who send secret messages beamed out from the antenna at the top of the Empire State Building.",
    "My girlfriend and I have a deal where we have one celebrity that we can sleep with and it's not considered cheating. Mine is that woman who plays Madea."
  ]

  const archiveStats = [
    { label: "Total Jokes", value: "400+", icon: Quote },
    { label: "Video Clips", value: "900+", icon: Video },
    { label: "Transcripts", value: "25+", icon: BookOpen },
    { label: "Fan Contributions", value: "Growing", icon: Users }
  ]

  // Random joke generator
  useEffect(() => {
    const getRandomJoke = () => {
      const randomIndex = Math.floor(Math.random() * featuredJokes.length)
      setRandomJoke(featuredJokes[randomIndex])
    }
    getRandomJoke()
    const interval = setInterval(getRandomJoke, 10000) // Change every 10 seconds
    return () => clearInterval(interval)
  }, [])

  const handleNavigation = (section) => {
    setActiveSection(section)
    setMobileMenuOpen(false)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
      {/* Header */}
      <header className="bg-black/50 backdrop-blur-sm border-b border-slate-700 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-4">
              <img 
                src={normImage4} 
                alt="Norm Macdonald" 
                className="w-12 h-12 rounded-full object-cover border-2 border-slate-600"
              />
              <div>
                <h1 className="text-2xl font-bold text-white">Norm Macdonald Tribute</h1>
                <p className="text-slate-400 text-sm">The Last Dangerous Comedian</p>
              </div>
            </div>
            
            {/* Desktop Navigation */}
            <nav className="hidden md:flex space-x-6">
              <Button 
                variant={activeSection === 'home' ? 'default' : 'ghost'} 
                onClick={() => handleNavigation('home')}
                className="text-white"
              >
                Home
              </Button>
              <Button 
                variant={activeSection === 'jokes' ? 'default' : 'ghost'} 
                onClick={() => handleNavigation('jokes')}
                className="text-white"
              >
                Jokes
              </Button>
              <Button 
                variant={activeSection === 'videos' ? 'default' : 'ghost'} 
                onClick={() => handleNavigation('videos')}
                className="text-white"
              >
                Videos
              </Button>
              <Button 
                variant={activeSection === 'transcripts' ? 'default' : 'ghost'} 
                onClick={() => handleNavigation('transcripts')}
                className="text-white"
              >
                Transcripts
              </Button>
              <Button 
                variant={activeSection === 'database' ? 'default' : 'ghost'} 
                onClick={() => handleNavigation('database')}
                className="text-white"
              >
                Database
              </Button>
            </nav>

            {/* Mobile Menu Button */}
            <Button
              variant="ghost"
              className="md:hidden text-white"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </Button>
          </div>

          {/* Mobile Navigation */}
          {mobileMenuOpen && (
            <nav className="md:hidden mt-4 pb-4 border-t border-slate-700 pt-4">
              <div className="flex flex-col space-y-2">
                {['home', 'jokes', 'videos', 'transcripts', 'database'].map((section) => (
                  <Button
                    key={section}
                    variant={activeSection === section ? 'default' : 'ghost'}
                    onClick={() => handleNavigation(section)}
                    className="text-white justify-start"
                  >
                    {section.charAt(0).toUpperCase() + section.slice(1)}
                  </Button>
                ))}
              </div>
            </nav>
          )}
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-8">
        {activeSection === 'home' && (
          <div className="space-y-12">
            {/* Hero Section */}
            <section className="text-center py-16">
              <div className="max-w-4xl mx-auto">
                <img 
                  src={normImage6} 
                  alt="Norm Macdonald at Weekend Update desk" 
                  className="w-64 h-48 mx-auto rounded-lg shadow-2xl object-cover mb-8 border-4 border-slate-600 hover:border-blue-400 transition-colors duration-300"
                />
                <h2 className="text-5xl font-bold text-white mb-6">
                  Remembering <span className="text-blue-400">Norm Macdonald</span>
                </h2>
                <p className="text-xl text-slate-300 mb-8 leading-relaxed">
                  The fearless comedian who never left an audience the same way he found it. 
                  This tribute celebrates his legendary career, from SNL's Weekend Update to his 
                  unforgettable stand-up performances and everything in between.
                </p>
                <div className="flex justify-center space-x-4 flex-wrap gap-2">
                  <Badge variant="secondary" className="px-4 py-2 text-lg">
                    <Star className="w-4 h-4 mr-2" />
                    SNL Legend
                  </Badge>
                  <Badge variant="secondary" className="px-4 py-2 text-lg">
                    <Heart className="w-4 h-4 mr-2" />
                    1959-2021
                  </Badge>
                  <Badge variant="secondary" className="px-4 py-2 text-lg">
                    <Quote className="w-4 h-4 mr-2" />
                    400+ Jokes
                  </Badge>
                </div>
              </div>
            </section>

            {/* Stats Section */}
            <section className="grid grid-cols-2 md:grid-cols-4 gap-6">
              {archiveStats.map((stat, index) => (
                <Card key={index} className="bg-slate-800/50 border-slate-700 text-center hover:bg-slate-800/70 transition-all duration-300">
                  <CardContent className="p-6">
                    <stat.icon className="w-8 h-8 mx-auto mb-3 text-blue-400" />
                    <p className="text-2xl font-bold text-white mb-1">{stat.value}</p>
                    <p className="text-slate-400 text-sm">{stat.label}</p>
                  </CardContent>
                </Card>
              ))}
            </section>

            {/* Featured Content Grid */}
            <section className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
              <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Quote className="w-5 h-5 mr-2 text-blue-400" />
                    Featured Jokes
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 mb-4">
                    Explore hundreds of Norm's most memorable one-liners and observations from SNL, 
                    his podcast, and stand-up performances.
                  </p>
                  <Button 
                    onClick={() => handleNavigation('jokes')}
                    className="w-full"
                  >
                    Browse Jokes
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Video className="w-5 h-5 mr-2 text-red-400" />
                    Video Collection
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 mb-4">
                    Watch classic clips from Weekend Update, talk show appearances, 
                    and rare footage from throughout his career.
                  </p>
                  <Button 
                    onClick={() => handleNavigation('videos')}
                    className="w-full"
                  >
                    Watch Videos
                  </Button>
                </CardContent>
              </Card>

              <Card className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 hover:scale-105">
                <CardHeader>
                  <CardTitle className="flex items-center text-white">
                    <Database className="w-5 h-5 mr-2 text-green-400" />
                    Archive Database
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-slate-300 mb-4">
                    Access comprehensive databases of transcripts, jokes, and content 
                    meticulously collected by fans over the years.
                  </p>
                  <Button 
                    onClick={() => handleNavigation('database')}
                    className="w-full"
                  >
                    Explore Database
                  </Button>
                </CardContent>
              </Card>
            </section>

            {/* Random Quote Showcase */}
            <section className="bg-slate-800/30 rounded-xl p-8 border border-slate-700">
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Random Norm Wisdom</h3>
              <div className="max-w-3xl mx-auto text-center">
                <div className="bg-slate-900/50 p-8 rounded-lg border border-slate-600">
                  <Quote className="w-8 h-8 text-blue-400 mx-auto mb-4" />
                  <p className="text-slate-200 italic text-xl leading-relaxed mb-4">
                    "{randomJoke}"
                  </p>
                  <p className="text-slate-400">- Norm Macdonald</p>
                </div>
                <p className="text-slate-500 text-sm mt-4">Quote changes every 10 seconds</p>
              </div>
            </section>

            {/* Photo Gallery Preview */}
            <section>
              <h3 className="text-2xl font-bold text-white mb-6 text-center">Through the Years</h3>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                {[normImage1, normImage2, normImage3, normImage7].map((img, index) => (
                  <div key={index} className="relative group">
                    <img 
                      src={img} 
                      alt={`Norm Macdonald ${index + 1}`}
                      className="w-full h-48 object-cover rounded-lg border-2 border-slate-600 group-hover:border-blue-400 transition-all duration-300"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 rounded-lg flex items-center justify-center">
                      <Play className="w-8 h-8 text-white" />
                    </div>
                  </div>
                ))}
              </div>
            </section>
          </div>
        )}

        {activeSection === 'jokes' && <JokesSection />}

        {activeSection === 'transcripts' && <TranscriptsSection />}

        {activeSection === 'videos' && <VideosSection />}

        {activeSection === 'database' && (
          <div className="text-center py-16">
            <h2 className="text-4xl font-bold text-white mb-4">Database Archive</h2>
            <p className="text-slate-300 text-lg">More content coming soon!</p>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-900/50 border-t border-slate-700 py-8 mt-12">
        <div className="container mx-auto text-center text-slate-400 text-sm">
          <p>&copy; 2025 Norm Macdonald Tribute. All rights reserved.</p>
          <p className="mt-2">This is a fan-made website. All content belongs to its respective owners.</p>
          <div className="flex justify-center space-x-4 mt-4">
            <Button variant="ghost" onClick={() => handleNavigation('home')}>Home</Button>
            <Button variant="ghost" onClick={() => handleNavigation('jokes')}>Jokes</Button>
            <Button variant="ghost" onClick={() => handleNavigation('videos')}>Videos</Button>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default App
