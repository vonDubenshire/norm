import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card.jsx'
import { Button } from '@/components/ui/button.jsx'
import { Badge } from '@/components/ui/badge.jsx'
import { FileText, Play, User } from 'lucide-react'
import transcriptsData from '../assets/transcripts.json'

const TranscriptsSection = () => {
  const [selectedTranscript, setSelectedTranscript] = useState(null)

  const handleTranscriptSelect = (transcript) => {
    setSelectedTranscript(transcript)
  }

  const handleBackToList = () => {
    setSelectedTranscript(null)
  }

  if (selectedTranscript) {
    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-3xl font-bold text-white mb-2">{selectedTranscript.title}</h2>
            <Badge variant="secondary" className="bg-blue-600">
              {selectedTranscript.type}
            </Badge>
          </div>
          <Button onClick={handleBackToList} variant="outline" className="text-white border-slate-600">
            ← Back to Transcripts
          </Button>
        </div>

        <Card className="bg-slate-800/50 border-slate-700">
          <CardContent className="p-8">
            <div className="space-y-6">
              {selectedTranscript.content.map((line, index) => (
                <div key={index} className="flex items-start space-x-4">
                  <div className="flex items-center space-x-2 min-w-0 flex-shrink-0">
                    <User className="w-4 h-4 text-slate-400" />
                    <span className="text-sm font-medium text-slate-300 min-w-0">
                      {line.speaker}:
                    </span>
                  </div>
                  <p className="text-slate-200 leading-relaxed flex-1">
                    {line.text}
                  </p>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-8">
      <div className="text-center">
        <h2 className="text-4xl font-bold text-white mb-4">Transcripts & Conversations</h2>
        <p className="text-slate-300 text-lg">Rare transcripts and memorable conversations</p>
      </div>

      <div className="grid md:grid-cols-2 gap-6">
        {transcriptsData.map((transcript) => (
          <Card 
            key={transcript.id} 
            className="bg-slate-800/50 border-slate-700 hover:bg-slate-800/70 transition-all duration-300 cursor-pointer"
            onClick={() => handleTranscriptSelect(transcript)}
          >
            <CardHeader>
              <CardTitle className="flex items-center text-white">
                <FileText className="w-5 h-5 mr-2 text-green-400" />
                {transcript.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <Badge variant="outline" className="text-slate-300 border-slate-600">
                  {transcript.type}
                </Badge>
                <p className="text-slate-300">
                  {transcript.content.length} exchanges
                </p>
                <div className="flex items-center space-x-2 text-sm text-slate-400">
                  <Play className="w-4 h-4" />
                  <span>Click to read full transcript</span>
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Additional Content Placeholder */}
      <Card className="bg-slate-800/30 border-slate-700">
        <CardHeader>
          <CardTitle className="text-white flex items-center">
            <FileText className="w-5 h-5 mr-2 text-blue-400" />
            More Transcripts Coming Soon
          </CardTitle>
        </CardHeader>
        <CardContent>
          <p className="text-slate-300 mb-4">
            We're continuously working to add more transcripts from Norm's appearances, 
            interviews, and shows. Check back regularly for new content!
          </p>
          <div className="grid md:grid-cols-3 gap-4">
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-600">
              <h4 className="text-white font-medium mb-2">Conan Interviews</h4>
              <p className="text-slate-400 text-sm">Classic late-night appearances</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-600">
              <h4 className="text-white font-medium mb-2">Podcast Episodes</h4>
              <p className="text-slate-400 text-sm">Full episode transcriptions</p>
            </div>
            <div className="bg-slate-900/50 p-4 rounded-lg border border-slate-600">
              <h4 className="text-white font-medium mb-2">Stand-up Sets</h4>
              <p className="text-slate-400 text-sm">Complete routine transcripts</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

export default TranscriptsSection
