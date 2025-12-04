import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useBlogs, usePosts } from '../hooks'
import { bloggerOAuthService } from '../services/bloggerOAuthService'
import { CreatePostForm } from './CreatePostForm'
import { EditPostForm } from './EditPostForm'
import { AutoPostForm } from './AutoPostForm'
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/shared/components/ui/card'
import { Button } from '@/shared/components/ui/button'
import { Loader2, FileText, ExternalLink, AlertCircle, Settings, ArrowRight, LogIn, CheckCircle2, Plus, Edit2, Zap, TrendingUp, Scissors, Sparkles, RefreshCw } from 'lucide-react'
import type { BloggerPost } from '../types'

export function BloggerPage() {
  const [selectedBlogId, setSelectedBlogId] = useState<string | null>(null)
  const [hasOAuthToken, setHasOAuthToken] = useState<boolean | null>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [showCreateModal, setShowCreateModal] = useState(false)
  const [showAutoModal, setShowAutoModal] = useState(false)
  const [editingPost, setEditingPost] = useState<BloggerPost | null>(null)
  const { data: blogs, isLoading: blogsLoading, error: blogsError, refetch: refetchBlogs } = useBlogs()
  const {
    data: posts,
    isLoading: postsLoading,
    error: postsError,
    refetch: refetchPosts,
  } = usePosts(selectedBlogId || '', 10)

  // OAuth 토큰 확인
  useEffect(() => {
    const checkOAuthToken = async () => {
      try {
        const token = await bloggerOAuthService.getToken()
        setHasOAuthToken(!!token)
      } catch (error) {
        console.error('Error checking OAuth token:', error)
        setHasOAuthToken(false)
      }
    }
    checkOAuthToken()
  }, [])

  // Google OAuth 인증 시작
  const handleConnectGoogle = async () => {
    try {
      setIsConnecting(true)
      const authUrl = await bloggerOAuthService.getAuthUrl()
      window.location.href = authUrl
    } catch (error) {
      console.error('Error starting OAuth:', error)
      alert(error instanceof Error ? error.message : 'OAuth 인증을 시작할 수 없습니다.')
      setIsConnecting(false)
    }
  }

  // OAuth 연동 해제
  const handleDisconnect = async () => {
    if (!confirm('Google 계정 연동을 해제하시겠습니까?')) {
      return
    }

    try {
      await bloggerOAuthService.revokeToken()
      setHasOAuthToken(false)
      refetchBlogs()
    } catch (error) {
      console.error('Error disconnecting:', error)
      alert('연동 해제 중 오류가 발생했습니다.')
    }
  }

  if (blogsLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center space-y-4">
          <Loader2 className="h-8 w-8 animate-spin mx-auto text-muted-foreground" />
          <p className="text-muted-foreground">블로그 목록을 불러오는 중...</p>
        </div>
      </div>
    )
  }

  if (blogsError) {
    const isApiKeyMissing = blogsError instanceof Error && 
      blogsError.message.includes('API Key가 설정되지 않았습니다')
    const isOAuthRequired = blogsError instanceof Error && 
      (blogsError.message.includes('OAuth') || 
       blogsError.message.includes('Google 계정 연결') ||
       blogsError.message.includes('인증이 필요'))
    
    return (
      <div className="space-y-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">블로거</h1>
          <p className="text-muted-foreground mt-2">
            블로그를 관리하고 게시물을 작성하세요.
          </p>
        </div>
        <Card className={
          isApiKeyMissing 
            ? 'border-blue-200 bg-blue-50 dark:bg-blue-900/20' 
            : isOAuthRequired
            ? 'border-yellow-200 bg-yellow-50 dark:bg-yellow-900/20'
            : 'border-destructive'
        }>
          <CardHeader>
            <CardTitle className={`flex items-center gap-2 ${
              isApiKeyMissing 
                ? 'text-blue-900 dark:text-blue-100' 
                : isOAuthRequired
                ? 'text-yellow-900 dark:text-yellow-100'
                : 'text-destructive'
            }`}>
              <AlertCircle className="h-5 w-5" />
              {isApiKeyMissing 
                ? 'API 키가 필요합니다' 
                : isOAuthRequired
                ? 'OAuth 인증이 필요합니다'
                : '오류 발생'}
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className={`text-sm whitespace-pre-line ${
              isApiKeyMissing 
                ? 'text-blue-800 dark:text-blue-200' 
                : isOAuthRequired
                ? 'text-yellow-800 dark:text-yellow-200'
                : 'text-destructive'
            }`}>
              {blogsError instanceof Error
                ? blogsError.message
                : '블로그 목록을 불러오는데 실패했습니다.'}
            </div>
            {isApiKeyMissing ? (
              <div className="space-y-3">
                <p className="text-xs text-blue-700 dark:text-blue-300">
                  블로그 목록을 조회하려면 Google API Key가 필요합니다.
                  <br />
                  설정 페이지에서 API 키를 입력해주세요.
                </p>
                <Link to="/settings">
                  <Button className="w-full sm:w-auto gap-2">
                    <Settings className="h-4 w-4" />
                    설정 페이지로 이동
                    <ArrowRight className="h-4 w-4" />
                  </Button>
                </Link>
              </div>
            ) : isOAuthRequired ? (
              <div className="space-y-3">
                <p className="text-xs text-yellow-700 dark:text-yellow-300">
                  자신의 블로그 목록을 조회하려면 Google 계정 연결(OAuth 인증)이 필요합니다.
                  <br />
                  위의 "Google 계정 연결" 버튼을 클릭하여 인증을 진행해주세요.
                </p>
                <Button
                  onClick={handleConnectGoogle}
                  disabled={isConnecting}
                  className="w-full sm:w-auto gap-2"
                >
                  {isConnecting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      연결 중...
                    </>
                  ) : (
                    <>
                      <LogIn className="h-4 w-4" />
                      Google 계정 연결하기
                    </>
                  )}
                </Button>
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                  <CardContent className="pt-4">
                    <p className="text-xs text-blue-800 dark:text-blue-200 mb-2">
                      <strong>설정 확인:</strong>
                    </p>
                    <p className="text-xs text-blue-700 dark:text-blue-300">
                      OAuth 인증이 작동하지 않는다면 다음을 확인하세요:
                      <br />
                      1. 설정 페이지에서 Google Client ID와 Client Secret이 올바르게 입력되었는지
                      <br />
                      2. Google Cloud Console에서 리디렉션 URI가 정확히 설정되었는지
                      <br />
                      3. 설정 페이지의 API 가이드(물음표 버튼)를 참고하여 설정을 확인하세요
                    </p>
                  </CardContent>
                </Card>
              </div>
            ) : (
              <div className="space-y-3">
                <p className="text-xs text-muted-foreground">
                  설정 페이지에서 Google API Key가 올바르게 설정되었는지 확인해주세요.
                  <br />
                  브라우저 콘솔(F12)에서 상세한 에러 메시지를 확인할 수 있습니다.
                </p>
                <Link to="/settings">
                  <Button variant="outline" className="w-full sm:w-auto gap-2">
                    <Settings className="h-4 w-4" />
                    설정 확인하기
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">블로거</h1>
          <p className="text-muted-foreground mt-2">
            블로그를 관리하고 게시물을 작성하세요.
          </p>
        </div>
        <div className="flex gap-2">
          <Link to="/blogger/keyword-analyzer">
            <Button variant="outline" className="gap-2">
              <TrendingUp className="h-4 w-4" />
              키워드 분석기
            </Button>
          </Link>
          <Link to="/blogger/morpheme-analyzer">
            <Button variant="outline" className="gap-2">
              <Scissors className="h-4 w-4" />
              형태소 분석기
            </Button>
          </Link>
          <Link to="/blogger/keyword-recommendations">
            <Button variant="outline" className="gap-2">
              <Sparkles className="h-4 w-4" />
              키워드 추천
            </Button>
          </Link>
          <Link to="/blogger/reconstruct">
            <Button variant="outline" className="gap-2">
              <RefreshCw className="h-4 w-4" />
              글 재구성
            </Button>
          </Link>
        </div>
        {hasOAuthToken !== null && (
          <div className="flex items-center gap-3">
            {hasOAuthToken ? (
              <>
                <div className="flex items-center gap-2 text-green-600">
                  <CheckCircle2 className="h-5 w-5" />
                  <span className="text-sm font-medium">Google 계정 연동됨</span>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDisconnect}
                  disabled={isConnecting}
                >
                  연동 해제
                </Button>
              </>
            ) : (
              <Button
                onClick={handleConnectGoogle}
                disabled={isConnecting}
                className="gap-2"
              >
                {isConnecting ? (
                  <>
                    <Loader2 className="h-4 w-4 animate-spin" />
                    연결 중...
                  </>
                ) : (
                  <>
                    <LogIn className="h-4 w-4" />
                    Google 계정 연결
                  </>
                )}
              </Button>
            )}
          </div>
        )}
      </div>

      {/* OAuth 토큰이 없을 때 안내 */}
      {hasOAuthToken === false && !blogsLoading && (
        <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-blue-900 dark:text-blue-100">
              <AlertCircle className="h-5 w-5" />
              Google 계정 연결 필요
            </CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-blue-800 dark:text-blue-200 mb-4">
              자신의 블로그 목록을 조회하고 게시물을 작성하려면 Google 계정 연결이 필요합니다.
              <br />
              "Google 계정 연결" 버튼을 클릭하여 인증을 진행해주세요.
            </p>
            <Button
              onClick={handleConnectGoogle}
              disabled={isConnecting}
              className="gap-2"
            >
              {isConnecting ? (
                <>
                  <Loader2 className="h-4 w-4 animate-spin" />
                  연결 중...
                </>
              ) : (
                <>
                  <LogIn className="h-4 w-4" />
                  Google 계정 연결하기
                </>
              )}
            </Button>
          </CardContent>
        </Card>
      )}

      {/* 블로그 목록 */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
        {blogs && blogs.length > 0 ? (
          blogs.map((blog) => (
            <Card
              key={blog.id}
              className={`cursor-pointer transition-all hover:shadow-lg ${
                selectedBlogId === blog.id ? 'ring-2 ring-primary' : ''
              }`}
              onClick={() => setSelectedBlogId(blog.id)}
            >
              <CardHeader>
                <CardTitle className="flex items-center justify-between">
                  <span className="truncate">{blog.name}</span>
                  <FileText className="h-5 w-5 text-blue-600" />
                </CardTitle>
                <CardDescription className="line-clamp-2">
                  {blog.description || '설명이 없습니다.'}
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-muted-foreground">게시물 수</span>
                    <span className="font-medium">{blog.posts?.totalItems || 0}</span>
                  </div>
                  {blog.url && (
                    <a
                      href={blog.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      onClick={(e) => e.stopPropagation()}
                      className="flex items-center gap-2 text-sm text-primary hover:underline"
                    >
                      블로그 보기
                      <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </CardContent>
            </Card>
          ))
        ) : (
          <div className="col-span-full">
            <Card>
              <CardContent className="py-12 text-center">
                <FileText className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
                <h3 className="text-lg font-semibold mb-2">블로그가 없습니다</h3>
                <p className="text-sm text-muted-foreground mb-4">
                  Google Blogger 계정에 연결된 블로그가 없습니다.
                </p>
                <Card className="border-blue-200 bg-blue-50 dark:bg-blue-900/20">
                  <CardContent className="pt-6">
                    <div className="flex items-start gap-3">
                      <AlertCircle className="h-5 w-5 text-blue-600 dark:text-blue-400 flex-shrink-0 mt-0.5" />
                      <div className="text-left">
                        <h4 className="font-semibold text-blue-900 dark:text-blue-100 mb-1">
                          참고
                        </h4>
                        <p className="text-sm text-blue-800 dark:text-blue-200 mb-3">
                          포스트 생성 및 수정 기능은 OAuth 2.0 인증이 필요합니다.
                          <br />
                          현재는 블로그 목록 조회만 가능합니다.
                        </p>
                        <p className="text-xs text-blue-700 dark:text-blue-300">
                          Google Blogger에 블로그가 있다면, Google Cloud Console에서
                          <br />
                          Blogger API가 활성화되어 있는지 확인해주세요.
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              </CardContent>
            </Card>
          </div>
        )}
      </div>

      {/* 선택된 블로그의 포스트 목록 */}
      {selectedBlogId && (
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <div>
                <CardTitle>게시물 목록</CardTitle>
                <CardDescription>
                  {blogs?.find((b) => b.id === selectedBlogId)?.name}의 최근 게시물
                </CardDescription>
              </div>
              {hasOAuthToken && (
                <div className="flex gap-2">
                  <Button
                    onClick={() => setShowAutoModal(true)}
                    className="gap-2"
                    variant="default"
                  >
                    <Zap className="h-4 w-4" />
                    자동 생성
                  </Button>
                  <Button
                    onClick={() => setShowCreateModal(true)}
                    className="gap-2"
                    variant="outline"
                  >
                    <Plus className="h-4 w-4" />
                    수동 작성
                  </Button>
                </div>
              )}
            </div>
          </CardHeader>
          <CardContent>
            {postsLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
              </div>
            ) : postsError ? (
              <Card className="border-destructive">
                <CardContent className="pt-6">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-destructive flex-shrink-0 mt-0.5" />
                    <div>
                      <h4 className="font-semibold text-destructive mb-1">오류 발생</h4>
                      <p className="text-sm text-destructive">
                        {postsError instanceof Error
                          ? postsError.message
                          : '게시물 목록을 불러오는데 실패했습니다.'}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ) : posts && posts.length > 0 ? (
              <div className="space-y-4">
                {posts.map((post) => (
                  <div
                    key={post.id}
                    className="flex items-start justify-between p-4 border rounded-lg hover:bg-accent transition-colors"
                  >
                    <div className="flex-1">
                      <h3 className="font-semibold mb-1">{post.title}</h3>
                      <p className="text-sm text-muted-foreground line-clamp-2">
                        {post.content.replace(/<[^>]*>/g, '').substring(0, 150)}...
                      </p>
                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        {post.published && (
                          <span>발행: {new Date(post.published).toLocaleDateString('ko-KR')}</span>
                        )}
                        {post.updated && (
                          <span>수정: {new Date(post.updated).toLocaleDateString('ko-KR')}</span>
                        )}
                        {post.labels && post.labels.length > 0 && (
                          <span>태그: {post.labels.join(', ')}</span>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center gap-2 ml-4">
                      {hasOAuthToken && (
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => setEditingPost(post)}
                          title="포스트 수정"
                        >
                          <Edit2 className="h-4 w-4" />
                        </Button>
                      )}
                      {post.url && (
                        <a
                          href={post.url}
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          <Button variant="ghost" size="icon" title="블로그에서 보기">
                            <ExternalLink className="h-4 w-4" />
                          </Button>
                        </a>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-muted-foreground">
                <p className="text-sm">게시물이 없습니다.</p>
              </div>
            )}
          </CardContent>
        </Card>
      )}

      {/* 자동 생성 모달 */}
      {showAutoModal && selectedBlogId && blogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
            <CardContent className="pt-6">
              <AutoPostForm
                blog={blogs.find((b) => b.id === selectedBlogId)!}
                onSuccess={() => {
                  setShowAutoModal(false)
                  refetchPosts()
                }}
                onCancel={() => setShowAutoModal(false)}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* 수동 작성 모달 */}
      {showCreateModal && selectedBlogId && blogs && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardContent className="pt-6">
              <CreatePostForm
                blog={blogs.find((b) => b.id === selectedBlogId)!}
                onSuccess={() => {
                  setShowCreateModal(false)
                  refetchPosts()
                }}
                onCancel={() => setShowCreateModal(false)}
              />
            </CardContent>
          </Card>
        </div>
      )}

      {/* 포스트 수정 모달 */}
      {editingPost && selectedBlogId && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50">
          <Card className="w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <CardContent className="pt-6">
              <EditPostForm
                post={editingPost}
                onSuccess={() => {
                  setEditingPost(null)
                  refetchPosts()
                }}
                onCancel={() => setEditingPost(null)}
              />
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  )
}

