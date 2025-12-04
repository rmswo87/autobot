import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Textarea } from '@/shared/components/ui/textarea'
import { Input } from '@/shared/components/ui/input'
import { Label } from '@/shared/components/ui/label'
import { 
  RefreshCw, 
  FileText, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Copy,
  Download,
  TrendingUp
} from 'lucide-react'
import { 
  reconstructBlogPost,
  type BlogReconstructionRequest,
  type ReconstructedBlog
} from '../services/blogReconstructionService'
import { 
  optimizeSEO,
  type SEOOptimizationRequest,
  type SEOOptimizationResult
} from '../services/seoOptimizationService'
import { getUserRecommendedKeywords, type RecommendedKeyword } from '../services/keywordRecommendationService'
import { useAuth } from '@/features/auth/hooks/useAuth'
import { toast } from 'sonner'

export function BlogReconstructionPage() {
  const { user } = useAuth()
  const [originalContent, setOriginalContent] = useState('')
  const [selectedKeywords, setSelectedKeywords] = useState<RecommendedKeyword[]>([])
  const [targetLength, setTargetLength] = useState(2000)
  const [isReconstructing, setIsReconstructing] = useState(false)
  const [reconstructedBlog, setReconstructedBlog] = useState<ReconstructedBlog | null>(null)
  const [seoResult, setSeoResult] = useState<SEOOptimizationResult | null>(null)
  const [availableKeywords, setAvailableKeywords] = useState<RecommendedKeyword[]>([])

  // 저장된 추천 키워드 로드
  const loadKeywords = async () => {
    if (!user?.id) return

    try {
      const keywords = await getUserRecommendedKeywords(user.id, {
        used: false,
        limit: 20,
      })
      setAvailableKeywords(keywords)
    } catch (error) {
      console.error('Error loading keywords:', error)
    }
  }

  // 블로그 글 재구성 실행
  const handleReconstruct = async () => {
    if (!originalContent.trim()) {
      toast.error('원본 콘텐츠를 입력해주세요.')
      return
    }

    if (selectedKeywords.length === 0) {
      toast.error('최소 1개 이상의 키워드를 선택해주세요.')
      return
    }

    setIsReconstructing(true)

    try {
      const request: BlogReconstructionRequest = {
        originalContent,
        keywords: selectedKeywords,
        targetLength,
        optimizeSEO: true,
        includeImages: true,
      }

      const result = await reconstructBlogPost(request)
      setReconstructedBlog(result)

      // SEO 최적화 실행
      const seoRequest: SEOOptimizationRequest = {
        title: result.title,
        content: result.content,
        keywords: result.keywords,
      }

      const seoOptimized = optimizeSEO(seoRequest)
      setSeoResult(seoOptimized)

      toast.success('블로그 글이 성공적으로 재구성되었습니다.')
    } catch (error) {
      console.error('Error reconstructing blog:', error)
      toast.error('블로그 글 재구성 중 오류가 발생했습니다.')
    } finally {
      setIsReconstructing(false)
    }
  }

  // 키워드 선택/해제
  const toggleKeyword = (keyword: RecommendedKeyword) => {
    const isSelected = selectedKeywords.some((k) => k.keyword === keyword.keyword)
    
    if (isSelected) {
      setSelectedKeywords(selectedKeywords.filter((k) => k.keyword !== keyword.keyword))
    } else {
      setSelectedKeywords([...selectedKeywords, keyword])
    }
  }

  // 콘텐츠 복사
  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text)
    toast.success('클립보드에 복사되었습니다.')
  }

  // 초기화
  const handleReset = () => {
    setOriginalContent('')
    setSelectedKeywords([])
    setReconstructedBlog(null)
    setSeoResult(null)
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold tracking-tight">블로그 글 자동 재구성</h1>
        <p className="text-muted-foreground mt-2">
          키워드를 자연스럽게 포함한 SEO 최적화된 블로그 글을 자동으로 생성합니다.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* 입력 섹션 */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <FileText className="h-5 w-5" />
                원본 콘텐츠
              </CardTitle>
              <CardDescription>
                재구성할 블로그 글의 원본 내용을 입력하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="original-content">콘텐츠</Label>
                <Textarea
                  id="original-content"
                  placeholder="블로그 글의 원본 내용을 입력하세요..."
                  value={originalContent}
                  onChange={(e) => setOriginalContent(e.target.value)}
                  rows={10}
                  className="font-mono text-sm"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="target-length">목표 글자 수</Label>
                <Input
                  id="target-length"
                  type="number"
                  min="500"
                  max="5000"
                  value={targetLength}
                  onChange={(e) => setTargetLength(Number(e.target.value))}
                />
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Sparkles className="h-5 w-5" />
                키워드 선택
              </CardTitle>
              <CardDescription>
                재구성에 사용할 키워드를 선택하세요.
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {availableKeywords.length === 0 ? (
                <div className="text-center py-8 text-muted-foreground">
                  <p>저장된 추천 키워드가 없습니다.</p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={loadKeywords}
                    className="mt-4"
                  >
                    키워드 불러오기
                  </Button>
                </div>
              ) : (
                <div className="space-y-2 max-h-64 overflow-y-auto">
                  {availableKeywords.map((keyword) => {
                    const isSelected = selectedKeywords.some((k) => k.keyword === keyword.keyword)
                    return (
                      <div
                        key={keyword.keyword}
                        className={`p-3 border rounded-lg cursor-pointer transition-colors ${
                          isSelected
                            ? 'border-primary bg-primary/5'
                            : 'border-gray-200 hover:border-gray-300'
                        }`}
                        onClick={() => toggleKeyword(keyword)}
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1">
                            <div className="font-medium">{keyword.keyword}</div>
                            <div className="text-sm text-muted-foreground">
                              점수: {keyword.finalScore.toFixed(1)} | 
                              검색량: {keyword.metrics.searchVolume?.toLocaleString() || 'N/A'}
                            </div>
                          </div>
                          {isSelected && (
                            <CheckCircle2 className="h-5 w-5 text-primary" />
                          )}
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </CardContent>
          </Card>

          <div className="flex gap-2">
            <Button
              onClick={handleReconstruct}
              disabled={isReconstructing || !originalContent.trim() || selectedKeywords.length === 0}
              className="flex-1"
            >
              {isReconstructing ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  재구성 중...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4 mr-2" />
                  블로그 글 재구성
                </>
              )}
            </Button>
            <Button
              variant="outline"
              onClick={handleReset}
              disabled={isReconstructing}
            >
              초기화
            </Button>
          </div>
        </div>

        {/* 결과 섹션 */}
        <div className="space-y-4">
          {reconstructedBlog && (
            <>
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <TrendingUp className="h-5 w-5" />
                    SEO 점수: {reconstructedBlog.seoScore.toFixed(0)}점
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div>
                      <Label>제목</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Input
                          value={reconstructedBlog.title}
                          readOnly
                          className="font-semibold"
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(reconstructedBlog.title)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>

                    <div>
                      <Label>메타 설명</Label>
                      <div className="flex items-center gap-2 mt-1">
                        <Textarea
                          value={reconstructedBlog.metaDescription}
                          readOnly
                          rows={3}
                        />
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(reconstructedBlog.metaDescription)}
                        >
                          <Copy className="h-4 w-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle>재구성된 콘텐츠</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between">
                      <Label>본문</Label>
                      <div className="flex gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => handleCopy(reconstructedBlog.content)}
                        >
                          <Copy className="h-4 w-4 mr-1" />
                          복사
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => {
                            const blob = new Blob([reconstructedBlog.content], { type: 'text/html' })
                            const url = URL.createObjectURL(blob)
                            const a = document.createElement('a')
                            a.href = url
                            a.download = `${reconstructedBlog.title}.html`
                            a.click()
                            URL.revokeObjectURL(url)
                          }}
                        >
                          <Download className="h-4 w-4 mr-1" />
                          다운로드
                        </Button>
                      </div>
                    </div>
                    <div
                      className="border rounded-lg p-4 bg-gray-50 max-h-96 overflow-y-auto prose prose-sm"
                      dangerouslySetInnerHTML={{ __html: reconstructedBlog.content }}
                    />
                  </div>
                </CardContent>
              </Card>

              {seoResult && seoResult.recommendations.length > 0 && (
                <Card>
                  <CardHeader>
                    <CardTitle className="flex items-center gap-2">
                      <AlertCircle className="h-5 w-5" />
                      SEO 개선 권장사항
                    </CardTitle>
                  </CardHeader>
                  <CardContent>
                    <ul className="space-y-2">
                      {seoResult.recommendations.map((rec, index) => (
                        <li key={index} className="flex items-start gap-2">
                          <span className="text-primary">•</span>
                          <span className="text-sm">{rec}</span>
                        </li>
                      ))}
                    </ul>
                  </CardContent>
                </Card>
              )}
            </>
          )}

          {!reconstructedBlog && (
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-gray-400 mb-4" />
                <p className="text-gray-500">
                  원본 콘텐츠와 키워드를 입력한 후 재구성 버튼을 클릭하세요.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  )
}

