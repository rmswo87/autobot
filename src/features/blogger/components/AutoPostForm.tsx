import { useState, useEffect } from 'react'
import { useForm } from 'react-hook-form'
import { zodResolver } from '@hookform/resolvers/zod'
import { z } from 'zod'
import { useCreatePost } from '../hooks'
import { Button } from '@/shared/components/ui/button'
import { Input } from '@/shared/components/ui/input'
import { Textarea } from '@/shared/components/ui/textarea'
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from '@/shared/components/ui/form'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Loader2, X, Sparkles, Clock, Zap } from 'lucide-react'
import { toast } from 'sonner'
import type { BloggerBlog } from '../types'
import { generateContentWithContext7 } from '../services/contentGenerationService'
import { analyzeKeywords, extractKeywords, type DocumentKeyword } from '../services/keywordAnalysisService'
import { saveScheduleConfig, getScheduleConfig, calculateNextPublishTime } from '../services/schedulingService'

const autoPostSchema = z.object({
  // 완전 자동화 모드
  fullAutoMode: z.boolean().default(false),
  publishTime: z.string().optional(), // HH:mm 형식
  
  // 키워드 입력 (자동화 모드일 때는 추천 키워드 사용)
  keywords: z.string().min(1, '키워드를 입력하거나 추천 키워드를 선택해주세요.'),
  domain: z.string().default('default'),
  
  // 수동 입력 (자동화 모드가 아닐 때만)
  title: z.string().optional(),
  content: z.string().optional(),
  
  // 옵션
  includeImage: z.boolean().default(true),
  autoSubmitToSearchConsole: z.boolean().default(false),
})

type AutoPostFormValues = z.infer<typeof autoPostSchema>

interface AutoPostFormProps {
  blog: BloggerBlog
  onSuccess?: () => void
  onCancel?: () => void
}

export function AutoPostForm({ blog, onSuccess, onCancel }: AutoPostFormProps) {
  const createPost = useCreatePost()
  const [isGenerating, setIsGenerating] = useState(false)
  const [recommendedKeywords, setRecommendedKeywords] = useState<string[]>([])
  const [generatedContent, setGeneratedContent] = useState<{ title: string; content: string; labels: string[] } | null>(null)
  const [scheduleConfig, setScheduleConfig] = useState<{ enabled: boolean; publishTime: string } | null>(null)

  const form = useForm<AutoPostFormValues>({
    resolver: zodResolver(autoPostSchema),
    defaultValues: {
      fullAutoMode: false,
      publishTime: '09:00',
      keywords: '',
      domain: 'default',
      includeImage: true,
      autoSubmitToSearchConsole: false,
    },
  })

  const fullAutoMode = form.watch('fullAutoMode')
  const keywords = form.watch('keywords')

  // 기존 스케줄 설정 불러오기
  useEffect(() => {
    const loadScheduleConfig = async () => {
      try {
        const config = await getScheduleConfig(blog.id)
        if (config) {
          setScheduleConfig(config)
          form.setValue('fullAutoMode', config.enabled && config.autoGenerate)
          form.setValue('publishTime', config.publishTime)
          form.setValue('domain', config.domain || 'default')
          if (config.keywords.length > 0) {
            form.setValue('keywords', config.keywords.join(', '))
          }
        }
      } catch (error) {
        console.error('Error loading schedule config:', error)
      }
    }
    loadScheduleConfig()
  }, [blog.id, form])

  // 키워드 추천 (간단한 예시 - 실제로는 문서 수집 및 분석 필요)
  useEffect(() => {
    if (keywords && keywords.length > 0) {
      const extracted = extractKeywords(keywords)
      setRecommendedKeywords(extracted.slice(0, 10))
    }
  }, [keywords])

  // 콘텐츠 자동 생성
  const handleGenerateContent = async () => {
    const formValues = form.getValues()
    if (!formValues.keywords) {
      toast.error('키워드를 입력해주세요.')
      return
    }

    setIsGenerating(true)
    try {
      const keywordList = formValues.keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean)

      const generated = await generateContentWithContext7({
        keywords: keywordList,
        domain: formValues.domain || 'default',
        targetLength: 2000,
        includeImage: formValues.includeImage,
      })

      setGeneratedContent(generated)
      form.setValue('title', generated.title)
      form.setValue('content', generated.content)
      
      toast.success('콘텐츠가 자동 생성되었습니다.')
    } catch (error) {
      console.error('Error generating content:', error)
      toast.error('콘텐츠 생성에 실패했습니다.')
    } finally {
      setIsGenerating(false)
    }
  }

  // 완전 자동화 모드 저장
  const handleSaveAutoMode = async () => {
    const formValues = form.getValues()
    
    if (formValues.fullAutoMode && !formValues.publishTime) {
      toast.error('발행 시간을 설정해주세요.')
      return
    }

    try {
      const keywordList = formValues.keywords
        .split(',')
        .map((k) => k.trim())
        .filter(Boolean)

      await saveScheduleConfig({
        blogId: blog.id,
        enabled: formValues.fullAutoMode,
        publishTime: formValues.publishTime || '09:00',
        keywords: keywordList,
        domain: formValues.domain || 'default',
        autoGenerate: formValues.fullAutoMode,
      })

      const nextPublishTime = calculateNextPublishTime(formValues.publishTime || '09:00')
      toast.success(
        `완전 자동화 모드가 설정되었습니다. 다음 발행 시간: ${nextPublishTime.toLocaleString('ko-KR')}`
      )
    } catch (error) {
      console.error('Error saving auto mode:', error)
      toast.error('자동화 설정 저장에 실패했습니다.')
    }
  }

  // 포스트 생성
  const onSubmit = async (values: AutoPostFormValues) => {
    try {
      // 완전 자동화 모드면 스케줄만 저장하고 종료
      if (values.fullAutoMode) {
        await handleSaveAutoMode()
        onSuccess?.()
        return
      }

      // 수동 모드면 즉시 생성
      if (!values.title || !values.content) {
        toast.error('제목과 내용을 입력하거나 자동 생성 버튼을 클릭해주세요.')
        return
      }

      const labels = generatedContent?.labels || 
        values.keywords.split(',').map((k) => k.trim()).filter(Boolean)

      await createPost.mutateAsync({
        blogId: blog.id,
        title: values.title,
        content: values.content,
        labels,
        publish: true,
      })

      // 서치콘솔 자동 등록 (향후 구현)
      if (values.autoSubmitToSearchConsole) {
        // TODO: 네이버/구글 서치콘솔 등록
        toast.info('서치콘솔 등록 기능은 곧 추가될 예정입니다.')
      }

      toast.success('포스트가 성공적으로 생성되었습니다.')
      form.reset()
      setGeneratedContent(null)
      onSuccess?.()
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '포스트 생성에 실패했습니다.'
      toast.error(errorMessage)
    }
  }

  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="flex items-center justify-between">
          <h2 className="text-xl font-semibold">자동 블로그 포스트 생성</h2>
          {onCancel && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={onCancel}
              className="h-8 w-8"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>

        <div className="text-sm text-muted-foreground">
          블로그: <span className="font-medium">{blog.name}</span>
        </div>

        {/* 완전 자동화 모드 */}
        <Card className="border-primary">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Zap className="h-5 w-5 text-primary" />
              완전 자동화 모드
            </CardTitle>
            <CardDescription>
              체크하면 매일 정해진 시간에 자동으로 포스트가 생성되고 발행됩니다.
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <FormField
              control={form.control}
              name="fullAutoMode"
              render={({ field }) => (
                <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                  <FormControl>
                    <input
                      type="checkbox"
                      checked={field.value}
                      onChange={field.onChange}
                      className="h-4 w-4 rounded border-gray-300"
                    />
                  </FormControl>
                  <div className="space-y-1 leading-none">
                    <FormLabel>완전 자동화 활성화</FormLabel>
                    <FormDescription>
                      활성화하면 키워드와 도메인만 설정하면 매일 자동으로 포스트가 생성되고 발행됩니다.
                    </FormDescription>
                  </div>
                </FormItem>
              )}
            />

            {fullAutoMode && (
              <FormField
                control={form.control}
                name="publishTime"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel className="flex items-center gap-2">
                      <Clock className="h-4 w-4" />
                      발행 시간
                    </FormLabel>
                    <FormControl>
                      <Input
                        type="time"
                        {...field}
                        className="w-32"
                      />
                    </FormControl>
                    <FormDescription>
                      매일 이 시간에 포스트가 자동으로 발행됩니다. (예: 09:00)
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}
          </CardContent>
        </Card>

        {/* 키워드 입력 */}
        <FormField
          control={form.control}
          name="keywords"
          render={({ field }) => (
            <FormItem>
              <FormLabel>핵심 키워드 *</FormLabel>
              <FormControl>
                <Input
                  placeholder="키워드1, 키워드2, 키워드3 (쉼표로 구분)"
                  {...field}
                />
              </FormControl>
              <FormDescription>
                블로그 포스트의 핵심 키워드를 입력하세요. 자동으로 제목과 내용이 생성됩니다.
              </FormDescription>
              {recommendedKeywords.length > 0 && (
                <div className="flex flex-wrap gap-2 mt-2">
                  {recommendedKeywords.map((keyword) => (
                    <Button
                      key={keyword}
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => {
                        const current = field.value ? `${field.value}, ` : ''
                        field.onChange(`${current}${keyword}`)
                      }}
                    >
                      {keyword}
                    </Button>
                  ))}
                </div>
              )}
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 도메인 선택 */}
        <FormField
          control={form.control}
          name="domain"
          render={({ field }) => (
            <FormItem>
              <FormLabel>도메인</FormLabel>
              <FormControl>
                <select
                  {...field}
                  className="flex h-9 w-full rounded-md border border-input bg-transparent px-3 py-1 text-sm shadow-sm transition-colors file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:cursor-not-allowed disabled:opacity-50"
                >
                  <option value="default">기본</option>
                  <option value="ai">AI</option>
                  <option value="tech">기술</option>
                </select>
              </FormControl>
              <FormDescription>
                도메인에 맞는 키워드 패턴이 적용됩니다. (예: AI 도메인 - "~이란?", "~사용법")
              </FormDescription>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 자동 생성 버튼 (완전 자동화 모드가 아닐 때만) */}
        {!fullAutoMode && (
          <div className="flex items-center gap-3">
            <Button
              type="button"
              onClick={handleGenerateContent}
              disabled={isGenerating || !keywords}
              className="gap-2"
            >
              {isGenerating ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                <>
                  <Sparkles className="h-4 w-4" />
                  콘텐츠 자동 생성
                </>
              )}
            </Button>
            <p className="text-sm text-muted-foreground">
              키워드를 입력한 후 버튼을 클릭하면 제목과 내용이 자동으로 생성됩니다.
            </p>
          </div>
        )}

        {/* 생성된 제목 (완전 자동화 모드가 아닐 때만) */}
        {!fullAutoMode && (
          <FormField
            control={form.control}
            name="title"
            render={({ field }) => (
              <FormItem>
                <FormLabel>제목 *</FormLabel>
                <FormControl>
                  <Input placeholder="자동 생성되거나 수동으로 입력하세요" {...field} />
                </FormControl>
                <FormDescription>
                  키워드 기반으로 자동 생성되며, 키워드가 앞쪽에 배치됩니다.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* 생성된 내용 (완전 자동화 모드가 아닐 때만) */}
        {!fullAutoMode && (
          <FormField
            control={form.control}
            name="content"
            render={({ field }) => (
              <FormItem>
                <FormLabel>내용 *</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="자동 생성되거나 수동으로 입력하세요 (HTML 지원)"
                    className="min-h-[300px] font-mono text-sm"
                    {...field}
                  />
                </FormControl>
                <FormDescription>
                  첫 번째 H2 태그에 핵심 키워드가 포함되며, 이미지가 자동으로 삽입됩니다.
                </FormDescription>
                <FormMessage />
              </FormItem>
            )}
          />
        )}

        {/* 옵션 */}
        <div className="space-y-3">
          <FormField
            control={form.control}
            name="includeImage"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>이미지 자동 삽입</FormLabel>
                  <FormDescription>
                    체크하면 콘텐츠에 이미지가 자동으로 삽입됩니다. (네이버 썸네일 노출에 유리)
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="autoSubmitToSearchConsole"
            render={({ field }) => (
              <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                <FormControl>
                  <input
                    type="checkbox"
                    checked={field.value}
                    onChange={field.onChange}
                    className="h-4 w-4 rounded border-gray-300"
                  />
                </FormControl>
                <div className="space-y-1 leading-none">
                  <FormLabel>서치콘솔 자동 등록</FormLabel>
                  <FormDescription>
                    체크하면 발행 후 네이버/구글 서치콘솔에 자동으로 등록됩니다. (향후 구현)
                  </FormDescription>
                </div>
              </FormItem>
            )}
          />
        </div>

        <div className="flex justify-end gap-3">
          {onCancel && (
            <Button type="button" variant="outline" onClick={onCancel}>
              취소
            </Button>
          )}
          {fullAutoMode ? (
            <Button type="button" onClick={handleSaveAutoMode} disabled={createPost.isPending}>
              {createPost.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  저장 중...
                </>
              ) : (
                '자동화 설정 저장'
              )}
            </Button>
          ) : (
            <Button type="submit" disabled={createPost.isPending || isGenerating}>
              {createPost.isPending ? (
                <>
                  <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  생성 중...
                </>
              ) : (
                '포스트 생성 및 발행'
              )}
            </Button>
          )}
        </div>
      </form>
    </Form>
  )
}

