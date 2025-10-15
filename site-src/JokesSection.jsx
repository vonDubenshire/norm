import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Input } from '@/components/ui/input.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { Search, Quote, ExternalLink, Calendar, User } from 'lucide-react'
import jokesData from '../assets/jokes-database.json'

const JokesSection = () => {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedGuest, setSelectedGuest] = useState('')
  const [currentPage, setCurrentPage] = useState(1)
  const jokesPerPage = 10

  // Get unique guests for filter
  const guests = useMemo(() => {
    const uniqueGuests = [...new Set(jokesData.map(joke => joke.guest).filter(guest => guest && guest.trim() !== ''))]
    return uniqueGuests.sort()
  }, [])

  // Filter jokes based on search term and selected guest
  const filteredJokes = useMemo(() => {
    return jokesData.filter(joke => {
      const matchesSearch = joke.joke.toLowerCase().includes(searchTerm.toLowerCase())
      const matchesGuest = selectedGuest === '' || joke.guest === selectedGuest
      return matchesSearch && matchesGuest && joke.joke.trim() !== ''
    })
  }, [searchTerm, selectedGuest])

  // Paginate jokes
  const totalPages = Math.ceil(filteredJokes.length / jokesPerPage)
  const startIndex = (currentPage - 1) * jokesPerPage
  const currentJokes = filteredJokes.slice(startIndex, startIndex + jokesPerPage)

  const handlePageChange = (page) => {
    setCurrentPage(page)
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4">The Complete Joke Collection</h2>
        <p className="text-slate-300 text-lg">Over 400 jokes from Norm MacDonald Live and other sources</p>
      </div>

      {/* Search and Filter Controls */}
      <div className="flex flex-col md:flex-row gap-4 bg-slate-800/30 p-6 rounded-xl border border-slate-700">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
          <Input
            placeholder="Search jokes..."
            value={searchTerm}
            onChange={(e) => {
              setSearchTerm(e.target.value)
              setCurrentPage(1)
            }}
            className="pl-10 bg-slate-900/50 border-slate-600 text-white placeholder:text-slate-400"
          />
        </div>
        <div className="md:w-64">
          <select
            value={selectedGuest}
            onChange={(e) => {
              setSelectedGuest(e.target.value)
              setCurrentPage(1)
            }}
            className="w-full p-2 bg-slate-900/50 border border-slate-600 rounded-md text-white"
          >
            <option value="">All Guests</option>
            {guests.map(guest => (
              <option key={guest} value={guest}>{guest}</option>
            ))}
          </select>
        </div>
      </div>

      {/* Results Summary */}
      <div className="flex justify-between items-center">
        <p className="text-slate-300">
          Showing {currentJokes.length} of {filteredJokes.length} jokes
        </p>
        <div className="flex gap-2">
          <Badge variant="outline" className="text-slate-300 border-slate-600">
            Total: {jokesData.filter(j => j.joke.trim() !== '').length}
          </Badge>
          {selectedGuest && (
            <Badge variant="secondary" className="bg-blue-600">
              Guest: {selectedGuest}
            </Badge>
          )}
        </div>
      </div>

      {/* Jokes Grid */}
      <div className="space-y-4">
        {currentJokes.map((joke, index) => (
          <Card key={joke.id || index} className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-start space-x-4">
                <Quote className="w-6 h-6 text-blue-400 mt-1 flex-shrink-0" />
                <div className="flex-1">
                  <p className="text-slate-200 text-lg leading-relaxed mb-4">
                    "{joke.joke}"
                  </p>
                  <div className="flex flex-wrap gap-2 items-center">
                    {joke.episode && (
                      <Badge variant="outline" className="text-slate-300 border-slate-600">
                        <Calendar className="w-3 h-3 mr-1" />
                        {joke.episode}
                      </Badge>
                    )}
                    {joke.guest && (
                      <Badge variant="outline" className="text-slate-300 border-slate-600">
                        <User className="w-3 h-3 mr-1" />
                        {joke.guest}
                      </Badge>
                    )}
                    {joke.time && (
                      <Badge variant="outline" className="text-slate-300 border-slate-600">
                        {joke.time}
                      </Badge>
                    )}
                    {joke.url && (
                      <Button
                        variant="ghost"
                        size="sm"
                        className="text-blue-400 hover:text-blue-300 p-0 h-auto"
                        onClick={() => window.open(`https://youtube.com/watch?v=${joke.url}`, '_blank')}
                      >
                        <ExternalLink className="w-3 h-3 mr-1" />
                        Watch
                      </Button>
                    )}
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex justify-center space-x-2">
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className="text-white border-slate-600 hover:bg-slate-700"
          >
            Previous
          </Button>
          
          {[...Array(Math.min(5, totalPages))].map((_, i) => {
            const pageNum = currentPage <= 3 ? i + 1 : currentPage - 2 + i
            if (pageNum > totalPages) return null
            
            return (
              <Button
                key={pageNum}
                variant={currentPage === pageNum ? "default" : "outline"}
                onClick={() => handlePageChange(pageNum)}
                className={currentPage === pageNum ? "" : "text-white border-slate-600 hover:bg-slate-700"}
              >
                {pageNum}
              </Button>
            )
          })}
          
          <Button
            variant="outline"
            onClick={() => handlePageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className="text-white border-slate-600 hover:bg-slate-700"
          >
            Next
          </Button>
        </div>
      )}

      {filteredJokes.length === 0 && (
        <div className="text-center py-12">
          <Quote className="w-16 h-16 text-slate-600 mx-auto mb-4" />
          <p className="text-slate-400 text-lg">No jokes found matching your search.</p>
          <p className="text-slate-500 text-sm mt-2">Try adjusting your search terms or filters.</p>
        </div>
      )}
    </div>
  )
}

export default JokesSection
