import { useState, useMemo } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import { Label } from '@/shared/components/ui/label'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts'
import { Search, TrendingUp, Filter } from 'lucide-react'
import { analyzeKeywords, extractKeywords, type KeywordFrequency, type DocumentKeyword } from '../services/keywordAnalysisService'
import { toast } from 'sonner'

interface KeywordAnalyzerProps {
  onKeywordSelect?: (keywords: string[]) => void
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658', '#ff7300']

export function KeywordAnalyzer({ onKeywordSelect }: KeywordAnalyzerProps) {
  const [documents, setDocuments] = useState<string[]>([''])
  const [analysisResult, setAnalysisResult] = useState<{
    keywords: KeywordFrequency[]
    topKeywords: KeywordFrequency[]
    domainKeywords: KeywordFrequency[]
    totalDocuments: number
  } | null>(null)
  const [filterMinFrequency, setFilterMinFrequency] = useState(2)
  const [filterMinDocumentCount, setFilterMinDocumentCount] = useState(1)
  const [selectedDomain, setSelectedDomain] = useState('default')

  // 문서 입력 핸들러
  const handleDocumentChange = (index: number, value: string) => {
    const newDocuments = [...documents]
    newDocuments[index] = value
    setDocuments(newDocuments)
  }

  const addDocument = () => {
    setDocuments([...documents, ''])
  }

  const removeDocument = (index: number) => {
    if (documents.length > 1) {
      setDocuments(documents.filter((_, i) => i !== index))
    }
  }

  // 키워드 분석 실행
  const handleAnalyze = () => {
    try {
      const documentKeywords: DocumentKeyword[] = documents
        .filter((doc) => doc.trim().length > 0)
        .map((doc, index) => {
          const keywords = extractKeywords(doc)
          const keywordCounts: Record<string, number> = {}
          
          // 키워드 빈도 계산
          keywords.forEach((keyword) => {
            keywordCounts[keyword] = (keywordCounts[keyword] || 0) + 1
          })

          return {
            documentId: `doc-${index}`,
            keywords,
            keywordCounts,
          }
        })

      if (documentKeywords.length === 0) {
        toast.error('분석할 문서를 입력해주세요.')
        return
      }

      const result = analyzeKeywords(documentKeywords, {
        topN: 20,
        minFrequency: filterMinFrequency,
        minDocumentCount: filterMinDocumentCount,
        domain: selectedDomain,
      })

      setAnalysisResult(result)
      toast.success(`${result.totalDocuments}개 문서에서 ${result.keywords.length}개의 키워드를 발견했습니다.`)
    } catch (error) {
      console.error('Error analyzing keywords:', error)
      toast.error('키워드 분석 중 오류가 발생했습니다.')
    }
  }

  // 차트 데이터 준비
  const chartData = useMemo(() => {
    if (!analysisResult) return []

    return analysisResult.topKeywords.slice(0, 10).map((kw) => ({
      keyword: kw.keyword.length > 15 ? kw.keyword.substring(0, 15) + '...' : kw.keyword,
      frequency: kw.frequency,
      documentCount: kw.documentCount,
      fullKeyword: kw.keyword,
    }))
  }, [analysisResult])

  const pieData = useMemo(() => {
    if (!analysisResult) return []

    return analysisResult.topKeywords.slice(0, 8).map((kw) => ({
      name: kw.keyword.length > 10 ? kw.keyword.substring(0, 10) + '...' : kw.keyword,
      value: kw.frequency,
      fullName: kw.keyword,
    }))
  }, [analysisResult])

  // 키워드 선택
  const handleSelectKeywords = (keywords: string[]) => {
    onKeywordSelect?.(keywords)
    toast.success(`${keywords.length}개의 키워드가 선택되었습니다.`)
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold tracking-tight">키워드 분석기</h2>
        <p className="text-muted-foreground mt-2">
          문서를 입력하면 키워드 빈도와 검색량을 분석하여 시각화합니다.
        </p>
      </div>

      {/* 문서 입력 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Search className="h-5 w-5" />
            문서 입력
          </CardTitle>
          <CardDescription>
            분석할 문서를 입력하세요. 여러 문서를 입력하면 전체 키워드 빈도가 집계됩니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {documents.map((doc, index) => (
            <div key={index} className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>문서 {index + 1}</Label>
                {documents.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeDocument(index)}
                  >
                    제거
                  </Button>
                )}
              </div>
              <Textarea
                placeholder="분석할 문서 내용을 입력하세요..."
                value={doc}
                onChange={(e) => handleDocumentChange(index, e.target.value)}
                className="min-h-[150px]"
              />
            </div>
          ))}
          <Button type="button" variant="outline" onClick={addDocument} className="w-full">
            문서 추가
          </Button>
        </CardContent>
      </Card>

      {/* 필터 설정 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Filter className="h-5 w-5" />
            분석 필터
          </CardTitle>
        </CardHeader>
        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="space-y-2">
            <Label>최소 빈도</Label>
            <Input
              type="number"
              min="1"
              value={filterMinFrequency}
              onChange={(e) => setFilterMinFrequency(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>최소 문서 수</Label>
            <Input
              type="number"
              min="1"
              value={filterMinDocumentCount}
              onChange={(e) => setFilterMinDocumentCount(Number(e.target.value))}
            />
          </div>
          <div className="space-y-2">
            <Label>도메인</Label>
            <select
              value={selectedDomain}
              onChange={(e) => setSelectedDomain(e.target.value)}
              className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors"
            >
              <option value="default">기본</option>
              <option value="ai">AI</option>
              <option value="tech">기술</option>
            </select>
          </div>
        </CardContent>
      </Card>

      {/* 분석 실행 버튼 */}
      <div className="flex justify-end">
        <Button onClick={handleAnalyze} className="gap-2" size="lg">
          <TrendingUp className="h-4 w-4" />
          키워드 분석 실행
        </Button>
      </div>

      {/* 분석 결과 */}
      {analysisResult && (
        <div className="space-y-6">
          {/* 통계 카드 */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>총 문서 수</CardDescription>
                <CardTitle className="text-3xl">{analysisResult.totalDocuments}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>발견된 키워드</CardDescription>
                <CardTitle className="text-3xl">{analysisResult.keywords.length}</CardTitle>
              </CardHeader>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardDescription>도메인 키워드</CardDescription>
                <CardTitle className="text-3xl">{analysisResult.domainKeywords.length}</CardTitle>
              </CardHeader>
            </Card>
          </div>

          {/* 차트 */}
          <Card>
            <CardHeader>
              <CardTitle>키워드 빈도 분석</CardTitle>
              <CardDescription>상위 10개 키워드의 빈도와 문서 출현 횟수</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={400}>
                <BarChart data={chartData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="keyword" angle={-45} textAnchor="end" height={100} />
                  <YAxis />
                  <Tooltip
                    formatter={(value: number) => [value, '값']}
                    labelFormatter={(label) => label}
                  />
                  <Legend />
                  <Bar dataKey="frequency" fill="#0088FE" name="빈도" />
                  <Bar dataKey="documentCount" fill="#00C49F" name="문서 수" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 파이 차트 */}
          <Card>
            <CardHeader>
              <CardTitle>키워드 분포</CardTitle>
              <CardDescription>상위 8개 키워드의 비율</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) => `${name} ${((percent || 0) * 100).toFixed(0)}%`}
                    outerRadius={100}
                    fill="#8884d8"
                    dataKey="value"
                  >
                    {pieData.map((_, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip
                    formatter={(value: number) => [value, '빈도']}
                    labelFormatter={(label) => label}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          {/* 키워드 목록 */}
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle>키워드 목록</CardTitle>
                  <CardDescription>전체 키워드 목록 (빈도순 정렬)</CardDescription>
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectKeywords(analysisResult.topKeywords.slice(0, 5).map((k) => k.keyword))}
                  >
                    상위 5개 선택
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleSelectKeywords(analysisResult.topKeywords.slice(0, 10).map((k) => k.keyword))}
                  >
                    상위 10개 선택
                  </Button>
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2 max-h-[400px] overflow-y-auto">
                {analysisResult.keywords.map((kw, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-3 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <div className="font-medium">{kw.keyword}</div>
                      <div className="text-sm text-muted-foreground">
                        빈도: {kw.frequency}회 | 문서 수: {kw.documentCount}개
                      </div>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleSelectKeywords([kw.keyword])}
                    >
                      선택
                    </Button>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

