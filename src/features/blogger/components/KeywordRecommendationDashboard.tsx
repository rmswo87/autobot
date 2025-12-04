import { useState, useEffect } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { 
  Search, 
  TrendingUp, 
  Star, 
  CheckCircle2, 
  RefreshCw,
  Sparkles
} from 'lucide-react'
import { 
  generateKeywordRecommendations,
  getUserRecommendedKeywords,
  markKeywordAsUsed,
  type RecommendedKeyword,
  type KeywordRecommendationOptions
} from '../services/keywordRecommendationService'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { toast } from 'sonner'
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts'

interface KeywordRecommendationDashboardProps {
  onKeywordSelect?: (keyword: string) => void
}


export function KeywordRecommendationDashboard({ 
  onKeywordSelect 
}: KeywordRecommendationDashboardProps) {
  const { user } = useAuth()
  const [searchQuery, setSearchQuery] = useState('')
  const [isSearching, setIsSearching] = useState(false)
  const [recommendations, setRecommendations] = useState<RecommendedKeyword[]>([])
  const [savedRecommendations, setSavedRecommendations] = useState<RecommendedKeyword[]>([])
  const [selectedDomain, setSelectedDomain] = useState('default')
  const [minScore, setMinScore] = useState(50)
  const [prioritizeLongtail, setPrioritizeLongtail] = useState(true)

  // 저장된 추천 키워드 로드
  useEffect(() => {
    if (user?.id) {
      loadSavedRecommendations()
    }
  }, [user?.id])

  const loadSavedRecommendations = async () => {
    if (!user?.id) return

    try {
      const saved = await getUserRecommendedKeywords(user.id, {
        used: false,
        limit: 50,
      })
      setSavedRecommendations(saved)
    } catch (error) {
      console.error('Error loading saved recommendations:', error)
      toast.error('저장된 추천 키워드를 불러오는데 실패했습니다.')
    }
  }

  const handleSearch = async () => {
    if (!searchQuery.trim()) {
      toast.error('검색어를 입력해주세요.')
      return
    }

    if (!user?.id) {
      toast.error('로그인이 필요합니다.')
      return
    }

    setIsSearching(true)

    try {
      const options: KeywordRecommendationOptions = {
        domain: selectedDomain,
        minScore,
        maxResults: 20,
        prioritizeLongtail,
      }

      const results = await generateKeywordRecommendations(searchQuery, options)
      setRecommendations(results)

      if (results.length === 0) {
        toast.info('추천할 키워드를 찾지 못했습니다. 다른 검색어를 시도해보세요.')
      } else {
        toast.success(`${results.length}개의 추천 키워드를 찾았습니다.`)
      }
    } catch (error) {
      console.error('Error generating recommendations:', error)
      toast.error('키워드 추천 생성 중 오류가 발생했습니다.')
    } finally {
      setIsSearching(false)
    }
  }

  const handleUseKeyword = async (keyword: RecommendedKeyword) => {
    if (!user?.id || !keyword.id) return

    try {
      await markKeywordAsUsed(user.id, keyword.id)
      
      // 로컬 상태 업데이트
      setSavedRecommendations((prev) =>
        prev.map((rec) =>
          rec.id === keyword.id ? { ...rec, used: true, usedAt: new Date() } : rec
        )
      )

      // 콜백 호출
      if (onKeywordSelect) {
        onKeywordSelect(keyword.keyword)
      }

      toast.success(`"${keyword.keyword}" 키워드를 사용했습니다.`)
    } catch (error) {
      console.error('Error marking keyword as used:', error)
      toast.error('키워드 사용 표시 중 오류가 발생했습니다.')
    }
  }

  // 차트 데이터 준비
  const chartData = recommendations.slice(0, 10).map((rec) => ({
    keyword: rec.keyword.length > 20 ? rec.keyword.substring(0, 20) + '...' : rec.keyword,
    fullKeyword: rec.keyword,
    score: rec.finalScore,
    searchVolume: rec.searchVolumeScore,
    competition: rec.competitionScore,
    blogFit: rec.blogFitScore,
    recommendation: rec.recommendation,
  }))

  const displayRecommendations = recommendations.length > 0 ? recommendations : savedRecommendations

  return (
    <div className="space-y-6">
      {/* 검색 섹션 */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Sparkles className="h-5 w-5" />
            키워드 추천 시스템
          </CardTitle>
          <CardDescription>
            검색어를 입력하면 최적의 키워드를 자동으로 추천합니다.
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="search-query">검색어</Label>
              <div className="flex gap-2">
                <Input
                  id="search-query"
                  placeholder="예: React, TypeScript, 블로그 자동화"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
                />
                <Button onClick={handleSearch} disabled={isSearching}>
                  {isSearching ? (
                    <RefreshCw className="h-4 w-4 animate-spin" />
                  ) : (
                    <Search className="h-4 w-4" />
                  )}
                </Button>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="domain">도메인</Label>
              <select
                id="domain"
                className="w-full px-3 py-2 border rounded-md"
                value={selectedDomain}
                onChange={(e) => setSelectedDomain(e.target.value)}
              >
                <option value="default">기본</option>
                <option value="ai">AI</option>
                <option value="tech">기술</option>
              </select>
            </div>
          </div>

          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="prioritize-longtail"
                checked={prioritizeLongtail}
                onChange={(e) => setPrioritizeLongtail(e.target.checked)}
                className="rounded"
              />
              <Label htmlFor="prioritize-longtail" className="cursor-pointer">
                롱테일 키워드 우선
              </Label>
            </div>

            <div className="flex items-center gap-2">
              <Label htmlFor="min-score">최소 점수:</Label>
              <Input
                id="min-score"
                type="number"
                min="0"
                max="100"
                value={minScore}
                onChange={(e) => setMinScore(Number(e.target.value))}
                className="w-20"
              />
            </div>
          </div>
        </CardContent>
      </Card>

      {/* 추천 키워드 목록 */}
      {displayRecommendations.length > 0 && (
        <>
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <TrendingUp className="h-5 w-5" />
                추천 키워드 ({displayRecommendations.length}개)
              </CardTitle>
              <CardDescription>
                점수가 높을수록 추천하는 키워드입니다.
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {displayRecommendations.map((rec) => (
                  <Card key={rec.keyword} className="p-4">
                    <div className="flex items-start justify-between">
                      <div className="flex-1">
                        <div className="flex items-center gap-2 mb-2">
                          <h3 className="font-semibold text-lg">{rec.keyword}</h3>
                          <span
                            className={`px-2 py-1 rounded text-xs font-medium ${
                              rec.recommendation === 'high'
                                ? 'bg-green-100 text-green-800'
                                : rec.recommendation === 'medium'
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-red-100 text-red-800'
                            }`}
                          >
                            {rec.recommendation === 'high' ? '높음' : rec.recommendation === 'medium' ? '중간' : '낮음'}
                          </span>
                          {rec.metrics.keywordType && (
                            <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
                              {rec.metrics.keywordType === 'longtail' ? '롱테일' : 
                               rec.metrics.keywordType === 'large' ? '대형' :
                               rec.metrics.keywordType === 'medium' ? '중형' : '소형'}
                            </span>
                          )}
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-3">
                          <div>
                            <div className="text-sm text-gray-500">최종 점수</div>
                            <div className="text-xl font-bold">{rec.finalScore.toFixed(1)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">검색량 점수</div>
                            <div className="text-lg">{rec.searchVolumeScore.toFixed(1)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">경쟁 점수</div>
                            <div className="text-lg">{rec.competitionScore.toFixed(1)}</div>
                          </div>
                          <div>
                            <div className="text-sm text-gray-500">적합도 점수</div>
                            <div className="text-lg">{rec.blogFitScore.toFixed(1)}</div>
                          </div>
                        </div>

                        {rec.metrics.searchVolume && (
                          <div className="text-sm text-gray-600">
                            월 검색량: {rec.metrics.searchVolume.toLocaleString()}
                          </div>
                        )}
                      </div>

                      <div className="ml-4">
                        {rec.used ? (
                          <div className="flex items-center gap-2 text-green-600">
                            <CheckCircle2 className="h-5 w-5" />
                            <span className="text-sm">사용됨</span>
                          </div>
                        ) : (
                          <Button
                            size="sm"
                            onClick={() => handleUseKeyword(rec)}
                            disabled={!rec.id}
                          >
                            <Star className="h-4 w-4 mr-1" />
                            사용하기
                          </Button>
                        )}
                      </div>
                    </div>
                  </Card>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* 차트 */}
          {chartData.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle>키워드 점수 비교</CardTitle>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={chartData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="keyword" 
                      angle={-45}
                      textAnchor="end"
                      height={100}
                    />
                    <YAxis />
                    <Tooltip />
                    <Legend />
                    <Bar dataKey="score" fill="#8884d8" name="최종 점수" />
                    <Bar dataKey="searchVolume" fill="#82ca9d" name="검색량 점수" />
                    <Bar dataKey="competition" fill="#ffc658" name="경쟁 점수" />
                    <Bar dataKey="blogFit" fill="#ff7300" name="적합도 점수" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          )}
        </>
      )}

      {/* 빈 상태 */}
      {displayRecommendations.length === 0 && !isSearching && (
        <Card>
          <CardContent className="py-12 text-center">
            <Search className="h-12 w-12 mx-auto text-gray-400 mb-4" />
            <p className="text-gray-500">
              검색어를 입력하고 추천 키워드를 찾아보세요.
            </p>
          </CardContent>
        </Card>
      )}
    </div>
  )
}

