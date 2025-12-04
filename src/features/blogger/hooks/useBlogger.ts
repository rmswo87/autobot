import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query'
import { bloggerService } from '../services'
import type { BloggerBlog, BloggerPost, CreatePostRequest, UpdatePostRequest } from '../types'

/**
 * 블로그 목록 조회 훅
 */
export function useBlogs() {
  return useQuery<BloggerBlog[]>({
    queryKey: ['blogger', 'blogs'],
    queryFn: () => bloggerService.getBlogs(),
    staleTime: 1000 * 60 * 5, // 5분간 캐시
    retry: 1,
  })
}

/**
 * 특정 블로그 조회 훅
 */
export function useBlog(blogId: string) {
  return useQuery<BloggerBlog>({
    queryKey: ['blogger', 'blog', blogId],
    queryFn: () => bloggerService.getBlog(blogId),
    enabled: !!blogId,
    staleTime: 1000 * 60 * 5,
  })
}

/**
 * 블로그 포스트 목록 조회 훅
 */
export function usePosts(blogId: string, maxResults: number = 10) {
  return useQuery<BloggerPost[]>({
    queryKey: ['blogger', 'posts', blogId, maxResults],
    queryFn: () => bloggerService.getPosts(blogId, maxResults),
    enabled: !!blogId,
    staleTime: 1000 * 60 * 2, // 2분간 캐시
  })
}

/**
 * 특정 포스트 조회 훅
 */
export function usePost(blogId: string, postId: string) {
  return useQuery<BloggerPost>({
    queryKey: ['blogger', 'post', blogId, postId],
    queryFn: () => bloggerService.getPost(blogId, postId),
    enabled: !!blogId && !!postId,
    staleTime: 1000 * 60 * 2,
  })
}

/**
 * 포스트 생성 뮤테이션 훅
 */
export function useCreatePost() {
  const queryClient = useQueryClient()

  return useMutation<BloggerPost, Error, CreatePostRequest>({
    mutationFn: (request) => bloggerService.createPost(request),
    onSuccess: (_, variables) => {
      // 블로그 포스트 목록 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['blogger', 'posts', variables.blogId] })
    },
  })
}

/**
 * 포스트 수정 뮤테이션 훅
 */
export function useUpdatePost() {
  const queryClient = useQueryClient()

  return useMutation<BloggerPost, Error, UpdatePostRequest>({
    mutationFn: (request) => bloggerService.updatePost(request),
    onSuccess: (_, variables) => {
      // 블로그 포스트 목록 및 특정 포스트 캐시 무효화
      queryClient.invalidateQueries({ queryKey: ['blogger', 'posts', variables.blogId] })
      queryClient.invalidateQueries({ queryKey: ['blogger', 'post', variables.blogId, variables.postId] })
    },
  })
}

