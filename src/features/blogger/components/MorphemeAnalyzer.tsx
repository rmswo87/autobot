import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { Label } from '@/shared/components/ui/label'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'
import { FileText, AlertTriangle, CheckCircle2, RefreshCw, Trash2 } from 'lucide-react'
import { toast } from 'sonner'

interface MorphemeFrequency {
  morpheme: string
  frequency: number
  positions: number[] // 문장 내 위치
  isMeaningless: boolean // 의미 없는 형태소 여부
}

// 의미 없는 형태소 패턴 (한국어)
const MEANINGLESS_MORPHEMES = [
  '그런데', '그리고', '하지만', '그러나', '또한', '또', '또는',
  '이것', '저것', '그것', '이런', '저런', '그런',
  '있다', '없다', '되다', '하다', '이다',
  '의', '을', '를', '에', '에서', '로', '으로',
  '가', '이', '와', '과', '도', '만', '까지',
  '그래서', '그럼', '그러면', '그렇다면',
  '이렇게', '저렇게', '그렇게', '어떻게',
  '이제', '지금', '그때', '그때는',
]

export function MorphemeAnalyzer() {
  const [text, setText] = useState('')
  const [morphemes, setMorphemes] = useState<MorphemeFrequency[]>([])
  const [removedMorphemes, setRemovedMorphemes] = useState<string[]>([])

  // 형태소 추출 (간단한 버전 - 실제로는 서버 사이드 형태소 분석기 필요)
  const extractMorphemes = (text: string): MorphemeFrequency[] => {
    // 문장 단위로 분리
    const sentences = text.split(/[.!?。！？\n]+/).filter((s) => s.trim().length > 0)
    
    // 단어 단위로 분리 (향후 형태소 분석기로 대체)
    const morphemeMap = new Map<string, { frequency: number; positions: number[] }>()

    sentences.forEach((sentence, sentenceIndex) => {
      const words = sentence
        .replace(/[^\w\s가-힣]/g, ' ')
        .split(/\s+/)
        .filter((word) => word.length >= 1)

      words.forEach((word, wordIndex) => {
        const position = sentenceIndex * 1000 + wordIndex // 문장 위치 계산
        
        if (!morphemeMap.has(word)) {
          morphemeMap.set(word, { frequency: 0, positions: [] })
        }
        
        const entry = morphemeMap.get(word)!
        entry.frequency += 1
        entry.positions.push(position)
      })
    })

    // MorphemeFrequency 배열로 변환
    return Array.from(morphemeMap.entries()).map(([morpheme, data]) => ({
      morpheme,
      frequency: data.frequency,
      positions: data.positions,
      isMeaningless: MEANINGLESS_MORPHEMES.includes(morpheme),
    })).sort((a, b) => b.frequency - a.frequency)
  }

  // 형태소 분석 실행
  const handleAnalyze = () => {
    if (!text.trim()) {
      toast.error('분석할 텍스트를 입력해주세요.')
      return
    }

    try {
      const extracted = extractMorphemes(text)
      setMorphemes(extracted)
      
      const meaninglessCount = extracted.filter((m) => m.isMeaningless).length
      toast.success(
        `${extracted.length}개의 형태소를 발견했습니다. ` +
        `의미 없는 형태소: ${meaninglessCount}개`
      )
    } catch (error) {
      console.error('Error analyzing morphemes:', error)
      toast.error('형태소 분석 중 오류가 발생했습니다.')
    }
  }

  // 의미 없는 형태소 제거
  const handleRemoveMeaningless = () => {
    const meaningless = morphemes.filter((m) => m.isMeaningless)
    const removed = meaningless.map((m) => m.morpheme)
    
    setRemovedMorphemes([...removedMorphemes, ...removed])
    
    // 텍스트에서 제거
    let cleanedText = text
    removed.forEach((morpheme) => {
      const regex = new RegExp(`\\b${morpheme}\\b`, 'g')
      cleanedText = cleanedText.replace(regex, '')
    })
    
    // 연속된 공백 정리
    cleanedText = cleanedText.replace(/\s+/g, ' ').trim()
    
    setText(cleanedText)
    setMorphemes(morphemes.filter((m) => !m.isMeaningless))
    
    toast.success(`${removed.length}개의 의미 없는 형태소를 제거했습니다.`)
  }

  // 특정 형태소 제거
  const handleRemoveMorpheme = (morpheme: string) => {
    const regex = new RegExp(`\\b${morpheme}\\b`, 'g')
    const cleanedText = text.replace(regex, '').replace(/\s+/g, ' ').trim()
    
    setText(cleanedText)
    setMorphemes(morphemes.filter((m) => m.morpheme !== morpheme))
    setRemovedMorphemes([...removedMorphemes, morpheme])
    
    toast.success(`"${morpheme}" 형태소를 제거했습니다.`)
  }

  // 차트 데이터
  const chartData = useMemo(() => {
    return morphemes
      .filter((m) => !m.isMeaningless)
      .slice(0, 15)
      .map((m) => ({
        morpheme: m.morpheme.length > 10 ? m.morpheme.substring(0, 10) + '...' : m.morpheme,
        frequency: m.frequency,
        fullMorpheme: m.morpheme,
      }))
  }, [morphemes])

  const meaninglessData = useMemo(() => {
    return morphemes
      .filter((m) => m.isMeaningless)
      .slice(0, 10)
      .map((m) => ({
        morpheme: m.morpheme,
        frequency: m.frequency,
      }))
  }, [morphemes])

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">형태소 분석기</h2>
        <p className="text-muted-foreground mt-2">
          텍스트의 형태소를 분석하고 반복 패턴을 감지합니다. 의미 없는 형태소를 자동으로 제거할 수 있습니다.
        </p>
      </div>

      {/* 텍스트 입력 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            텍스트 입력
          </CardTitle>
          <CardDescription>
            분석할 텍스트를 입력하세요. 형태소가 추출되고 반복 패턴이 분석됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <Textarea
            placeholder="분석할 텍스트를 입력하세요..."
            value={text}
            onChange={(e) => setText(e.target.value)}
            className="min-h-[200px]"
          />
          <div className="flex justify-end gap-2">
            <Button variant="outline" onClick={() => setText('')}>
              초기화
            </Button>
            <Button onClick={handleAnalyze} className="gap-2">
              <RefreshCw className="h-4 w-4" />
              형태소 분석
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* 분석 결과 */}
      {morphemes.length > 0 && (
        <div className="space-y-6">
          {/* 통계 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>총 형태소</CardDescription>
                <CardTitle className="text-3xl">{morphemes.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>의미 있는 형태소</CardDescription>
                <CardTitle className="text-3xl text-green-600">
                  {morphemes.filter((m) => !m.isMeaningless).length}
                </CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>의미 없는 형태소</CardDescription>
                <CardTitle className="text-3xl text-red-600">
                  {morphemes.filter((m) => m.isMeaningless).length}
                </CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* 의미 없는 형태소 경고 */}
          {meaninglessData.length > 0 && (
            <Card className="border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-yellow-900 dark:text-yellow-100">
                  <AlertTriangle className="h-5 w-5" />
                  의미 없는 형태소 감지
                </CardTitle>
                <CardDescription className="text-yellow-800 dark:text-yellow-200">
                  다음 형태소들이 반복적으로 사용되고 있습니다. 제거를 권장합니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2 mb-4">
                  {meaninglessData.map((m) => (
                    <div
                      key={m.morpheme}
                      className="flex items-center gap-2 px-3 py-1 bg-yellow-100 dark:bg-yellow-900/40 rounded-md"
                    >
                      <span className="text-sm font-medium">{m.morpheme}</span>
                      <span className="text-xs text-muted-foreground">({m.frequency}회)</span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMorpheme(m.morpheme)}
                        className="h-6 w-6 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  ))}
                </div>
                <Button
                  variant="outline"
                  onClick={handleRemoveMeaningless}
                  className="gap-2"
                >
                  <Trash2 className="h-4 w-4" />
                  모든 의미 없는 형태소 제거
                </Button>
              </CardContent>
            </Card>
          )}

          {/* 형태소 빈도 차트 */}
          <Card>
            <CardHeader>
              <CardTitle>형태소 빈도 분석</CardTitle>
              <CardDescription>의미 있는 형태소의 빈도 (상위 15개)</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis
                    dataKey="morpheme"
                    angle={-45}
                    textAnchor="end"
                    height={100}
                  />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [value, '빈도']}
                    labelFormatter={(label, payload) => payload?.[0]?.payload?.fullMorpheme || label}
                  />
                  <Legend />
                  <Bar dataKey="frequency" fill="#0088FE" name="빈도" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 형태소 목록 */}
          <Card>
            <CardHeader>
              <CardTitle>형태소 목록</CardTitle>
              <CardDescription>전체 형태소 목록 (빈도순 정렬)</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {morphemes.map((m, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 border rounded-lg transition-colors ${
                      m.isMeaningless
                        ? 'bg-red-50 dark:bg-red-900/20 border-red-200'
                        : 'hover:bg-accent'
                    }`}
                  >
                    <div className="flex-1">
                      <div className="flex items-center gap-2">
                        <span className="font-medium">{m.morpheme}</span>
                        {m.isMeaningless && (
                          <span className="text-xs px-2 py-0.5 bg-red-100 dark:bg-red-900/40 text-red-700 dark:text-red-300 rounded">
                            의미 없음
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        빈도: {m.frequency}회 | 위치: {m.positions.length}곳
                      </div>
                    </div>
                    {m.isMeaningless && (
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleRemoveMorpheme(m.morpheme)}
                        className="gap-2"
                      >
                        <Trash2 className="h-4 w-4" />
                        제거
                      </Button>
                    )}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 제거된 형태소 목록 */}
          {removedMorphemes.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CheckCircle2 className="h-5 w-5 text-green-600" />
                  제거된 형태소
                </CardTitle>
                <CardDescription>
                  {removedMorphemes.length}개의 형태소가 제거되었습니다.
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="flex flex-wrap gap-2">
                  {removedMorphemes.map((m, index) => (
                    <span
                      key={index}
                      className="px-2 py-1 bg-green-100 dark:bg-green-900/40 text-green-700 dark:text-green-300 rounded text-sm"
                    >
                      {m}
                    </span>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      )}
    </div>
  )
}

